// Vector <=> Float32Array

/**
 * 求两个向量的欧式距离
 * @param {Vector} A
 * @param {Vector} B
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
 * @param {Array<Vector>} matrix
 * @return {Vector}
 */
function estimateMeans (matrix) {
  const M = matrix.length
  const N = matrix[0].length
  const point = new Array(N)
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
 * @param {Array<Vector>} matrix 输入数据：特征值矩阵 M * N
 * @param {Array<Vector>} seeds 动设定初始化参数：中心点矩阵 K * N
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
 * 根据标记分割矩阵下标
 * @param {Number} K 分类的数量
 * @return {Array<Array>}
 */
function divide (mark, K) {
  const M = mark.length
  const clusters = new Array(K)
  for (let k = 0; k < K; ++k) {
    clusters[k] = []
  }
  for (let i = 0; i < M; ++i) {
    clusters[mark[i]].push(i)
  }
  return clusters
}

// 判断两个种子点是否相同
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
 * @param {Array<Vector>} matrix 输入数据：特征值矩阵 M * N
 * @param {Array<Vector>} seed 动设定初始化参数：中心点矩阵 K * N
 * @return {Array<Array>} 分类后的数组下标
 */
function kmeans (matrix, seeds) {
  const mark = getMark(matrix, seeds)
  const clusters = divide(mark, seeds.length)
  const newSeeds = new Array(seeds.length)

  let same = true
  for (let k = 0; k < clusters.length; ++k) {
    newSeeds[k] = estimateMeans(clusters[k].map(i => matrix[i]))
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
