const express = require("express")
const cors = require("cors")
const pool = require("./database")
const app = express()

app.use(express.json())
app.use(cors())

app.get("/", (reg, res) => {
    res.send("Hello world!")
})

const port = 5000

app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})