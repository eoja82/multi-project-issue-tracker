//const projects = require("./data")

const newIssueModal = document.getElementById("newIssueModal")
const createNewIssue = document.getElementById("createNewIssue")
const loginModal = document.getElementById("loginModal")
const login = document.getElementById("login")
const addUserModal = document.getElementById("addUserModal")
const addUser = document.getElementById("addUser")
const close = document.querySelectorAll(".close")
const modifyModal = document.getElementById("modifyModal")
const closeIssue = document.getElementById("closeIssue")

createNewIssue.addEventListener("click", displayModal)
login.addEventListener("click", displayModal)
addUser.addEventListener("click", displayModal)
addEventListener("click", closeModal)
close.forEach( x => x.addEventListener("click", closeModal))
// the event listener for the modify modal is in the page loaded function in client.js because it needs to be added after the data is loaded


function displayModal(e) {
  //console.log(e.target.id)
  if (e.target.id == "createNewIssue") newIssueModal.style.display = "block"
  if (e.target.className == "updateDelete") {
    modifyModal.style.display = "block"

    // populate the form input values with data from the issue on which the button was clicked
    // the below indexes will need to be changed if issue data displayed is changed
    const nodes = e.target.parentElement.childNodes
    //console.log(nodes)
    let project = nodes[1].textContent
    let issue = nodes[5].textContent
    let createdBy = nodes[9].textContent
    let assignedTo = nodes[13].textContent
    let status = nodes[25].textContent
    let closeIssueChecked 
    switch(status) {
      case "Closed": closeIssueChecked = true
        break
      case "Open": closeIssueChecked = false
        break
      default: closeIssueChecked = false
    }
    let id = nodes[29].textContent

    const modifyInput = document.querySelectorAll(".modifyInput")
    //console.log(modifyInput)
    modifyInput[0].value = project
    modifyInput[1].value = issue
    modifyInput[2].value = createdBy
    modifyInput[3].value = assignedTo
    modifyInput[4].value = id
    closeIssue.checked = closeIssueChecked


    const deleteInput = document.querySelectorAll(".deleteInput")
    deleteInput[0].value = project
    deleteInput[1].value = id
  }
  if (e.target.id == "login") loginModal.style.display = "block"
  if (e.target.id == "addUser") addUserModal.style.display = "block"
}

function closeModal(e) {
  // could I use `` here to shorten this up
  if (e.target.id == "newIssueModal" || 
      e.target.id == "modifyModal" ||  
      e.target.id == "loginModal" ||
      e.target.id == "addUserModal" ||
      e.target.className == "close") {
    newIssueModal.style.display = "none"
    modifyModal.style.display = "none"
    loginModal.style.display = "none"
    addUserModal.style.display = "none"
  }
}