const express = require('express')
const app = express();
const mongoose = require('mongoose')
const route = require('./src/route/route')
require('dotenv').config();

app.use(express.json());

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true }, mongoose.set('strictQuery', false))
    .then(function () { console.log('mongoDB is connected') })
    .catch(function (error) { console.log(error) })

app.use('/', route)

app.listen((process.env.PORT || 3000), function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
})

