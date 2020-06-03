const projects = require("../public/data.js")

module.exports = function(app) {
  app.route("/projects")
    .get(function (req, res) {
      let projectsList = []
      projects.forEach( x => {
        projectsList.push(x.project)
      })
      res.send(projectsList)
    })

  app.route("/issues")
  .get(function (req, res) {
    res.send(projects)
  })
}