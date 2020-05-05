if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()
app.use(express.json())

mongoose.connect(process.env.DB_URL, {useNewUrlParser:true, useUnifiedTopology:true})
const db = mongoose.connection
db.on('error', (error) => console.log("Database error: " + error))
db.once('open', () => console.log("Database connected!"))

app.get('/', (req, res) => {
    res.send("Success")
})

var server = app.listen(process.env.PORT || 3000, () => console.log('Server started, listening on port ' + server.address().port))