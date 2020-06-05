// get data from database and make sure page is fully loaded before further actions
(async () => {
  await loadProjectList()
  await loadIssues()
  //console.log(projects)
  pageLoaded()
})();

function loadProjectList() {
  const projectsList = document.getElementById("projectsList")
  let xhttp = new XMLHttpRequest()
  return new Promise( (resolve, reject) => {
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status >= 400) {
        console.log("error loading project names")
        reject()
      } 
      if (this.readyState == 4 && this.status == 200) {
        let res = JSON.parse(this.response)
        //console.log(typeof res)
        let list = []
        res.forEach( x => {
          list.push(`<li class="projectName">${x}</li>`)
        })
        projectsList.innerHTML = list.join("")
        //projects = document.querySelectorAll(".projectName")
        //console.log(projects)
        resolve()
      }
    }
    xhttp.open("GET", "/projects", true)
    xhttp.send()
  })
  
}

function loadIssues() {
  const issues = document.getElementById("issues")
  let xhttp = new XMLHttpRequest()
  return new Promise( (resolve, reject) => {
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status >= 400) {
        console.log("error loading issues")
        reject()
      } 
      if (this.readyState == 4 && this.status == 200) {
        let res = JSON.parse(this.response)
        //console.log(res)
        let allIssues = []
        res.forEach( x => {
          let issues = []
          x.issues.forEach( y => {
            let status = y.open ? "Open" : "Closed"
            let statusClass = y.open ? "" : "closed"
            //console.log("status " + status + " " + y.open)
            issues.push(`<div class="issue ${statusClass}">
                          <h3>${x.project}</h3>
                          <h5>Issue:</h5>
                          <p>${y.issue}</p>
                          <h5>Created by:</h5>
                          <p>${y.createdBy}</p>
                          <h5>Assigned To:</h5>
                          <p>${y.assignedTo}</p>
                          <h5>Date Created:</h5>
                          <p>${y.date}</p>
                          <h5>Last Updated</h5>
                          <p>${y.lastUpdated}</p>
                          <h5>${status}</h5>
                        </div>`)
          })
          allIssues.push(issues.join(""))
        })
        issues.innerHTML = allIssues.join("")
        resolve()
      }
    }
    xhttp.open("GET", "/issues", true)
    xhttp.send()
  })  
}

function pageLoaded() {
  const projects = document.querySelectorAll(".projectName")
  //console.log(projects)
  projects.forEach( x => {
    x.addEventListener("click", filterByProjectName)
  })

  function filterByProjectName(e) {
    console.log(e.target.innerHTML)
    let xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function() {
      console.log(this.readyState + ' ' + this.status)
      if (this.readyState == 4 && this.status == 200) {
        let res = JSON.parse(this.response)
        const issues = document.getElementById("issues")
        while (issues.firstElementChild) {
          issues.firstElementChild.remove()
        }
        let project = res.project
        let projectIssues = []
        res.issues.forEach( x => {
          let status = y.open ? "Open" : "Closed"
          let statusClass = y.open ? "" : "closed"
          issues.push(`<div class="issue ${statusClass}">
                        <h3>${project}</h3>
                        <h5>Issue:</h5>
                        <p>${x.issue}</p>
                        <h5>Created by:</h5>
                        <p>${x.createdBy}</p>
                        <h5>Assigned To:</h5>
                        <p>${x.assignedTo}</p>
                        <h5>Date Created:</h5>
                        <p>${x.date}</p>
                        <h5>Last Updated</h5>
                        <p>${x.lastUpdated}</p>
                        <h5>${status}</h5>
                      </div>`)
        })
        issues.innerHTML = projectIssues.join("")
      }
    }
    xhttp.open("GET", `/projects/${e.target.innerHTML}`, false)
    xhttp.send()
  }
}