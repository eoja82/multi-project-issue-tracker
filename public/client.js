let loggedIn
const login = document.getElementById("login")
const projectsList = document.getElementById("projectsList")
const filterCreatedBy = document.getElementById("filterCreatedBy")
const filterAssignedTo = document.getElementById("filterAssignedTo")
const issues = document.getElementById("issues")
const filterStatus = document.getElementById("filterStatus")

// get data from database and make sure page is fully loaded before further actions
addEventListener("DOMContentLoaded", loadData)

async function loadData() {
  // need to remove element children if any so lists don't append onto existing element children
  const listsToReset = [filterCreatedBy, filterAssignedTo, projectsList]
  listsToReset.forEach( x => {
    while (x.firstElementChild) x.firstElementChild.remove()
  })

  await loadPageData()
  pageLoaded()
  filterCreatedBy.selectedIndex = 0
  filterAssignedTo.selectedIndex = 0
  filterStatus.selectedIndex = 0
}

function loadPageData() {
  const sortIndex = document.getElementById("sortDateCreated").options.selectedIndex
  
  let xhttp = new XMLHttpRequest()
  return new Promise( (resolve, reject) => {
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status >= 400) {
        console.log("error loading issues")
        reject()
      } 
      if (this.readyState == 4 && this.status == 200) {
        const res = JSON.parse(this.response)
        loggedIn = res.loggedIn
        const pageData = res.pageData

        // display issues
        let allIssues = createIssuesHTML(pageData)
        issues.innerHTML = allIssues

        // if previously sorted by date sort by date again
        if (sortIndex > 0) sortByDate(sortIndex)

        // add element children to projects list and select tags for created by and assigned to
        let createdBy = []
        let assignedTo = []
        let listOfProjects = []
        pageData.forEach ( x => {
          listOfProjects.push(x.project)
          x.issues.forEach( y => {
            if (createdBy.indexOf(y.createdBy) < 0) createdBy.push(y.createdBy)
            if (assignedTo.indexOf(y.assignedTo) < 0) assignedTo.push(y.assignedTo)
          })
        })
        listOfProjects.sort( (a, b) => a > b)
        listOfProjects.unshift("All")
        createdBy.unshift("All")
        assignedTo.unshift("All")
        listOfProjects.forEach( x => {
          let li = document.createElement("li")
          li.textContent = x
          li.className = "projectName"
          if (x == "All") li.classList.add("projectActive")
          projectsList.appendChild(li)
        })
        
        createdBy.forEach( x => {
          let option = createOption(x)
          filterCreatedBy.appendChild(option)
        })

        assignedTo.forEach( x => {
          if (x == "") x = "Nobody"
          let option = createOption(x)
          filterAssignedTo.appendChild(option)
        })

        function createOption(user) {
          const option = document.createElement("option")
          option.value = user
          option.textContent = user
          return option
        }
        resolve()
      }
    }
    xhttp.open("GET", "/pageData", true)
    xhttp.send()
  })  
}

// page should now be loaded and can query DOM elements
function pageLoaded() {
  // filter issues by project name
  const projects = document.querySelectorAll(".projectName")
  projects.forEach( x => {
    x.addEventListener("click", filterByProjectName)
  })
  
  // add event listener to update / delete button
  const updateDelete = document.querySelectorAll(".updateDelete")
  updateDelete.forEach( x => x.addEventListener("click", displayModal))

  // add event listener to log in and log out, set button text
  const newIssueForm = document.getElementById("newIssueForm")
  const createNewIssueNotAllowed = document.getElementById("createNewIssue")
  const modifyIssueForm = document.getElementById("modifyIssueForm")
  const modifyIssueNotAllowed = document.getElementById("modifyIssue")
  const deleteIssueForm = document.getElementById("deleteIssueForm")
  const deleteIssueNotAllowed = document.getElementById("deleteIssue")
  if (loggedIn) {
    login.innerHTML = "Log Out"
    login.style.color = "rgb(190, 190, 190)"
    login.addEventListener("click", logoutUser)
    newIssueForm.addEventListener("submit", addNewIssue)
    modifyIssueForm.addEventListener("submit", modifyIssue)
    deleteIssueForm.addEventListener("submit", deleteIssue)
  } else {
    login.innerHTML = "Log In"
    login.style.color = "rgb(31, 201, 88)"
    login.addEventListener("click", displayModal)
    createNewIssueNotAllowed.addEventListener("click", notAllowed)
    modifyIssueNotAllowed.addEventListener("click", notAllowed)
    deleteIssueNotAllowed.addEventListener("click", notAllowed)
  }
}

function notAllowed() {
  alert("You must be logged in to create, update, or delele issues.")
}

// login user
const loginForm = document.getElementById("loginForm")
loginForm.addEventListener("submit", loginUser, true)

function loginUser(e) {
  const username = e.target.elements[0].value
  const password = e.target.elements[1].value
  const xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status >= 400) {
      alert(this.response)
      console.log("error logging in")
    } 
    if (this.readyState == 4 && this.status == 200) {
      alert(this.response)
    }
    if (this.readyState == 4 && this.status == 201) {
      location.assign(`${this.response}`)
    }
  }
  xhttp.open("POST", "/login", true)
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
  xhttp.send(`username=${username}&password=${password}`)
  e.preventDefault()
}

// log out user
function logoutUser(e) {
  const xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status >= 400) {
      alert(this.response)
      console.log("error logging out")
    } 
    if (this.readyState == 4 && this.status == 200) {
      alert(this.response)
      location.assign("/")
    }
  }
  xhttp.open("GET", "/logout", true)
  xhttp.send()
  e.preventDefault()
}

// create a new issue
function addNewIssue(e) {
  const data = e.target.children

  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status >= 400) {
      alert(this.response)
      console.log("Error creating new issue.")
    } 
    if (this.readyState == 4 && this.status == 200) {
      newIssueModal.style.display = "none"
      alert(this.response)
      loadData()
      newIssueForm.reset()
    }
  }
  xhttp.open("POST", "/create-or-modify-issue", true)
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(`project=${data[0].value.trim()}&issue=${data[1].value}&createdBy=${data[2].value.trim()}&assignedTo=${data[3].value.trim()}`)
  e.preventDefault()
}

// update an issue
function modifyIssue(e) {
  const data = e.target.children

  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status >= 400) {
      alert(this.response)
      console.log("Error updating issue.")
    } 
    if (this.readyState == 4 && this.status == 200) {
      modifyModal.style.display = "none"
      alert(this.response)
      loadData()
    }
  }
  xhttp.open("PUT", "/create-or-modify-issue", true)
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(`project=${data[0].value.trim()}&issue=${data[1].value}&createdBy=${data[2].value.trim()}&assignedTo=${data[3].value.trim()}&id=${data[4].value}&close=${data[5].firstElementChild.checked}`)
  e.preventDefault()
}

// delete an issue
function deleteIssue(e) {
  const data = e.target.children

  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status >= 400) {
      alert(this.response)
      console.log("error updating issue")
    } 
    if (this.readyState == 4 && this.status == 200) {
      modifyModal.style.display = "none"
      alert(this.response)
      loadData()
    }
  }
  xhttp.open("DELETE", "/create-or-modify-issue", true)
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(`project=${data[0].value}&issueId=${data[1].value}`)
  e.preventDefault()
}

// filters project issues by project
function filterByProjectName(e) {
  const projectNames = document.querySelectorAll(".projectName")
  projectNames.forEach( x => {
    x.classList.remove("projectActive")
  })
  e.target.classList.add("projectActive")

  const sortIndex = document.getElementById("sortDateCreated").options.selectedIndex

  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status >= 400) {
      alert(this.response)
    } 
    if (this.readyState == 4 && this.status == 200) {
      let res = JSON.parse(this.response)
      let allIssues = createIssuesHTML(res)
      issues.innerHTML = allIssues
      // if previously sorted by date sort by date again
      if (sortIndex > 0) sortByDate(sortIndex)
      pageLoaded()
      document.getElementById("filterCreatedBy").selectedIndex = 0
      document.getElementById("filterAssignedTo").selectedIndex = 0
      document.getElementById("filterStatus").selectedIndex = 0
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
                    <h5>Last Updated:</h5>
                    <p>${y.lastUpdated}</p>
                    <h5>Status:</h5>
                    <p>${status}</p>
                    <h5>Issue Id:</h5>
                    <p>${y._id}</p>
                    <button class="updateDelete">Update / Delete</button>
                  </div>`)
    })
    allIssues.push(issues.join(""))
  })
  return allIssues.join("")
}

// sort issues
const sortDateCreated = document.getElementById("sortDateCreated")
sortDateCreated.addEventListener("change", sortByDate)

function sortByDate(e) {
  let issues = document.getElementById("issues")
  const issuesToSort = document.querySelectorAll(".issue")
  let selected = typeof e == "number" ? e : e.target.options.selectedIndex
  let sortBy = selected <= 2 ? "dateCreated" : "dateUpdated"
  let dates = []
  let sortedIssues = []

  issuesToSort.forEach( x => {
    // if the schema of the issue is changed this line needs to change also
    if (sortBy == "dateCreated") dates.push(x.childNodes[17].innerHTML)
    if (sortBy == "dateUpdated") dates.push(x.childNodes[21].innerHTML)
  })
 
  if (selected == 1 || selected == 3) dates.sort( (a, b) => new Date(a) - new Date(b))
  if (selected == 2 || selected == 4) dates.sort( (a, b) => new Date(b) - new Date(a))
  
  // remove duplicate dates
  dates = Array.from(new Set(dates))
  
  // populate sortedIssues with dates sorted
  for (let i = 0; i < dates.length; i++) {
    issuesToSort.forEach( x => {
      if (sortBy == "dateCreated") {
        if (x.childNodes[17].innerHTML == dates[i]) {
          sortedIssues.push(x)
        }
      }
      if (sortBy == "dateUpdated") {
        if (x.childNodes[21].innerHTML == dates[i]) {
          sortedIssues.push(x)
        }
      }
    }) 
  }

  sortedIssues.forEach( x => {
    issues.appendChild(x)
  })
}

// filter by user created, user assigned to, and status
const filterForm = document.getElementById("filterForm")
filterForm.addEventListener("change", filterIssues)

function filterIssues(e) {
  const sortIndex = document.getElementById("sortDateCreated").options.selectedIndex
  const project = document.querySelector(".projectActive").innerHTML
  const createdBy = document.getElementById("filterCreatedBy").selectedOptions[0].value
  const assignedTo = document.getElementById("filterAssignedTo").selectedOptions[0].value
  const status = document.getElementById("filterStatus").selectedOptions[0].value

  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status >= 400) {
      alert(this.response)
      console.log("error updating issue")
    } 
    if (this.readyState == 4 && this.status == 200) {
      let res = JSON.parse(this.response)
      let allIssues = createIssuesHTML(res)
      issues.innerHTML = allIssues
      // if previously sorted by date sort by date again
      if (sortIndex > 0) sortByDate(sortIndex)
      pageLoaded()
    }
  }
  xhttp.open("POST", "/issues/filter", true)
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(`project=${project}&createdBy=${createdBy}&assignedTo=${assignedTo}&status=${status}`)
  e.preventDefault()
}

// projects drop down list for small screen 
const projectsArrow = document.querySelector(".projectsArrow")
const projectsTitle = document.getElementById("projectsTitle")
let width = window.innerWidth

addEventListener("resize", resetWidth)
// for mobile firefox and chrome
addEventListener("orientationchange", resetWidth)

function resetWidth() {
  width = window.innerWidth
  if (width <= 440) {
    projectsArrow.style.display = "inline"
    projectsArrow.classList.replace("fa-chevron-up", "fa-chevron-down")
    projectsList.style.visibility = "hidden"
    projectsList.style.height = "0"
    projectsTitle.addEventListener("click", displayProjectsList)
  } else {
    projectsArrow.style.display = "none"
    projectsList.style.visibility = "visible"
    projectsList.style.height = "auto"
    projectsTitle.removeEventListener("click", displayProjectsList)
  } 
}

resetWidth()

function displayProjectsList() {
  const projectNames = document.querySelectorAll(".projectName")
  projectsList.style.visibility = "visible"
  projectsList.style.height = "300px"
  projectsArrow.classList.replace("fa-chevron-down", "fa-chevron-up")
  projectsTitle.removeEventListener("click", displayProjectsList)
  projectsTitle.addEventListener("click", closeProjectsList)
  projectNames.forEach( x => {
    x.addEventListener("click", closeProjectsList)
  })
}

function closeProjectsList() {
  const projectNames = document.querySelectorAll(".projectName")
  projectsList.style.visibility = "hidden"
  projectsList.style.height = "0"
  projectsArrow.classList.replace("fa-chevron-up", "fa-chevron-down")
  projectsTitle.removeEventListener("click", closeProjectsList)
  projectNames.forEach( x => {
    x.removeEventListener("click", closeProjectsList)
  })
  projectsTitle.addEventListener("click", displayProjectsList)
}

