const db = require('./src/db.js')
const { euclideanDistance } = require('./src/libs/k-means.js')
const { pad, accumulate, pickTop } = require('./src/utils.js')

let repoName = 'weex'
if (process.argv[2]) {
  repoName = String(process.argv[2])
}

db.config({ basePath: `db/${repoName}` })

function similarity () {
  const numbers = db.readSync('features/numbers')
  const matrix = db.readSync('features/matrix').map(vector => new Float32Array(vector))
  console.log(matrix.length)

  const sim = {}
  matrix.forEach((A, i) => {
    const issueNumber = numbers[i]
    console.log(`${pad(i, 5)} #${issueNumber}`)
    sim[issueNumber] = {}
    matrix.forEach((B, j) => {
      sim[issueNumber][numbers[j]] = euclideanDistance(A, B)
    })

    db.save(`similarity/${issueNumber}`, pickTop(sim[issueNumber]))
  })

  // db.save('similarity/classes', numberMap)
}

similarity()
