
function fetchIssue (agent, number) {
  return new Promise((resolve, reject) => {
    agent.getIssue(number, (error, issue) => {
      if (error) {
        if (error.response.status == 404) {
          reject({ done: true })
        }
        reject(error)
      }

      agent.listIssueComments(issue.number, (err, comments) => {
        if (err) { reject(err) }
        issue.comments = comments
        resolve(issue)
      })
    }).catch(resolve)
  })
}

module.exports = {
  fetchIssue
}
