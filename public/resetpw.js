const passwordChangeFrorm = document.getElementById("passwordChangeForm")
passwordChangeFrorm.addEventListener("submit", changePassword)

function changePassword(e) {
  const noMatch = document.getElementById("noMatch")
  let username = e.originalTarget[0].value
  let oldPassword = e.originalTarget[1].value
  let newPassword = e.originalTarget[2].value
  let newPasswordAgain = e.originalTarget[3].value

  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    //console.log(this.readyState + " " + this.status)
    if (this.readyState == 4 && this.status >= 400) {
      alert(this.response)
      console.log("error resetting password")
    } 
    if (this.readyState == 4 && this.status == 200) {
      console.log(this.response)
      noMatch.innerHTML = this.response
    }
    if (this.readyState == 4 & this.status == 307) {
      console.log(this.response)
      console.log(location.host)
      alert(this.response)
      location.assign("/")
    }
  }
  xhttp.open("PUT", "/changepassword", true)
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(`username=${username}&oldPassword=${oldPassword}&newPassword=${newPassword}&newPasswordAgain=${newPasswordAgain}`)
  e.preventDefault()
}