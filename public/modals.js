const newIssueModal = document.getElementById("newIssueModal")
const newIssue = document.getElementById("newIssue")
const loginModal = document.getElementById("loginModal")
const addUserModal = document.getElementById("addUserModal")
const close = document.querySelectorAll(".close")
const modifyModal = document.getElementById("modifyModal")
const closeIssue = document.getElementById("closeIssue")

newIssue.addEventListener("click", displayModal)
addEventListener("click", closeModal)
close.forEach( x => x.addEventListener("click", closeModal))
// the event listener for the modify modal is in the pageLoaded function in client.js because it needs to be added after the data is loaded


function displayModal(e) {
  if (e.target.id == "newIssue") newIssueModal.style.display = "block"
  if (e.target.id == "login") loginModal.style.display = "block"
}

function closeModal(e) {
  if (e.target.id == "newIssueModal" || 
      e.target.id == "modifyModal" ||  
      e.target.id == "loginModal" ||
      e.target.className == "close") {
    newIssueModal.style.display = "none"
    modifyModal.style.display = "none"
    loginModal.style.display = "none"
  }
}
