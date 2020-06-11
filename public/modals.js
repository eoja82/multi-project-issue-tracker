const newIssueModal = document.getElementById("newIssueModal")
const createNewIssue = document.getElementById("createNewIssue")
const close = document.querySelectorAll(".close")
const modifyModal = document.getElementById("modifyModal")

createNewIssue.addEventListener("click", displayModal)
addEventListener("click", closeModal)
close.forEach( x => x.addEventListener("click", closeModal))
// the event listener for the modify modal is in the page loaded function in client.js because it needs to be added after the data is loaded


function displayModal(e) {
  //console.log(e.target.className)
  if (e.target.id == "createNewIssue") newIssueModal.style.display = "block"
  if (e.target.className == "updateDelete") {
    modifyModal.style.display = "block"

    // populate the input values from the data from the issue the button was clicked on
    // the below indexes will need to be changed if issue data displayed is changed
    const nodes = e.target.parentElement.childNodes
    let project = nodes[1].textContent
    let issue = nodes[5].textContent
    let createdBy = nodes[9].textContent
    let assignedTo = nodes[13].textContent
    let id = nodes[29].textContent

    const modifyInput = document.querySelectorAll(".modifyInput")
    //console.log(modifyInput)
    modifyInput[0].value = project
    modifyInput[1].value = issue
    modifyInput[2].value = createdBy
    modifyInput[3].value = assignedTo
    modifyInput[4].value = id
  }
}

function closeModal(e) {
  if (e.target.id == "newIssueModal" || e.target.id == "modifyModal" || e.target.className == "close") {
    newIssueModal.style.display = "none"
    modifyModal.style.display = "none"
  }
}