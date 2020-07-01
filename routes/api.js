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

  app.route('/')
    .get(function (req, res) {
      res.sendFile(process.cwd() + '/views/index.html')
    })

  app.route("/resetpassword")
    .get(function (req, res) {
      res.sendFile(process.cwd() + "/views/resetpw.html")
    })

  // sends all issues data to render dynamicaly projects list and select tags options
  app.route("/pageData")
    .get(function (req, res) {
      Project.find({}, function(err, data) {
        if (err) console.log(err)
        else {
          res.send({pageData: data, loggedIn: req.session.loggedIn})
        }
      })
    })

  // filters issues by project name
  app.route("/projects/:project")
    .get(function (req, res) {
      const project = req.params.project == "All" ? {} : {project: req.params.project}
      Project.find(project, function(err, data) {
        if (err) {
          console.log(err)
          res.send("Error: could not filter by project name.")
        } else {
          res.send(data)
        }
      })
    })

  // filter by user created, user assigned to, and status
  app.route("/issues/filter")
    .post(function(req, res) {
      let project = req.body.project == "All" ? {} : {project: req.body.project}
      let createdBy = req.body.createdBy
      let assignedTo = req.body.assignedTo
      let open 
      switch (req.body.status) {
        case "All": open = "All"
          break
        case "Open": open = true
          break
        case "Closed": open = false
          break
      }

      Project.find(project , function(err, data) {
        if (err) {
          console.log(err)
          res.send("Error: could not filter projects.")
        } else {
          data.forEach( x => {
            let issues = []
            x.issues.forEach( y => {
              if ((y.createdBy == createdBy || createdBy == "All") &&
                (y.assignedTo == assignedTo || assignedTo == "All" || (y.assignedTo == "" && assignedTo == "Nobody")) &&
                (y.open == open || open == "All")) {
                issues.push(y)
              }
            })
            x.issues = issues
          })
          res.send(data)
        }
      })
    })

  // modify, create, or delete issues
  app.route("/create-or-modify-issue")
    // create a new issue
    .post(function (req, res) {
      // check if project name already exists
      Project.findOne({project: req.body.project}, function(err, data) {
        if (err) console.log(err)
        if (!data) {
          addNewProject()
        }
        else pushNewIssue()
      })

      // if project exists, push new issue
      function pushNewIssue() {
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
          function(err, data) {
            if (err) {
              console.log(err)
              res.send("Error: the new issue was not created!")
            } else {
              res.send(`New issue for ${req.body.project} was created`)
            }
        })
      }

      // if project does not exist, create new project and issue
      function addNewProject() {
        let newProject = new Project({
          project: req.body.project,
          issues: [{
            issue: req.body.issue,
            createdBy: req.body.createdBy,
            assignedTo: req.body.assignedTo,
            open: true
          }]
        })
        newProject.save(function(err, data) {
          if (err) {
            console.log(err)
            res.send("Error: the project and issue was not created!")
          } else {
            console.log("new project created")
            res.send(`New project and issue successfully created for ${req.body.project}!`)
          }
        })
      }
    })

    // update an issue
    .put(function(req, res) {
      let issue = req.body
      let updates = {
        "issues.$.issue": issue.issue,
        "issues.$.createdBy": issue.createdBy,
        "issues.$.assignedTo": issue.assignedTo,
        "issues.$.open": issue.close == "false" ? true : false
      }
      if (!issue.issue) delete updates["issues.$.issue"]
      if (!issue.createdBy) delete updates["issues.$.createdBy"]
      if (!issue.assignedTo) delete updates["issues.$.assignedTo"]

      // length will always be at least one due to close checkbox for Open/Closed
      if (Object.keys(updates).length <= 1) res.send("No input fields entered.")
      else {
        updates["issues.$.lastUpdated"] = new Date()
        Project.updateOne({"issues._id": req.body.id},
          {$set: updates}, function(err, data) {
            if (err) console.log(err)
            else {
              res.send(`Issue with id: ${issue.id} succesfully updated!`)
            }
          }
        )
      }
    })

    // delete an issue and delete project if it has no issues
    .delete(function(req, res) {
      let project = req.body.project
      let issueId = req.body.issueId
      
      // delete issue
      Project.findOneAndUpdate({project: project},
          {$pull: {issues: {_id: issueId}}}, {new: true}, function(err, data) {
          if (err) {
            console.log(err)
            res.send(`Error: could not delete issue ${issueId}.`)
          } else if (!data) {
            console.log("Issue to delete not found")
          } else {
            // delete project if no issues
            if (data.issues.length == 0) {   
              Project.findOneAndDelete({project: project}, function(err, data) {
                if (err) {
                  console.log(err)
                  res.send(`Error: project ${project} has no issues but could not be deleted.`)
                } else {
                  res.send(`Issue ${issueId} and project ${data.project} were successfully deleted!`)
                }
              })
            } else {
              res.send(`Issue with id: ${issueId} succesfully deleted!`)
            }
          }
        }
      )
    })

}