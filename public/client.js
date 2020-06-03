const projectsList = document.getElementById("projectsList")
const issues = document.getElementById("issues")

document.addEventListener("DOMContentLoaded", loadProjectList)
document.addEventListener("DOMContentLoaded", loadIssues)

function loadProjectList() {
  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      let res = JSON.parse(this.response)
      //console.log(typeof res)
      let list = []
      res.forEach( x => {
        list.push(`<li class="projectName">${x}</li>`)
      })
      projectsList.innerHTML = list.join("")
    }
  }
  xhttp.open("GET", "/projects", true)
  xhttp.send()
}

function loadIssues() {
  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      let res = JSON.parse(this.response)
      console.log(res)
      let allIssues = []
      res.forEach( x => {
        let issues = []
        x.issues.forEach( y => {
          issues.push(`<div class="issue">
                        <h3>Project: ${x.project}</h3>
                        <p>Issue: ${y.issue}</p>
                        <p>Created By: ${y.createdBy}</p>
                      </div>`)
        })
        allIssues.push(issues.join(""))
      })
      issues.innerHTML = allIssues.join("")
    }
  }
  xhttp.open("GET", "/issues", true)
  xhttp.send()
}

