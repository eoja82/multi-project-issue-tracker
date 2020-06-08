// get data from database and make sure page is fully loaded before further actions
addEventListener("DOMContentLoaded", loadData)

async function loadData() {
  await loadProjectList()
  await loadIssues()
  //console.log(projects)
  pageLoaded()
}

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
    // display all project's issues
    if (x.innerHTML == "All") x.addEventListener("click", loadData)
    // display issues by project
    else x.addEventListener("click", filterByProjectName)
  })
  
  // add event listener to update / delete button
  const updateDelete = document.querySelectorAll(".updateDelete")
  updateDelete.forEach( x => x.addEventListener("click", displayModal))
}

// create a new issue
const newIssueForm = document.getElementById("newIssueForm")
newIssueForm.addEventListener("submit", addNewIssue)

function addNewIssue(e) {
  console.log(e.target.children[0].value)
  const data = e.target.children
  const sortIndex = document.getElementById("sort").options.selectedIndex
  const issues = document.getElementById("issues")

  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    //console.log(this.readyState + " " + this.status)
    if (this.readyState == 4 && this.status >= 400) {
      alert("Error: the issue was not created")
      console.log("error creating new issue")
    } 
    if (this.readyState == 4 && this.status == 200) {
      //console.log("4 and 200")
      //console.log(this.response)
      newIssueModal.style.display = "none"
      alert(this.response)
      loadData()
      newIssueForm.reset()
    }
  }
  xhttp.open("POST", "/create-or-modify-issue", true)
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(`project=${data[0].value}&issue=${data[1].value}&createdBy=${data[2].value}&assignedTo=${data[3].value}`)
  e.preventDefault()
}


// filters project issues by project
function filterByProjectName(e) {
  const sortIndex = document.getElementById("sort").options.selectedIndex
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
      pageLoaded()
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
                    <button class="updateDelete">Update / Delete</button>
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
  let issues = document.getElementById("issues")
  const issuesToSort = document.querySelectorAll(".issue")
  let selected = typeof e == "number" ? e : e.target.value
  let dates = []
  let sortedIssues = []

  issuesToSort.forEach( x => {
    // if the schema of the issue is changed this line needs to change also
    dates.push(x.childNodes[17].innerHTML)
  })
 
  if (selected == "oldest" || selected == 1) dates.sort( (a, b) => new Date(a) - new Date(b))
  if (selected == "newest" || selected == 2) dates.sort( (a, b) => new Date(b) - new Date(a))
  
  // remove duplicate dates
  dates = Array.from(new Set(dates))
  
  // populate sortedIssues with dates sorted
  for (let i = 0; i < dates.length; i++) {
    issuesToSort.forEach( x => {
      if (x.childNodes[17].innerHTML == dates[i]) {
        sortedIssues.push(x)
      }
    }) 
  }

  sortedIssues.forEach( x => {
    issues.appendChild(x)
  })
  
}