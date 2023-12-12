'use strict';

const Joi = require('joi');

const userSchema = Joi.object({
    UserName: Joi.string().required().messages({
        'string.base': `"UserName" should be a type of 'text'`,
        'string.empty': `"UserName" cannot be an empty field`,
        'any.required': `"UserName" is a required field`
    }),
    Password: Joi.string()
    .min(6)
    .required()
    .messages({
      'any.required': 'password is required',
      'string.min': 'password must have at least 6 characters',
    }),
    UserRoleID: Joi.string()
    .required()
    .messages({
        'any.required': 'UserRoleID is required',
    }),
    UserOrganizationID: Joi.string()
    .required()
    .messages({
        'any.required': 'UserOrganizationID is required',
    }),
    Name: Joi.string()
    .required()
    .messages({
        'any.required': 'Name is required',
    }),
    EmailID: Joi.string().email().required().messages({
        'string.base': `"email" should be a type of 'text'`,
        'string.empty': `"email" cannot be an empty field`,
        'string.email': `"email" should be a valid email address`,
        'any.required': `"email" is a required field`
    }),
    PhoneNumber: Joi.string().required().messages({
        'string.base': `"phone" should be a type of 'text'`,
        'string.empty': `"phone" cannot be an empty field`,
        'any.required': `"phone" is a required field`
    }),
});


const loginSchema = Joi.object({
    UserName: Joi.string().required().messages({
        'string.base': `"UserName" should be a type of 'text'`,
        'string.empty': `"UserName" cannot be an empty field`,
        'any.required': `"UserName" is a required field`
    }),
    Password: Joi.string()
    .min(6)
    .required()
    .messages({
      'any.required': 'password is required',
      'string.min': 'password must have at least 6 characters',
    })
  });

module.exports = { userSchema, loginSchema };