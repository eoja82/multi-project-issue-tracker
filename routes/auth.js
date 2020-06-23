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
      //console.log(req.body)
      const username = req.body.username
      const password = req.body.password

      Users.findOne({username: username}, function(err, user) {
        if (err) {
          console.log(err)
          res.send("Error: locating username")
        } else if (!user) {
          res.send(`${username} is not a valid username.`)
        } else if (user.promptPasswordChange) {
          console.log("user needs to change password")
          res.status(307).send("/resetpassword")
        } else if (user.passwordIsHash) {
          console.log("checking hash")
          if (bcrypt.compareSync(password, user.hash)) {
            req.session.loggedIn = true
            console.log(req.session)
            res.status(307).send("/")
          } else {
            res.send("Incorrect Password.")
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
            console.log("Logging out user.")
            res.send("Log out successful!")
          }
        })
      })

    app.route("/changepassword")
      .put(function(req, res) {
        //console.log(req.body)
        const username = req.body.username
        const oldPassword = req.body.oldPassword
        const newPassword = req.body.newPassword
        const newPasswordAgain = req.body.newPasswordAgain
        const hash = bcrypt.hashSync(newPassword, 12)
        //console.log(hash)
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
            console.log(user)
            if (user.passwordIsHash) {
              console.log("checking hash")
              console.log(bcrypt.compareSync(oldPassword, user.hash))
              if (!bcrypt.compareSync(oldPassword, user.hash)) {
                res.send("Old password is incorrect.")
                return
              }
            }
            if (!user.passwordIsHash) {
              console.log("checking password")
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
                console.log(user)
                res.status(307).send(`Password successfully changed for ${username}.`)
              }
            })
          }
        })
      })

}