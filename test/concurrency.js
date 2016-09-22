const { test } = require('tap')
const { Free, Future } = require('./lib')

test('Check for concurrency', (t) => {
  const shout = (tag, ms) => Free.liftF({tag: `${tag}.${ms}`, ms})
  const pear3 = x => y => z => [x, y, z]
  const ap = (v, f) => v.ap(f)
  const lift2 = (f, a, b) => {
    return ap(b, a.map(function(a) {
      return function(b) {
        return f(a)(b)
      }
    }))
  }
  const lift3 = (f, a, b, c) => {
    return ap(c, ap(b, a.map(function(a) {
      return function(b) {
        return function(c) {
          return f(a)(b)(c)
        }
      }
    })))
  }
  let orders = { start: [], end: [] }
  ap(
    shout('out.ap', 10),
    lift3(
      pear3,
      shout('out.ap', 500),
      shout('out.ap', 400),
      lift3(
        pear3,
        shout('out.ap', 100),
        shout('out.ap', 300),
        shout('out.ap', 200)
      ).chain((tout) =>
        lift3(pear3,
          shout('in.ap', 50),
          shout('in.ap', 250),
          shout('in.ap', 150)
        ).map((tin) => [tout, tin])
      )
    ).chain((tout) =>
      lift2(pear3,
        shout('in.ap', 40),
        shout('in.ap', 140)
      ).map((f) => (a) => [tout, f(a)])
    )
  )
    .foldMap(({tag, ms}) => Future((rej, res) => {
      orders.start.push(tag)
      setTimeout(() => {
        orders.end.push(tag)
        res(tag)
      }, ms)
    }), Future)
    .fork(() => {}, (result) => {
      t.same(orders, {
        end: [
          'out.ap.10',
          'out.ap.100',
          'out.ap.200',
          'out.ap.300',
          'in.ap.50',
          'out.ap.400',
          'in.ap.150',
          'out.ap.500',
          'in.ap.250',
          'in.ap.40',
          'in.ap.140',
        ],
        start: [
          'out.ap.500',
          'out.ap.400',
          'out.ap.100',
          'out.ap.300',
          'out.ap.200',
          'out.ap.10',
          'in.ap.50',
          'in.ap.250',
          'in.ap.150',
          'in.ap.40',
          'in.ap.140',
        ],
      }, 'start and end order to be preserved')

      t.same(result, [
        ['out.ap.500', 'out.ap.400', [
          ['out.ap.100', 'out.ap.300', 'out.ap.200'],
          ['in.ap.50', 'in.ap.250', 'in.ap.150'],
        ]],
        ['in.ap.40', 'in.ap.140', 'out.ap.10'],
      ], 'result should be correct')
      t.end()
    })
})
