const chai = require("chai"),
      chaiHttp = require("chai-http"),
      expect = chai.expect,
      app = require("../server.js"),
      { Users } = require("../routes/auth.js")
      
require('dotenv').config()

const valid = {username: "username", hash: "password"}
const notValid = {username: "Bad Name", hash: "notValid"}

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
    describe("POST /login", function() {
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
      it("should not login invalid password", function(done) {
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
      /* it("should not login invalid password", function(done) {
        agent
          .post("/login")
          .type("form")
          .send({
            username: valid.username,
            password: notValid.password
          })
          .end(function(err, res) {

            done()
          })
      }) */
    })
  })

}