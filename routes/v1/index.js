const express = require('express');
const router = express.Router();
const { sendResponse, sendError } = require('../../helpers/utils');
const { userSchema, loginSchema } = require('../../schemas/user.schema');
const db = require('../../dbconfig/index');
const bcrypt = require('bcrypt');
const { sign, getUserId } = require('../../services/jwt');

//Get all the users
router.get('/users', async (req, res) => {
  try{
      const user = getUserId(req.headers.authorization);
      console.log(user);
      if(!user){
        return sendError(res, { message: 'Unauthorized' });
    }else{
      /*if(user.UserRoleID == 1 && user.UserOrganizationID == 1) {*/
        const userRef = await db.pool.query(`SELECT U."Id", U."UserName", U."Name", U."EmailID", U."PhoneNumber", R."Role", O."OrganizationName" FROM public."Users" AS U
        LEFT JOIN public."Roles" AS R ON U."UserRoleID" = R."Id"
        LEFT JOIN public."Organizations" AS O ON U."UserOrganizationID" = O."Id"`)
        if (userRef.rowCount == 0) {
          return sendError(res, 'No users found');
        }
        else {
          return sendResponse(res, userRef.rows);
        }
      /*} else {
        return sendError(res, { message: 'Unauthorized' });
      }*/
    }
  }catch(error) {
      res.send(error);
  }
});

//Create New user
router.post('/users', async (req, res) => {
  try {
      const user = getUserId(req.headers.authorization);
      console.log(user);
      if(!user){
        return sendError({message: 'Unauthorized'},res);
    }else{
      const { error } = userSchema.validate(req.body);
      if (error) {
        return sendError(res, error.message);
      }
      if(user.UserRoleID == 1 && user.UserOrganizationID == 1) {
        const userRef = await db.pool.query(`SELECT * FROM public."Users" WHERE "UserName"='${req.body.UserName}'`)
        
        if (userRef.rowCount == 1) {
          return sendError(
          res,
          `${req.body.Role} User name already exists`
          );
        }
        else {
          const salt = await bcrypt.genSalt(10);
          const passwordHash = await bcrypt.hash(req.body.Password, salt);

          const { UserName, Password, UserRoleID, UserOrganizationID, Name, EmailID, PhoneNumber } = req.body;
          const userRef = await db.pool.query(`INSERT INTO public."Users" ("UserName", "Password", "UserRoleID", "UserOrganizationID", "Name", "EmailID", "PhoneNumber") VALUES ('${UserName}', '${passwordHash}', '${UserRoleID}', '${UserOrganizationID}', '${Name}', '${EmailID}', '${PhoneNumber}')`)
          return sendResponse(res, { "message": "User created successfully"});
        }
      } else {
        return sendError(res, { message: 'Unauthorized' });
      }
    }
  } catch(error) {
    res.send(error);
  }
});

//Update user
router.put('/users/:id', async (req, res, next) => {
  try {
    const user = getUserId(req.headers.authorization);
      console.log(user);
      if(!user){
        return sendError({message: 'Unauthorized'},res);
    }else{
    const { id } = req.params;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(req.body.Password, salt);
    if(user.UserRoleID == 1 && user.UserOrganizationID == 1) {
      const userRef = await db.pool.query(`UPDATE public."Users" SET "Password" = '${passwordHash}', "Name" = '${req.body.Name}', "EmailID" = '${req.body.EmailID}', "PhoneNumber" = '${req.body.PhoneNumber}' WHERE "Id"= ${id}`)
      return sendResponse(res, "Users updated sucessfully");
    } else {
      return sendError(res, { message: 'Unauthorized' });
    }
  } 
}catch (error) {
    sendError(res, error.message);
  }
});

//Delete user
router.delete('/users/:id', async (req, res, next) => {
  try {
    const user = getUserId(req.headers.authorization);
      console.log(user);
      if(!user){
        return sendError({message: 'Unauthorized'},res);
    }else{
    const { id } = req.params;
    if(user.UserRoleID == 1 && user.UserOrganizationID == 1) {
      const userRef = await db.pool.query(`DELETE FROM "public"."Users" WHERE "Id"= ${id}`)
      return sendResponse(res, "user deleted sucessfully");
    } else {
      return sendError(res, { message: 'Unauthorized' });
    }
    }
  } catch (error) {
    sendError(res, error.message);
  }
});

//Login
router.post('/login', async (req, res) => {
  try {
      const { error } = loginSchema.validate(req.body);
      if (error) {
        return sendError(res, error.message);
      }

      const userRef = await db.pool.query(`SELECT * FROM public."Users" WHERE "Users"."UserName"='${req.body.UserName}' and "Users"."Status"= true`)
      const user = userRef.rows[0];
      console.log(user)

      if (userRef.rowCount == 1) {
        const validPassword = await bcrypt.compare(req.body.Password, user.Password);
        
        if (!validPassword) {
          return sendError(res, 'Incorrect password. Please check your password and try again');
        }
        const resp = {
          token: sign({ Id: user.Id, Name: user.Name, EmailID: user.EmailID, UserRoleID: user.UserRoleID, UserOrganizationID: user.UserOrganizationID})
        };

        sendResponse(res, resp);
      }
      else {
        return sendError(
          res,
          `${req.body.UserName} User name not exists`
        );
      }
  } catch(error) {
    res.send(error);
  }
});

module.exports = router;