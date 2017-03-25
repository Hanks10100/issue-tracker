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

const RETRY_COUNT = 3
function fetchNext (agent, number = 1, retry = RETRY_COUNT) {
  return fetchAndSave(agent, number)
    .then(() => fetchNext(agent, number + 1, retry))
    .catch(({ response }) => {
      console.log(` => ${response.status}`)
      if (response.status === 404 || retry <= 0) {
        fetchNext(agent, number + 1, RETRY_COUNT)
      } else {
        fetchNext(agent, number, retry - 1)
      }
    })
}


let start = 1
if (process.argv[2]) {
  start = Number(process.argv[2])
}

fetchNext(issueAgent, start)
