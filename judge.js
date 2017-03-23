const fs = require('fs')
const jsonfile = require('jsonfile')
const segment = require('./segment')
const { pickTop, pad } = require('./utils.js')

function readIssue (number) {
  console.log(` => Can't find ${filename}`)
}

function getWords (number) {
  const filename = `./issues/${number}.json`
  if (fs.existsSync(filename)) {
    const issue = jsonfile.readFileSync(filename)
    console.log(`#${pad(number, 5)} ${issue.title}`)

    const words = segment(issue.title)
    if (Array.isArray(issue.comments)) {
      issue.comments.forEach(comment => {
        Array.prototype.push.apply(words, segment(comment.body))
      })
    }

    return words
  }
  console.log(`\n => Can't find ${filename}`)
  return []
}

function getPWords () {
  return jsonfile.readFileSync(`words/issue_words_probability.json`)
}

function getPLabelWords () {
  return jsonfile.readFileSync(`words/issue_label_words_probability.json`)
}

function judge (number) {
  const words = getWords(number)
  const PWords = getPWords()
  const PLabelWords = getPLabelWords()

  const result = {}

  for (const label in PLabelWords) {
    const PLabels = PLabelWords[label]
    let count = 0
    let sum = 0
    // console.log('------------->', label, '<-------------')
    words.forEach(word => {
      if (PWords[word] && PLabels[word]) {
        // console.log(' =>', PLabels[word] / PWords[word])
        count++
        sum += PLabels[word] / PWords[word]
      }
    })
    result[label] = sum / count
  }

  print(pickTop(result, 5))
}

function print (result) {
  if (Array.isArray(result)) {
    const maxLength = result.reduce((count, { name }) => {
      return Math.max(count, name.length)
    }, 0)

    console.log()
    result.forEach(({ name, count }) => {
      if (count && count >= 0.01) {
        console.log(`${pad(name, maxLength)}  ${count.toFixed(2)}`)
      }
    })
  }
}

let issueNumber = 2857
if (process.argv[2]) {
  issueNumber = Number(process.argv[2])
}

judge(issueNumber)
