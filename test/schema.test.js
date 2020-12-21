const expect = require("chai").expect,
      { Project } = require("../routes/api.js"),
      { Users } = require("../routes/auth.js")

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

describe("Users Schema", function() {
  describe("Missing required fields", function() {
    it("Should be invalid if no username", function(done) {
      let User = new Users()
      const err = User.validateSync()
      expect(err.errors["username"].properties.message).to.equal("Path `username` is required.")
      done()
    })
  })

  describe("Initial defaults should be set", function() {
    it("Should set role, paswordIsHash, promptPasswordChange, userCreated", function(done) {
      let User = new Users()
      expect(User.role).to.equal("user")
      expect(User.passwordIsHash).to.equal(false)
      expect(User.promptPasswordChange).to.equal(true)
      expect(User.userCreated).to.be.a("date")
      done()
    })
  })
})