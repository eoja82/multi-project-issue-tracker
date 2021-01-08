const chai = require("chai"),
      chaiHttp = require("chai-http"),
      expect = chai.expect,
      app = require("../server.js"),
      { Users } = require("../routes/auth.js")
      
require('dotenv').config()

const valid = {username: "username", hash: "password"}
const notValid = {username: "Bad Name", hash: "notValid"}
newPassword = "newPassword"

chai.use(chaiHttp)

if (process.env.TEST) {
  let agent

  before(function(done) {
    let user = new Users(valid)
    user.save(function(err) {
      if (err) console.log("Error saving project", err)
    })
    agent = chai.request.agent(app)
    done()
  })

  after(function(done) {
    agent.close()
    done()
  })

  describe("auth routes", function() {
    describe("POST /login password is not a hash", function() {
      it("should not login invalid username", function(done) {
        agent
          .post("/login")
          .type("form")
          .send({
            username: notValid.username,
            password: notValid.hash
          })
          .end(function(err, res) {
            expect(err).to.not.be.an("error")
            expect(res.status).to.equal(200)
            expect(res.text).to.equal(`${notValid.username} is not a valid username.`)
            done()
          })
      })
      it("should prompt password change", function(done) {
        agent
          .post("/login")
          .type("form")
          .send({
            username: valid.username,
            password: valid.hash
          })
          .end(function(err, res) {
            expect(err).to.not.be.an("error")
            expect(res.status).to.equal(201)
            expect(res.text).to.equal("/resetpassword")
            done()
          })
      })
      it("should not prompt password change if invalid password", function(done) {
        agent
          .post("/login")
          .type("form")
          .send({
            username: valid.username,
            password: notValid.password
          })
          .end(function(err, res) {
            expect(err).to.not.be.an("error")
            expect(res.status).to.equal(200)
            expect(res.text).to.equal("Incorrect password.")
            done()
          })
      })
    })
    describe("PUT /change password", function() {
      it("should check oldPassword !== newPassword", function(done) {
        agent
          .put("/changepassword")
          .type("form")
          .send({
            username: valid.username,
            oldPassword: valid.hash,
            newPassword: valid.hash,
            newPasswordAgain: valid.hash
          })
          .end(function(err, res) {
            expect(err).to.not.be.an("error")
            expect(res.status).to.equal(200)
            expect(res.text).to.equal("New password must be different from old password.")
            done()
          })
      })
      it("should check newPassword === newPasswordAgain", function(done) {
        agent
          .put("/changepassword")
          .type("form")
          .send({
            username: valid.username,
            oldPassword: valid.hash,
            newPassword: newPassword,
            newPasswordAgain: valid.hash
          })
          .end(function(err, res) {
            expect(err).to.not.be.an("error")
            expect(res.status).to.equal(200)
            expect(res.text).to.equal("New passwords do not match.")
            done()
          })
      })
      it("should respond if username is wrong", function(done) {
        agent
          .put("/changepassword")
          .type("form")
          .send({
            username: notValid.username,
            oldPassword: valid.hash,
            newPassword: newPassword,
            newPasswordAgain: newPassword
          })
          .end(function(err, res) {
            expect(err).to.not.be.an("error")
            expect(res.status).to.equal(200)
            expect(res.text).to.equal(`Username ${notValid.username} not found.`)
            done()
          })
      })
      it("should not change password if password is wrong and not hashed", function(done) {
        agent
          .put("/changepassword")
          .type("form")
          .send({
            username: valid.username,
            oldPassword: notValid.hash,
            newPassword: newPassword,
            newPasswordAgain: newPassword
          })
          .end(function(err, res) {
            expect(err).to.not.be.an("error")
            expect(res.status).to.equal(200)
            expect(res.text).to.equal("Old password is incorrect.")
            done()
          })
      })
      it("should change password when not hashed", function(done) {
        agent
          .put("/changepassword")
          .type("form")
          .send({
            username: valid.username,
            oldPassword: valid.hash,
            newPassword: newPassword,
            newPasswordAgain: newPassword
          })
          .end(function(err, res) {
            expect(err).to.not.be.an("error")
            expect(res.status).to.equal(201)
            expect(res.text).to.equal(`Password successfully changed for ${valid.username}.`)
            done()
          })
      })
      it("should not change password if password is wrong and hashed", function(done) {
        agent
          .put("/changepassword")
          .type("form")
          .send({
            username: valid.username,
            oldPassword: notValid.hash,
            newPassword: newPassword,
            newPasswordAgain: newPassword
          })
          .end(function(err, res) {
            expect(err).to.not.be.an("error")
            expect(res.status).to.equal(200)
            expect(res.text).to.equal("Old password is incorrect.")
            done()
          })
      })
      it("should change password when hashed", function(done) {
        agent
          .put("/changepassword")
          .type("form")
          .send({
            username: valid.username,
            oldPassword: newPassword,
            newPassword: valid.hash,
            newPasswordAgain: valid.hash
          })
          .end(function(err, res) {
            expect(err).to.not.be.an("error")
            expect(res.status).to.equal(201)
            expect(res.text).to.equal(`Password successfully changed for ${valid.username}.`)
            done()
          })
      })
    })
    describe("POST /login password is a hash", function() {
      it("should not log in with incorrect password", function(done) {
        agent
          .post("/login")
          .type("form")
          .send({
            username: valid.username,
            password: notValid.hash
          })
          .end(function(err, res) {
            expect(err).to.not.be.an("error")
            expect(res.status).to.equal(200)
            expect(res.text).to.equal("Incorrect password.")
            done()
          })
      })
      it("should log in", function(done) {
        agent
          .post("/login")
          .type("form")
          .send({
            username: valid.username,
            password: valid.hash
          })
          .end(function(err, res) {
            expect(err).to.not.be.an("error")
            expect(res.status).to.equal(201)
            expect(res.text).to.equal("/")
            done()
          })
      })
    })
  })

}