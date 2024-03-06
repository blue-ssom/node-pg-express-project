const dotenv = require('./env');
dotenv.config();

const { Client } = require("pg")

const client = new Client ({
    "user" : process.env.USER,
    "password" : process.env.PASSWORD,
    "host" : process.env.HOST,
    "database" : process.env.DATABASE,
    "port" : process.env.PORT
})

module.exports = client