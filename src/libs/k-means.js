/**
 * 求两个向量的欧式距离
 * @param {Float32Array} A
 * @param {Float32Array} B
 * @return {Number}
 */
function euclideanDistance (A, B) {
  const N = A.length;
  let sum = 0;
  for (let i = 0; i < N; ++i) {
    sum += (A[i] - B[i]) * (A[i] - B[i])
  }
  return Math.sqrt(sum)
}

/**
 * 估算一组特征向量的中心点（最基本的，基于平均值的算法）
 * @param {Array<Float32Array>} matrix
 * @return {Float32Array}
 */
function estimateMeans (matrix) {
  const point = []
  const M = matrix.length
  const N = matrix[0].length
  for (let j = 0; j < N; j++) {
    point[j] = 0
    for (let i = 0; i < M; i++) {
      point[j] += matrix[i][j]
    }
    point[j] /= M
  }
  return point
}


/**
 * 标记所有样本
 * @param {Array<Float32Array>} matrix 输入数据：特征值矩阵 M * N
 * @param {Array<Float32Array>} seeds 动设定初始化参数：中心点矩阵 K * N
 * @return {Array} 分类标记向量 M * 1
 * 复杂度： O(MNK)
 */
function getMark (matrix, seeds) {
  const M = matrix.length
  const mark = new Array(M)
  for (let i = 0; i < M; ++i) {
    let min = Number.MAX_VALUE
    for (let k = 0; k < seeds.length; ++k) {
      const distance = euclideanDistance(matrix[i], seeds[k])
      if (distance < min) {
        min = distance
        mark[i] = k
      }
    }
  }
  return mark
}

/**
 * 根据标记分割矩阵
 * @param {Array<Float32Array>} matrix 输入数据：特征值矩阵 M * N
 * @param {Array} mark 分类标记向量 M * 1
 * @return {Array<Array<Float32Array>>}
 */
function divide (matrix, mark) {
  const clusters = []
  for (let i = 0; i < matrix.length; ++i) {
    const k = mark[i]
    if (!clusters[k]) {
      clusters[k] = []
    }
    clusters[k].push(matrix[i])
  }
  return clusters
}

function isSameSeed (A, B) {
  const N = A.length
  for (let i = 0; i < N; ++i) {
    if (Math.abs(A[i] - B[i]) > 1e-8) {
      return false
    }
  }
  return true
}

/**
 * K-means 算法
 * @param {Array<Float32Array>} matrix 输入数据：特征值矩阵 M * N
 * @param {Array<Float32Array>} seed 动设定初始化参数：中心点矩阵 K * N
 * @return {Array<Array<Float32Array>>} 分类后的数据
 */
function kmeans (matrix, seeds) {
  const mark = getMark(matrix, seeds)
  const clusters = divide(matrix, mark)
  const newSeeds = []

  let same = true
  for (let k = 0; k < clusters.length; ++k) {
    newSeeds.push(estimateMeans(clusters[k]))
    same = same && isSameSeed(seeds[k], newSeeds[k])
  }

  return same ? clusters : kmeans(matrix, newSeeds)
}

module.exports = {
  euclideanDistance,
  estimateMeans,
  getMark,
  divide,
  isSameSeed,
  kmeans
}
