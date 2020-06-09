const projects = require("../public/data.js")
const shortid = require('shortid')
const mongoose = require("mongoose")
const Schema = mongoose.Schema

module.exports = function(app) {

  let projectSchema = new Schema ({
    _id: { type: String, default: shortid.generate },
    project: String,
    issues: [{
      _id: { type: String, default: shortid.generate },
      issue: String,
      createdBy: String,
      assignedTo: String,
      date: { type: Date, default: Date.now },
      lastUpdated: { type: Date, default: Date.now },
      open: { type: Boolean, default: true }
    }],
  })

let Project = mongoose.model("Project", projectSchema)

// used to assign number to issues
let issueNumber = 0

  // display list of project names
  app.route("/projects")
    .get(function (req, res) {
      Project.find({}).
        select("project").
        exec(function(err, data) {
          if (err) console.log(err)
          else {
            //console.log(data)
            res.send(data)
          }
        })

      // was used for testing with data.js
      /* let projectsList = []
      projects.forEach( x => {
        projectsList.push(x.project)
      })
      res.send(projectsList) */
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
      Project.find({}, function(err, data) {
        if (err) console.log(err)
        else {
          //console.log(data)
          res.send(data)
        }
      })


      // was for testing data.js
      //res.send(projects)
    })

  // modify, create, or delete issues
  app.route("/create-or-modify-issue")
    // create a new issue
    .post(function (req, res) {
      console.log(req.body)
      // check if project name already exists
      Project.findOne({project: req.body.project}, function(err, doc) {
        if (err) console.log(err)
        if (!doc) {
          console.log("project name does not already exist")
          addNewProject()
        }
        else pushNewIssue()
      })

      // if project exists, push new issue
      function pushNewIssue() {
        console.log("in push issue")
        Project.findOneAndUpdate({project: req.body.project}, 
          {$push: {
            issues: {
              issue: req.body.issue,
              createdBy: req.body.createdBy,
              assignedTo: req.body.assignedTo,
              open: true
            }
          }},
          {new: true},
          function(err, doc) {
            if (err) {
              console.log(err)
              res.send("Error: the new issue was not created!")
            } else {
              console.log("new project created")
              console.log(doc)
              res.send(`New issue for ${req.body.project} was created`)
            }
        })
      }

      // if project does not exist, create new project and issue
      function addNewProject() {
        console.log("in add new")
        let newProject = new Project({
          project: req.body.project,
          issues: [{
            issue: req.body.issue,
            createdBy: req.body.createdBy,
            assignedTo: req.body.assignedTo,
            open: true
          }]
        })
        newProject.save(function(err, doc) {
          if (err) {
            console.log(err)
            res.send("Error: the project and issue was not created!")
          } else {
            console.log("new project created")
            console.log(doc)
            res.send(`New project and issue successfully created for ${req.body.project}!`)
          }
        })
      }

      // testing with data.js data
      /* projects.push({project: req.body.project, issues: [{issue: req.body.issue, createdBy: req.body.createdBy, assignedTo: req.body.assignedTo, date: "6/7/20", lastUpdated: "6/7/20", open: true}]})
      console.log(projects)
      res.send(`New issue for ${req.body.project} was created`) */
    })

}