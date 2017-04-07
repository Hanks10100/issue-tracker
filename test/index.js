const chart = echarts.init(document.getElementById('output'));

function randomPoint (count) {
  const samples = []
  for (let i = 0; i < count; ++i) {
    samples.push([Math.random(), Math.random()])
  }
  return samples
}

function randomSample (count, group = 1) {
  const samples = []
  const seeds = []
  for (let i = 0; i < group; ++i) {
    const seed = [Math.random(), Math.random()]
    seeds.push(seed)
    let ct = count
    while (ct > 0) {
      const point = [Math.random(), Math.random()]
      if (euclideanDistance(seed, point) < 0.12) {
        samples.push(point)
        ct--
      }
    }
  }
  return {
    samples: samples.sort(() => Math.random() - 0.5),
    seeds: seeds.sort(() => Math.random() - 0.5)
  }
}

function runTest (samples, seeds) {
  return kmeans(samples, seeds).map(group => group.map(i => samples[i]))
}

function getOption (clusters) {
  return {
      title: {
          text: '分类结果'
      },
      xAxis: {
          splitLine: {
              lineStyle: {
                  type: 'dashed'
              }
          }
      },
      yAxis: {
          splitLine: {
              lineStyle: {
                  type: 'dashed'
              }
          }
      },
      series: clusters.map(data => ({ type: 'scatter', data }))
  }
}

const { samples, seeds } = randomSample(100, 4)
chart.setOption(getOption(runTest(samples, seeds)))

// chart.setOption(getOption(runTest(randomPoint(300), randomPoint(3))))
