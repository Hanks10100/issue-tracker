const db = require('./src/db.js')
const { kmeans } = require('./src/libs/k-means.js')
const { pad, accumulate, pickTop } = require('./src/utils.js')

let repoName = 'weex'
if (process.argv[2]) {
  repoName = String(process.argv[2])
}

db.config({ basePath: `db/${repoName}` })

function divide () {
  const numbers = db.readSync('features/numbers')
  const matrix = db.readSync('features/matrix').map(vector => new Float32Array(vector))
  console.log(matrix.length)

  // 临时随机选择种子点
  const seed = [
    matrix[3],
    matrix[66],
    matrix[102]
  ]

  const result = kmeans(matrix, seed)

  const numberMap = result.map(v => v.map(i => numbers[i]))
  console.log(result)

  db.save('features/kmeans', result)
  db.save('features/classes', numberMap)
}

divide()
