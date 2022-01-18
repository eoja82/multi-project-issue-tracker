let loggedIn
const login = document.getElementById("login")
const filterProject = document.getElementById("filterProject")
const filterCreatedBy = document.getElementById("filterCreatedBy")
const filterAssignedTo = document.getElementById("filterAssignedTo")
const filterReset = document.getElementById("filterReset")
const issues = document.getElementById("issues")
const filterStatus = document.getElementById("filterStatus")

// get data from database and make sure page is fully loaded before further actions
addEventListener("DOMContentLoaded", loadData)

async function loadData() {
  // need to remove element children if any so lists don't append onto existing element children
  const listsToReset = [filterCreatedBy, filterAssignedTo, filterProject]
  listsToReset.forEach( x => {
    while (x.firstElementChild) x.firstElementChild.remove()
  })

  await loadPageData()
  pageLoaded()
  filterProject.selectedIndex = 0
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
        listOfProjects.forEach( x => {
          let option = createOption(x)
          filterProject.appendChild(option)
        })

        createdBy.unshift("All")
        createdBy.forEach( x => {
          let option = createOption(x)
          filterCreatedBy.appendChild(option)
        })

        assignedTo.unshift("All")
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
  // add event listener to update / delete button
  const updateDelete = document.querySelectorAll(".updateDelete")
  updateDelete.forEach( x => x.addEventListener("click", displayModal))

  // add event listeners to update and delete forms for logged in vs logged out
  // show and hide log in and log out buttons add event listener to log out
  const accountDropdown = document.getElementById("accountDropdown")
  const loginButton = document.getElementById("loginButton")
  const logoutButton = document.getElementById("logoutButton")
  const newIssueForm = document.getElementById("newIssueForm")
  const newIssueSubmit = document.getElementById("newIssueSubmit")
  const updateIssueForm = document.getElementById("updateIssueForm")
  const updateIssueSubmit = document.getElementById("updateIssueSubmit")
  const deleteIssueForm = document.getElementById("deleteIssueForm")
  const deleteIssueNotAllowed = document.getElementById("deleteIssueSubmit")
  if (loggedIn) {
    loginButton.style.display = "none"
    accountDropdown.style.display = "block"
    logoutButton.addEventListener("click", logoutUser)
    newIssueForm.addEventListener("submit", addNewIssue)
    updateIssueForm.addEventListener("submit", updateIssue)
    deleteIssueForm.addEventListener("submit", deleteIssue)
  } else {
    loginButton.style.display = "block"
    accountDropdown.style.display = "none"
    newIssueSubmit.addEventListener("click", notAllowed)
    updateIssueSubmit.addEventListener("click", notAllowed)
    deleteIssueNotAllowed.addEventListener("click", notAllowed)
  }
}

function notAllowed(e) {
  alert("You must be logged in to create, update, or delele issues.")
  e.preventDefault()
}

// login user
const loginForm = document.getElementById("loginForm")
loginForm.addEventListener("submit", loginUser, true)

function loginUser(e) {
  const username = document.getElementById("loginUsername").value
  const password = document.getElementById("loginPassword").value
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
      location.assign(this.response)
    }
  }
  xhttp.open("GET", "/logout", true)
  xhttp.send()
  e.preventDefault()
}

// change user password
const noMatch = document.getElementById("noMatch")
const changePasswordSubmit = document.getElementById("changePasswordSubmit")
const newPassword = document.getElementById("newPassword")
const confirmPassword = document.getElementById("confirmPassword")
const newPasswords = document.querySelectorAll(".newPassword")
newPasswords.forEach( x => x.addEventListener("input", checkNewPasswords))

function checkNewPasswords(e) {
  if (newPassword.value === confirmPassword.value) {
    changePasswordSubmit.disabled = false
    noMatch.style.visibility = "hidden"
  } else {
    changePasswordSubmit.disabled = true
    noMatch.style.visibility = "visible"
    noMatch.innerHTML = "New password does not match."
  }
}

const changePasswordForm = document.getElementById("changePasswordForm")
changePasswordForm.addEventListener("submit", changePassword)

function changePassword(e) {
  const noMatch = document.getElementById("noMatch")
  const username = document.getElementById("changePasswordUsername").value
  const currentPassword = document.getElementById("currentPassword").value
  const newPassword = document.getElementById("newPassword").value
  const confirmPassword = document.getElementById("confirmPassword").value
  
  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status >= 400) {
      alert(this.response)
      console.log("Error resetting password.")
    } 
    if (this.readyState == 4 && this.status == 200) {
      console.log(this.response)
      noMatch.style.visibility = "visible"
      noMatch.innerHTML = this.response
    }
    if (this.readyState == 4 & this.status == 201) {
      alert(this.response)
      document.getElementById("closeChangePasssword").click()
    }
  }
  xhttp.open("PUT", "/changepassword", true)
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(`username=${username}&oldPassword=${currentPassword}&newPassword=${newPassword}&newPasswordAgain=${confirmPassword}`)
  e.preventDefault()
}

// create a new issue
function addNewIssue(e) {
  const project = document.getElementById("newProject").value.trim()
  const issue = document.getElementById("newIssue").value
  const createdBy = document.getElementById("newCreatedBy").value.trim()
  const assignedTo = document.getElementById("newAssignedTo").value.trim()
  
  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status >= 400) {
      alert(this.response)
      console.log("Error creating new issue.")
    } 
    if (this.readyState == 4 && this.status == 200) {
      newIssueForm.reset()
      document.getElementById("closeNewIssue").click()
      alert(this.response)
      loadData()
    }
  }
  xhttp.open("POST", "/create-or-modify-issue", true)
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(`project=${project}&issue=${issue}&createdBy=${createdBy}&assignedTo=${assignedTo}`)
  e.preventDefault()
}

// populate update issue modal
const updateModal = document.getElementById("updateModal")
updateModal.addEventListener("show.bs.modal", populateUpdateInputs)

function populateUpdateInputs(e) {
  const data = e.relatedTarget.offsetParent.childNodes
  const project = data[1].innerText
  const issue = data[3].childNodes[3].innerText
  const createdBy = data[3].childNodes[7].innerText
  const assignedTo = data[3].childNodes[11].innerText
  const id = data[3].childNodes[27].innerText
  const closed = data[3].childNodes[23].innerText === "Closed" ? true : false

  document.getElementById("updateProject").value = project
  document.getElementById("updateIssue").value = issue
  document.getElementById("updateCreatedBy").value = createdBy
  document.getElementById("updateAssignedTo").value = assignedTo
  document.getElementById("updateId").value = id
  document.getElementById("updateClose").checked = closed
}

// update an issue
function updateIssue(e) {
  const project = document.getElementById("updateProject").value.trim()
  const issue = document.getElementById("updateIssue").value.trim()
  const createdBy = document.getElementById("updateCreatedBy").value.trim()
  const assignedTo = document.getElementById("updateAssignedTo").value.trim()
  const id = document.getElementById("updateId").value
  const closed = document.getElementById("updateClose").checked
  
  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status >= 400) {
      alert(this.response)
      console.log("Error updating issue.")
    } 
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("closeUpdate").click()
      alert(this.response)
      loadData()
    }
  }
  xhttp.open("PUT", "/create-or-modify-issue", true)
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
  xhttp.send(`project=${project}&issue=${issue}&createdBy=${createdBy}&assignedTo=${assignedTo}&id=${id}&close=${closed}`)
  e.preventDefault()
}

// populate delete modal inputs and message
const deleteModal = document.getElementById("deleteModal")
deleteModal.addEventListener("show.bs.modal", populateDeleteInputs)

function populateDeleteInputs(e) {
  const deleteProject = document.getElementById("deleteProject")
  const deleteId = document.getElementById("deleteId")
  const deleteMessage = document.getElementById("deleteMessage")
  const data = e.relatedTarget.offsetParent.childNodes[3].childNodes
  const project = data[1].parentElement.previousElementSibling.innerText
  const id = data[27].innerHTML
  const message = `You are about to delete an issue for ${project} with id: ${id}.`
  
  deleteProject.value = project
  deleteId.value = id
  deleteMessage.innerText = message
}

// delete an issue
function deleteIssue(e) {
  const project = document.getElementById("deleteProject").value
  const id = document.getElementById("deleteId").value
  
  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status >= 400) {
      alert(this.response)
      console.log("error updating issue")
    } 
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("closeDelete").click()
      alert(this.response)
      loadData()
    }
  }
  xhttp.open("DELETE", "/create-or-modify-issue", true)
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(`project=${project}&issueId=${id}`)
  e.preventDefault()
}

// creates the HTML for the issues
function createIssuesHTML(res) {
  let allIssues = []
  res.forEach( x => {
    let issues = []
    x.issues.forEach( y => {
      let status = y.open ? "Open" : "Closed"
      let statusClass = y.open ? "" : "closed"
      issues.push(`<div class="col issue">
                    <div class="issueCard ${statusClass} card h-100">
                      <h5 class="card-header">${x.project}</h5>
                      <div class="card-body">
                        <h6 class="card-title">Issue</h6>
                        <p class="card-text">${y.issue}</p>
                        <h6 class="card-title">Created By</h6>
                        <p class="card-text">${y.createdBy}</p>
                        <h6 class="card-title">Assigned To</h6>
                        <p class="card-text">${y.assignedTo}</p>
                        <h6 class="card-title">Date Created</h6>
                        <p class="card-text">${y.date}</p>
                        <h6 class="card-title">Last Updated</h6>
                        <p class="card-text">${y.lastUpdated}</p>
                        <h6 class="card-title">Status</h6>
                        <p class="card-text">${status}</p>
                        <h6 class="card-title">Issue Id</h6>
                        <p class="card-text">${y._id}</p>
                      </div>
                      <div class="card-footer">
                        <button class="btn btn-outline-dark" data-bs-toggle="modal" data-bs-target="#updateModal" type="button">Update</button>
                        <button class="btn btn-outline-dark" data-bs-toggle="modal" data-bs-target="#deleteModal" type="button">Delete</button>
                      </div>
                    </div>
                  </div>`)
    })
    allIssues.push(issues.join(""))
  })
  return allIssues.join("")
}

// sort issues
sortDateCreated.addEventListener("change", sortByDate)

function sortByDate(e) {
  let issues = document.getElementById("issues")
  const issuesToSort = document.querySelectorAll(".issue")
  let selected = typeof e == "number" ? e : e.target.options.selectedIndex
  let sortBy = selected <= 2 ? "dateCreated" : "dateUpdated"
  let dates = []
  let sortedIssues = []

  issuesToSort.forEach( x => {
    // if the schema or HTML for the issue is changed these lines needs to change
    // and in the for loop populating sortedIssues
    if (sortBy == "dateCreated") dates.push(x.childNodes[1].childNodes[3].children[7].innerHTML)
    if (sortBy == "dateUpdated") dates.push(x.childNodes[1].childNodes[3].children[9].innerHTML)
  })
 
  if (selected == 1 || selected == 3) dates.sort( (a, b) => new Date(a) - new Date(b))
  if (selected == 2 || selected == 4) dates.sort( (a, b) => new Date(b) - new Date(a))
  
  // remove duplicate dates
  dates = Array.from(new Set(dates))
  
  // populate sortedIssues with dates sorted
  for (let i = 0; i < dates.length; i++) {
    issuesToSort.forEach( x => {
      if (sortBy == "dateCreated") {
        if (x.childNodes[1].childNodes[3].children[7].innerHTML == dates[i]) {
          sortedIssues.push(x)
        }
      }
      if (sortBy == "dateUpdated") {
        if (x.childNodes[1].childNodes[3].children[9].innerHTML == dates[i]) {
          sortedIssues.push(x)
        }
      }
    }) 
  }

  sortedIssues.forEach( x => {
    issues.appendChild(x)
  })
}

// filter by project, user created, user assigned to, and status
const filterForm = document.getElementById("filterForm")
filterForm.addEventListener("submit", filterIssues)

function filterIssues(e) {
  const sortIndex = document.getElementById("sortDateCreated").options.selectedIndex
  const project = filterProject.selectedOptions[0].value
  const createdBy = filterCreatedBy.selectedOptions[0].value
  const assignedTo = filterAssignedTo.selectedOptions[0].value
  const status = filterStatus.selectedOptions[0].value

  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status >= 400) {
      alert(this.response)
      console.log("error applying filters")
    } 
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("closeFilters").click()
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
  if (e) e.preventDefault()
}

// reset all filters
filterReset.addEventListener("click", () => {
  filterProject.selectedIndex = 0
  filterCreatedBy.selectedIndex = 0
  filterAssignedTo.selectedIndex = 0
  filterStatus.selectedIndex = 0
  sortDateCreated.selectedIndex = 0
  filterIssues()
})