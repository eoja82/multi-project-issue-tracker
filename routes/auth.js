const mongoose = require("mongoose")
const Schema = mongoose.Schema
const bcrypt = require("bcrypt")

// to use findOneAndUpdate
mongoose.set("useFindAndModify", false)

module.exports = function(app) {
  let userSchema = new Schema({
    role: {type: String, default: "user"},
    username: {type: String, trim: true, unique: true},
    hash: String,
    passwordIsHash: {type: Boolean, default: false},
    promptPasswordChange: Boolean,
    userCreated: {type: Date, default: Date.now}
  })

  let Users = mongoose.model("Users", userSchema)

  app.route("/login")
    .post(function(req, res) {
      const username = req.body.username
      const password = req.body.password

      Users.findOne({username: username}, function(err, user) {
        if (err) {
          console.log(err)
          res.send("Error: locating username.")
        } else if (!user) {
          res.send(`${username} is not a valid username.`)
        } else if (user.promptPasswordChange) {
          console.log(`User ${username} needs to change their password.`)
          res.status(307).send("/resetpassword")
        } else if (user.passwordIsHash) {
          if (bcrypt.compareSync(password, user.hash)) {
            req.session.loggedIn = true
            console.log(req.session._id)
            res.status(307).send("/")
          } else {
            res.send("Incorrect password.")
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
            res.send("Log out successful!")
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
          res.send("New password must be different from old password.")
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
                res.send("Old password is incorrect.")
                return
              }
            }
            if (!user.passwordIsHash) {
              if (oldPassword !== user.hash) {
                res.send("Old password is incorrect.")
                return
              }
            }
            Users.findOneAndUpdate({username: username}, updates, {new: true}, function(err, user) {
              if (err) {
                console.log(err)
                res.send(`Error: password for ${username} has not been changed.`)
              } else {
                res.status(307).send(`Password successfully changed for ${username}.`)
              }
            })
          }
        })
      })

}