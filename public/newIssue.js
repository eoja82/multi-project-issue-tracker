const newIssueModal = document.getElementById("newIssueModal")
const createNewIssue = document.getElementById("createNewIssue")
const close = document.querySelector(".close")

createNewIssue.addEventListener("click", displayModal)
addEventListener("click", closeModal)
close.addEventListener("click", closeModal)

function displayModal() {
  newIssueModal.style.display = "block"
}

function closeModal(e) {
  if (e.target.id == "newIssueModal" || e.target.className == "close") newIssueModal.style.display = "none"
}