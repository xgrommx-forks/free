const Ɐ = require('jsverify')
const Free = require('../../src/free.js')
const { Future, Identity } = require('ramda-fantasy')

// make Future's `ap` compatible with FL@1
const { ap } = require('fantasy-land')
Future.prototype[ap] = function(f) {
  return f.ap(this)
}

Ɐ.any = Ɐ.oneof(Ɐ.falsy, Ɐ.json)

module.exports = {
  Free,
  Future,
  Identity,
}
