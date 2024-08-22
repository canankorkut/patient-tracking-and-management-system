const {Pool} = require('pg')
const dotenv = require('dotenv')
const path = require('path')


dotenv.config({
    path: path.join(__dirname, '.env')
})

const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT
})

const runQuery = async () => {
    try {
        const res = await pool.query('SELECT NOW()')
        console.log('Current time:', res.rows[0])
    } catch (err) {
        console.error('Query error:', err)
    }
}

runQuery() 

module.exports = pool