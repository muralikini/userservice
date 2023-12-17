const express = require('express');
const cors = require('cors');
const app = express();
const env = require('dotenv');

env.config()

app.use(cors())
app.use(express.json());

app.use(express.urlencoded({extended: true}));

const routes = require('./routes/v1');

app.use('/api/v1', routes)

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
    console.log(`server is running on PORT ${PORT}`)
})
