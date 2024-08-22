const express = require("express")
const cors = require("cors")
const fs = require('fs')
const path = require('path')
const {Pool} = require('pg')
const pool = require("./database")

const app = express()

app.use(express.json())
app.use(cors())

app.get("/", (req, res) => {
    res.send("Hello world!")
})

const createTables = fs.readFileSync(path.join(__dirname, 'migrations', 'create_tables.sql'), 'utf-8')

pool.query(createTables)
    .then(result => {
        console.log('Tables successfully created.')
    })
    .catch(err => {
        console.error('An error occurred while creating tables: ', err)
    })

const port = 5000

app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})