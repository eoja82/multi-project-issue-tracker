const mongoose = require("mongoose")
const Schema = mongoose.Schema
const bcrypt = require("bcrypt")

// to use findOneAndUpdate
mongoose.set("useFindAndModify", false)

let userSchema = new Schema({
  role: {type: String, default: "user"},
  username: {type: String, trim: true, unique: true, required: true},
  hash: String,
  passwordIsHash: {type: Boolean, default: false},
  promptPasswordChange: {type: Boolean, default: true},
  userCreated: {type: Date, default: Date.now}
})

let Users = mongoose.model("Users", userSchema)

function auth(app) {

  app.route("/login")
    .post(function(req, res) {
      const username = req.body.username
      const password = req.body.password

      Users.findOne({username: username}, function(err, user) {
        // json response must be one of "message", "redirect", or "changePasswordPrompt"
        // to be handled by client.js
        if (err) {
          console.log(err)
          res.status(500).json({"message": `Error locating username ${username}.  Please try again.`})
        } else if (!user) {
          res.json({"message": `${username} is not a valid username.`})
        } else if (user.promptPasswordChange) {
          if (user.hash === password) {
            console.log(`User ${username} needs to change their password.`)
            res.json({"changePasswordPrompt": "You must change your password before logging in."})
          } else {
            res.json({"message": "Incorrect password."})
          }   
        } else if (user.passwordIsHash) {
          if (bcrypt.compareSync(password, user.hash)) {
            req.session.loggedIn = true
            res.json({"redirect": "/"})
          } else {
            res.json({"message": "Incorrect password."})
          }
        }
      })
    })

    app.route("/logout")
      .get(function(req, res) {
        req.session.destroy(function(err) {
          if (err) {
            console.log(err)
            res.send("Error: could not log out.")
          } else {
            res.send("/")
          }
        })
      })

    app.route("/changepassword")
      .put(function(req, res) {
        const username = req.body.username
        const oldPassword = req.body.oldPassword
        const newPassword = req.body.newPassword
        const newPasswordAgain = req.body.newPasswordAgain
        const hash = bcrypt.hashSync(newPassword, 12)
        const updates = {hash: hash, promptPasswordChange: false, passwordIsHash: true}

        if (oldPassword == newPassword) {
          res.send("New password must be different than old password.")
          return
        }
        if (newPassword !== newPasswordAgain) {
          res.send("New passwords do not match.")
          return
        }

        Users.findOne({username: username}, function(err, user) {
          if (err) {
            console.log(err)
            res.send(`Error finding username ${username}.`)
          } else if (!user) {
            res.send(`Username ${username} not found.`)
          } else {
            if (user.passwordIsHash) {
              if (!bcrypt.compareSync(oldPassword, user.hash)) {
                res.send("Current password is incorrect.")
                return
              }
            }
            if (!user.passwordIsHash) {
              if (oldPassword !== user.hash) {
                res.send("Current password is incorrect.")
                return
              }
            }
            Users.findOneAndUpdate({username: username}, updates, {new: true}, function(err, user) {
              if (err) {
                console.log(err)
                res.send(`Error: password for ${username} has not been changed.`)
              } else {
                res.status(201).send(`Password successfully changed for ${username}.`)
              }
            })
          }
        })
      })

}

module.exports = {
  Users,
  auth
}