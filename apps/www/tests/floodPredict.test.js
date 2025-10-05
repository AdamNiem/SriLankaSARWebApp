// Minimal test script for floodPredict route - run with `node tests/floodPredict.test.js`
const path = require('path')

async function main() {
  const route = require(path.join('..', 'app', 'api', 'floodPredict', 'route.ts'))

  // If running under Node without ts support, route.ts may not be require()'able.
  // In that case, just demonstrate the computeFloodProbability via dynamic import.
  if (!route.computeFloodProbability) {
    console.log('Falling back to dynamic import')
    const mod = await import(path.join('..', 'app', 'api', 'floodPredict', 'route.ts'))
    await runTests(mod)
  } else {
    await runTests(route)
  }
}

async function runTests(mod) {
  const { computeFloodProbability, GET } = mod

  console.log('computeFloodProbability examples:')
  console.log('34.05 -118.25 2025-10-04 ->', computeFloodProbability('34.05', '-118.25', '2025-10-04'))
  console.log('0 0 2025-01-01 ->', computeFloodProbability('0', '0', '2025-01-01'))

  if (GET) {
    // Simulate a Request object for Next.js route handler
    const url = 'https://example.com/api/floodPredict?lat=34.05&lon=-118.25&date=2025-10-04'
    const req = new Request(url)
    const res = await GET(req)
    // NextResponse.serialized is not available here; just print JSON by calling res.json()
    try {
      const body = await res.json()
      console.log('GET handler response:', body)
    } catch (e) {
      console.log('GET handler did not return JSON in test environment')
    }
  } else {
    console.log('GET handler not available in test module')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
