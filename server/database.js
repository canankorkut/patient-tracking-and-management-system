const {Pool} = require('pg')
const dotenv = require('dotenv')
const path = require('path')


dotenv.config({
    path: path.join(__dirname, '.env')
})

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
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