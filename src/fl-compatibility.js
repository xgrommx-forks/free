const fl = require('fantasy-land')
const flCompatibilityDefinition = [
  { flName: fl['of'], srcName: 'of', isStatic: true },
  { flName: fl['map'], srcName: 'map', isStatic: false },
  { flName: fl['ap'], srcName: 'ap', isStatic: false },
  { flName: fl['chain'], srcName: 'chain', isStatic: false },
]

const makeFunction = (methodName, fallbackMethodName, isStatic) => (obj, ...args) => {
  if (obj[methodName]) {
    return obj[methodName](...args)
  } else if (isStatic && obj.constructor[methodName]) {
    return obj.constructor[methodName](...args)
  } else if (obj[fallbackMethodName]) {
    return obj[fallbackMethodName](...args)
  } else if (isStatic && obj.constructor[fallbackMethodName]) {
    return obj.constructor[fallbackMethodName](...args)
  } else {
    throw new TypeError(`there is no method named ${methodName} nor ${fallbackMethodName} defined for ${obj}`)
  }
}

const functions = flCompatibilityDefinition.reduce((res, definition) => {
  res[definition.srcName] = makeFunction(
    definition.flName,
    definition.srcName,
    definition.isStatic
  )
  return res
}, {})

const patch = (constructor) => {
  for (let definition of flCompatibilityDefinition) {
    if (constructor.prototype[definition.srcName]) {
      constructor.prototype[definition.flName] = constructor.prototype[definition.srcName]
    }
    if (constructor[definition.srcName]) {
      if (definition.isStatic) {
        constructor.prototype[definition.flName] = constructor[definition.srcName]
      }
      constructor[definition.flName] = constructor[definition.srcName]
    }
  }
}

module.exports = {
  functions,
  patch,
}
