
function fetchIssue (agent, number) {
  return agent.getIssue(number)
    .then(res => res.data)
    .then(issue => agent.listIssueComments(issue.number)
      .then(res => res.data)
      .then(comments => Object.assign(issue, { comments }))
    )
}

module.exports = {
  fetchIssue
}
