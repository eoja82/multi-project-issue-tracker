const expect = require("chai").expect,
      { Project } = require("../routes/api.js")

describe("Project Schema", function() {
  describe("missing required fields", function() {
    it("should be invalid if no project name", function(done) {
      let PS = new Project({name: "", issues: [{issue: "Test1", createdBy: "User1"}]})
      const err = PS.validateSync()
      expect(err.errors["project"].message).to.equal("Path `project` is required.")
      done()
    })
    it("should be invalid if no issue", function(done) {
      let PS = new Project({name: "Test1", issues: [{issue: "", createdBy: "User1"}]})
      const err = PS.validateSync()
      expect(err.errors["issues.0.issue"].message).to.equal("Path `issue` is required.")
      done()
    })
    it("should be invalid if no createdBy", function(done) {
      let PS = new Project({name: "Test1", issues: [{issue: "Issue1", createdBy: ""}]})
      const err = PS.validateSync()
      expect(err.errors["issues.0.createdBy"].message).to.equal("Path `createdBy` is required.")
      done()
    })
  })

  describe("defaults should be created", function() {
    it("should set defaults: _id, issuse: [{_id, date, lastUpdated, open}]", function(done) {
      let PS = new Project({issues: [{}]})
      expect(PS._id).to.be.a("string")
      expect(PS.issues[0]._id).to.be.a("string")
      expect(PS.issues[0].date).to.be.a("date")
      expect(PS.issues[0].lastUpdated).to.be.a("date")
      expect(PS.issues[0].open).to.be.a("boolean")
      done()
    })
  })
  
})