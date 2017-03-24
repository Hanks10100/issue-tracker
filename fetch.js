const GitHub = require('github-api/dist/GitHub.js')
const db = require('./src/db.js')

db.config({ basePath: 'db/weex' })

const GitHubAgent = new GitHub({
  username: 'Hanks-bot',
  password: 'Hanks10100'
})
const issueAgent = GitHubAgent.getIssues('alibaba', 'weex')

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


function fetchAndSave (agent, number) {
  console.log(` => fetching #${number} ...`)
  return fetchIssue(agent, number).then(issue => {
    const type = issue.pull_request ? 'PR': 'issue'
    console.log(` => [${type}] #${number} ${issue.title}`)
    db.save(`${type.toLowerCase()}s/${number}`, issue)
  })
}

function fetchNext (agent, number = 1) {
  let retry = 3
  return fetchAndSave(agent, number).then(() => {
    retry = 3
    fetchNext(agent, number + 1)
  }).catch(res => {
    console.log(res)
    if (!res.done && retry) {
      retry--
      fetchAndSave(agent, number)
    }
  })
}

fetchNext(issueAgent, 1)
