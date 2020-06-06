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

   app.route("/projects/:project")
    .get(function (req, res) {
      //console.log("param: " + req.params.project)
      let projectIssues = []
      projects.forEach( x => {
        if (req.params.project == x.project) {
          //console.log("pushing project")
          projectIssues.push(x)
        }
      })
      //console.log(projectIssues)
      res.send(projectIssues)
    })

  app.route("/issues")
  .get(function (req, res) {
    res.send(projects)
  })
}