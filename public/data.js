 let projects = [
  {
    project: "one",
    issues: [
      {
        issue: "one1",
        createdBy: "Jim",
        assignedTo: "Jim",
        date: "6/1/2020",
        lastUpdated: "6/1/2020",
        open: true
      },
      {
        issue: "one2",
        createdBy: "Bob",
        assignedTo: "Bob",
        date: "6/3/2020",
        lastUpdated: "6/3/2020",
        open: false
      }
    ]
  },
  {
    project: "two",
    issues: [
      {
        issue: "two1",
        createdBy: "Bob",
        assignedTo: "Bob",
        date: "6/3/2020",
        lastUpdated: "6/3/2020",
        open: true
      },
      {
        issue: "two2",
        createdBy: "Jim",
        assignedTo: "Jim",
        date: "6/4/2020",
        lastUpdated: "6/4/2020",
        open: true
      }
    ]
  }
]

module.exports = projects