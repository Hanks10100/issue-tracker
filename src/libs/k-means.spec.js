const { expect } = require('chai')
const {
  euclideanDistance,
  estimateMeans,
  getMark,
  divide,
  isSameSeed,
  kmeans
} = require('./k-means.js')


/**
 * 矩阵转置
 * @param {Array<Float32Array>} matrix
 * @return {Array<Float32Array>}
 */
function transpose (matrix) {
  const M = matrix.length
  const N = matrix[0].length
  const result = []
  for (let j = 0; j < N; j++) {
    result[j] = []
    for (let i = 0; i < M; i++) {
      result[j][i] = matrix[i][j]
    }
  }
  return result
}


describe('k-means', () => {
  // 测试欧式距离
  it('euclidean distance', () => {
    function euclidean (A, B, expect) {
      const result = euclideanDistance(new Float32Array(A), new Float32Array(B))
      return Math.abs(result - expect) < 1e-8
    }

    expect(euclidean([2, -3], [-1, 1], 5)).to.be.true
    expect(euclidean([0, -1, 7], [-4, 6, 3], 9)).to.be.true
    expect(euclidean([2, -3, 1], [5, -1, 1], 3.605551275463989)).to.be.true
  })

  it.skip('transpose', () => {
    const A = [
      new Float32Array([0, 1, 2, 3]),
      new Float32Array([1, 2, 3, 4]),
      new Float32Array([2, 3, 4, 5])
    ]

    expect(transpose(A)).to.deep.equal([
      [0, 1, 2],
      [1, 2, 3],
      [2, 3, 4],
      [3, 4, 5]
    ])
  })

  it('estimate means', () => {
    const A = [
      new Float32Array([0, 1, 2, 3]),
      new Float32Array([1, 2, 3, 4]),
      new Float32Array([2, 3, 4, 5])
    ]

    expect(estimateMeans(A)).to.deep.equal([1, 2, 3, 4])
  })

  it('getMark', () => {
    const matrix = [
      new Float32Array([-1, 2]),
      new Float32Array([1, 3]),
      new Float32Array([1, -1]),
      new Float32Array([2, -1]),
      new Float32Array([0, 2]),
      new Float32Array([1, -2])
    ]

    const seed = [
      new Float32Array([0, 1]),
      new Float32Array([1, 0])
    ]

    expect(getMark(matrix, seed)).to.deep.equal([0, 0, 1, 1, 0, 1])
  })

  it('divide', () => {
    const matrix = [
      new Float32Array([-1, 2]),
      new Float32Array([1, 3]),
      new Float32Array([1, -1]),
      new Float32Array([2, -1]),
      new Float32Array([0, 2]),
      new Float32Array([1, -2])
    ]
    const mark = [0, 0, 1, 1, 0, 1]

    expect(divide(mark, 2)).to.deep.equal([[0, 1, 4], [2, 3, 5]])
  })

  it('isSameSeed', () => {
    const seedA = [
      new Float32Array([0, 1]),
      new Float32Array([1, 0])
    ]
    const seedB = [
      new Float32Array([0, 1]),
      new Float32Array([1, 0])
    ]

    expect(isSameSeed(seedA, seedB)).to.be.true
  })

  describe('kmeans', () => {
    it('N=2, K=2, M=6', () => {
      const matrix = [
        new Float32Array([-1, 2]),
        new Float32Array([1, 3]),
        new Float32Array([1, -1]),
        new Float32Array([2, -1]),
        new Float32Array([0, 2]),
        new Float32Array([1, -2])
      ]

      const seed = [
        new Float32Array([0, 1]),
        new Float32Array([1, 0])
      ]

      expect(kmeans(matrix, seed)).to.deep.equal([[0, 1, 4], [2, 3, 5]])
    })

    it('N=2, K=3, M=14', () => {
      const matrix = [
        new Float32Array([8, 2]),
        new Float32Array([8, 7]),
        new Float32Array([1, 2]),
        new Float32Array([1, 4]),
        new Float32Array([9, 3]),
        new Float32Array([6, 5]),
        new Float32Array([9, 1]),
        new Float32Array([6, 8]),
        new Float32Array([6, 9]),
        new Float32Array([5, 6]),
        new Float32Array([3, 4]),
        new Float32Array([7, 7]),
        new Float32Array([8, 1]),
        new Float32Array([2, 3]),
      ]

      const seed = [
        new Float32Array([3, 5]),
        new Float32Array([5, 5]),
        new Float32Array([8, 5])
      ]

      expect(kmeans(matrix, seed)).to.deep.equal([
        [ 2, 3, 10, 13 ],
        [ 1, 5, 7, 8, 9, 11 ],
        [ 0, 4, 6, 12 ]
      ])
    })
  })
})
