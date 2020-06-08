const newIssueModal = document.getElementById("newIssueModal")
const createNewIssue = document.getElementById("createNewIssue")
const close = document.querySelectorAll(".close")
const modifyModal = document.getElementById("modifyModal")

createNewIssue.addEventListener("click", displayModal)
addEventListener("click", closeModal)
close.forEach( x => x.addEventListener("click", closeModal))
// the event listener for the modify modal is in the page loaded function in client.js because it needs to be added after the data is loaded


function displayModal(e) {
  console.log(e.target.className)
  if (e.target.id == "createNewIssue") newIssueModal.style.display = "block"
  if (e.target.className == "updateDelete") modifyModal.style.display = "block"
}

function closeModal(e) {
  if (e.target.id == "newIssueModal" || e.target.id == "modifyModal" || e.target.className == "close") {
    newIssueModal.style.display = "none"
    modifyModal.style.display = "none"
  }
}