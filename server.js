require('dotenv').config()
const express = require("express")
const bodyParser = require("body-parser")
const apiRoutes = require("./routes/api.js")

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))

app.use("/public", express.static(process.cwd() + "/public"))

app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html')
  })

//Routing for API 
apiRoutes(app) 

//404 Not Found Middleware
app.use(function(req, res) {
  res.status(404)
    .type('text')
    .send('Not Found')
})

app.listen(process.env.PORT, () => {
  console.log("app is listening")
})