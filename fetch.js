const GitHub = require('github-api/dist/GitHub.js')
const { fetchIssue } = require('./src/web.js')
const db = require('./src/db.js')

db.config({ basePath: 'db/weex' })

const GitHubAgent = new GitHub({
  username: 'Hanks-bot',
  password: 'Hanks10100'
})
const issueAgent = GitHubAgent.getIssues('alibaba', 'weex')

function fetchAndSave (agent, number) {
  console.log(` => fetching #${number} ...`)
  return fetchIssue(agent, number)
    .then(issue => {
      const type = issue.pull_request ? 'PR': 'issue'
      console.log(` => [${type}] #${number} ${issue.title}`)
      db.save(`${type.toLowerCase()}s/${number}`, issue)
    })
}

function fetchNext (agent, number = 1) {
  let retry = 3
  return fetchAndSave(agent, number)
    .then(() => fetchNext(agent, number + 1))
    .catch(res => {
      if (!res.done && retry) {
        retry--
        fetchAndSave(agent, number)
      }
    })
}

fetchNext(issueAgent, 1)
