const chai = require("chai"),
      chaiHttp = require("chai-http"),
      expect = chai.expect,
      app = require("../server.js"),
      { Project } = require("../routes/api.js"),
      { Users } = require("../routes/auth.js")

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
      
describe("routes", function() {

  before(function(done) {
    projectData.forEach( data => {
      project = new Project(data)
      project.save(function(err, data) {
        if (err) console.log("Error saving project",err)
      })
    })
    done()
  })

  after(function(done) {
    Project.deleteMany({}, function(err) {
      if (err) console.log("Error deleting projects")
    })
    done()
  })

  describe("GET routes", function() {
    describe("GET '/pageData'", function() {
      it("should send page data", function(done) {
        chai.request(app)
          .get("/pageData")
          .end(function(err, res) {
            expect(err).to.not.be.an("error")
            expect(res.status).to.equal(200)
            expect(res.body.pageData.length).to.equal(2)
            done()
          })
      })
    })
  })
})