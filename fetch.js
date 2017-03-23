const GitHub = require('github-api/dist/GitHub.js')
const jsonfile = require('jsonfile')

const gh = new GitHub({
  username: 'Hanks-bot',
  password: 'Hanks10100'
})

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

    jsonfile.spaces = 2
    jsonfile.writeFile(`./${type.toLowerCase()}s/${number}.json`, issue)
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

fetchNext(gh.getIssues('alibaba', 'weex'), 2643)
