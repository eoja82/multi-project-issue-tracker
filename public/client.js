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
        let list = []
        list.push(`<li class="projectName">All</li>`)
        res.forEach( x => {
          list.push(`<li class="projectName">${x}</li>`)
        })
        projectsList.innerHTML = list.join("")
        resolve()
      }
    }
    xhttp.open("GET", "/projects", true)
    xhttp.send()
  })
  
}

function loadIssues() {
  const sortIndex = document.getElementById("sort").options.selectedIndex
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
        let allIssues = createIssuesHTML(res)
        issues.innerHTML = allIssues
        // if previously sorted by date sort by date again
        if (sortIndex > 0) sortIssues(sortIndex)
        resolve()
      }
    }
    xhttp.open("GET", "/issues", true)
    xhttp.send()
  })  
}

// page should now be loaded and can query DOM elements
function pageLoaded() {
   // filter issues by project name
  const projects = document.querySelectorAll(".projectName")
  projects.forEach( x => {
    //console.log(x.innerHTML)
    // display all project's issues
    if (x.innerHTML == "All") x.addEventListener("click", loadIssues)
    // display issues by project
    else x.addEventListener("click", filterByProjectName)
  })

  
}

// filters project issues by project
function filterByProjectName(e) {
  const sortIndex = document.getElementById("sort").options.selectedIndex
  //sort.options.selectedIndex = 0
  const issues = document.getElementById("issues")

  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status >= 400) {
      console.log("error loading issues")
    } 
    if (this.readyState == 4 && this.status == 200) {
      let res = JSON.parse(this.response)
      let allIssues = createIssuesHTML(res)
      issues.innerHTML = allIssues
      // if previously sorted by date sort by date again
      if (sortIndex > 0) sortIssues(sortIndex)
    }
  }
  xhttp.open("GET", `/projects/${e.target.innerHTML}`, true)
  xhttp.send()
}

// creates the HTML for the issues
function createIssuesHTML(res) {
  let allIssues = []
  res.forEach( x => {
    let issues = []
    x.issues.forEach( y => {
      let status = y.open ? "Open" : "Closed"
      let statusClass = y.open ? "" : "closed"
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
  return allIssues.join("")
}

// sort issues
const sort = document.getElementById("sort")
sort.addEventListener("change", sortIssues)

function sortIssues(e) {
  //console.log(typeof e)
  let selected = typeof e == "number" ? e : e.target.value
  console.log(selected)
  if (selected == "newest" || selected == 2) {
    const issues = document.getElementById("issues")
    const issuesToSort = document.querySelectorAll(".issue")
    let dates = []
    let sortedIssues = []
    issuesToSort.forEach( x => {
      dates.push(x.childNodes[17].innerHTML)
    })
    dates.sort( (a, b) => b - a)
    //console.log(dates)
    dates = Array.from(new Set(dates))
    //console.log(dates)
    for (let i = 0; i < dates.length; i++) {
      issuesToSort.forEach( x => {
        //console.log(x)
        if (x.childNodes[17].innerHTML == dates[i]) {
          sortedIssues.push(x)
        }
      })
    }
    //console.log(sortedIssues)
    while (issues.firstElementChild) {
      issues.firstElementChild.remove()
    }
    sortedIssues.forEach( x => {
      issues.appendChild(x)
    })
  }
}