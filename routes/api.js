const projects = require("../public/data.js")

module.exports = function(app) {

  // display list of project names
  app.route("/projects")
    .get(function (req, res) {
      let projectsList = []
      projects.forEach( x => {
        projectsList.push(x.project)
      })
      res.send(projectsList)
    })

  // filters issues by project name
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

  // sends all issues  
  app.route("/issues")
    .get(function (req, res) {
      res.send(projects)
    })

  // modify, create, or delete issues
  app.route("/create-or-modify-issue")
    // create a new issue
    .post(function (req, res) {
      //console.log(req.body)
      projects.push({project: req.body.project, issues: [{issue: req.body.issue, createdBy: req.body.createdBy, assignedTo: req.body.assignedTo, date: "6/7/20", lastUpdated: "6/7/20", open: true}]})
      console.log(projects)
      res.send(`New issue for ${req.body.project} was created`)
    })

}