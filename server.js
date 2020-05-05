if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const mongoose = require('mongoose')

const Auth = require('./models/auth')

const app = express()
app.use(express.json())

mongoose.connect(process.env.DB_URL, {useNewUrlParser:true, useUnifiedTopology:true})
const db = mongoose.connection
db.on('error', (error) => console.log("Database error: " + error))
db.once('open', () => console.log("Database connected!"))

const loginRouter = require('./routes/login')
app.use('/', loginRouter)

const tokensRouter = require('./routes/token')
app.use('/token', tokensRouter.router)


app.use(function(req, res, next){
    res.status(404).json({message: "This is not a valid route!"});
  })

var server = app.listen(process.env.PORT || 4000, () => console.log('Server started, listening on port ' + server.address().port))