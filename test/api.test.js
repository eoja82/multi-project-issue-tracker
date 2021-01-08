const chai = require("chai"),
      chaiHttp = require("chai-http"),
      expect = chai.expect,
      app = require("../server.js"),
      { Project } = require("../routes/api.js")
      
require('dotenv').config()

chai.use(chaiHttp)

const projectData = [
  {
    project: "Test 1",
    issues: [{
      issue: "Issue 1",
      createdBy: "User 1"
    }]
  },
  {
    project: "Test 2",
    issues: [{
      issue: "Issue 2",
      createdBy: "User 2"
    }]
  }
]
      
if (process.env.TEST) {
  let requester

  before(function(done) {
    projectData.forEach( data => {
      let project = new Project(data)
      project.save(function(err) {
        if (err) console.log("Error saving project", err)
      })
    })
    requester = chai.request(app).keepOpen()
    done()
  })

  after(function(done) {
    requester.close()
    done()
  })
  
  describe("api routes", function() {
    describe("GET routes", function() { 
      describe("GET /", function() {
        it("should get HTML", function(done) {
          requester
            .get("/")
            .end(function(err, res) {
              expect(err).to.not.be.an("error")
              expect(res.status).to.equal(200)
              expect(res).to.be.html
              done()
            })
        })
      })
      describe("GET /resetpassword", function() {
        it("should get HTML", function(done) {
          requester
            .get("/resetpassword")
            .end(function(err, res) {
              expect(err).to.not.be.an("error")
              expect(res.status).to.equal(200)
              expect(res).to.be.html
              done()
            })
        })
      })
      describe("GET /pageData", function() {
        it("should send page data", function(done) {
          requester
            .get("/pageData")
            .end(function(err, res) {
              expect(err).to.not.be.an("error")
              expect(res.status).to.equal(200)
              expect(res.body.pageData.length).to.equal(2)
              done()
            })
        })
      })
      describe("GET /projects/:project", function() {
        it("should get one project", function(done) {
          requester
            .get(`/projects/${projectData[0].project}`)
            .end(function(err, res) {
              expect(err).to.not.be.an("error")
              expect(res.status).to.equal(200)
              expect(res.body.length).to.equal(1)
              done()
            })
        })
      })
    })

    describe("POST routes", function() {
      describe("POST /create-or-modify-issue", function() {
        it("should create a new issue for existing project", function(done) {
          requester
            .post("/create-or-modify-issue")
            .type("form")
            .send({
              project: projectData[0].project,
              issue: "A second issue.",
              createdBy: "User 1"
            })
            .end(function(err, res) {
              expect(err).to.not.be.an("error")
              expect(res.status).to.equal(200)
              expect(res.text).to.equal(`New issue for ${projectData[0].project} was created!`)
              done()
            })
        })
        it("should create new project and issue", function(done) {
          requester
            .post("/create-or-modify-issue")
            .type("form")
            .send({
              project: "New Project",
              issue: "New issue.",
              createdBy: "User 1"
            })
            .end(function(err, res) {
              expect(err).to.not.be.an("error")
              expect(res.status).to.equal(200)
              expect(res.text).to.equal(`New project and issue successfully created for New Project!`)
              done()
            })
        })
      })
      describe("POST /issues/filter", function() {
        it("should filter issues", function(done) {
          let issueCount = 0
          requester
            .post("/issues/filter")
            .type("form")
            .send({
              project: "All",
              createdBy: "User 2",
              assignedTo: "All",
              status: "All"
            })
            .end(function(err, res) {
              expect(err).to.not.be.an("error")
              expect(res.status).to.equal(200)
              res.body.forEach( x => issueCount += x.issues.length)
              expect(issueCount).to.equal(1)
              done()
            })
        })
      })
    })
    describe("PUT routes", function() {
      describe("PUT /create-or-modify-issue", function() {
        it("should update an issue", async function() {
          let issueId

          await Project.find({project: projectData[0].project}, function(err, data) {
            if (err) {
              console.log(err)
            } else {
              issueId = data[0].issues[0]._id
            }
          })
          
          return requester
            .put("/create-or-modify-issue")
            .type("form")
            .send({
              project: projectData[0].project,
              issue: projectData[0].issues[0].issue,
              createdBy: projectData[0].issues[0].createdBy,
              id: issueId,
              close: true
            })
            .then(function(res) {
              expect(res.status).to.equal(200)
              expect(res.text).to.equal(`Issue with id: ${issueId} succesfully updated!`)
            })
        })
      })
    })
    describe("DELETE routes", function() {
      describe("DELETE /create-or-modify-issue", function() {
        let project = projectData[0].project,
            firstIssueId,
            secondIssueId
        
        it("should delete an issue", async function() {
          await Project.find({project: project}, function(err, data) {
            if (err) {
              console.log(err)
            } else {
              firstIssueId = data[0].issues[0]._id
              secondIssueId = data[0].issues[1]._id
            }
          })
          return requester
            .delete("/create-or-modify-issue")
            .type("form")
            .send({
              project: project,
              issueId: firstIssueId
            })
            .then(function(res) {
              expect(res.status).to.equal(200)
              expect(res.text).to.equal(`Issue with id: ${firstIssueId} successfully deleted!`)
            })
        })
        it("should delete issue and project if no issues", function(done) {
          requester
            .delete("/create-or-modify-issue")
            .type("form")
            .send({
              project: project,
              issueId: secondIssueId
            })
            .end(function(err, res) {
              expect(err).to.not.be.an("error")
              expect(res.status).to.equal(200)
              expect(res.text).to.equal(`Issue ${secondIssueId} and project ${project} were successfully deleted!`)
              done()
            })
        })
      })
    })
  })
  
}