const fl = require('fantasy-land')
const flCompatibilityDefinition = [
  { flName: fl['of'], srcName: 'of', couldBeInConstructor: true },
  { flName: fl['map'], srcName: 'map', couldBeInConstructor: false },
  { flName: fl['ap'], srcName: 'ap', couldBeInConstructor: false },
  { flName: fl['chain'], srcName: 'chain', couldBeInConstructor: false },
]

const makeFunction = (methodName, fallbackMethodName, couldBeInConstructor) => (obj, ...args) => {
  if (obj[methodName]) {
    return obj[methodName](...args)
  } else if (couldBeInConstructor && obj.constructor[methodName]) {
    return obj.constructor[methodName](...args)
  } else if (obj[fallbackMethodName]) {
    return obj[fallbackMethodName](...args)
  } else if (couldBeInConstructor && obj.constructor[fallbackMethodName]) {
    return obj.constructor[fallbackMethodName](...args)
  } else {
    throw new TypeError(`there is no method named ${methodName} nor ${fallbackMethodName} defined for ${obj}`)
  }
}

const functions = flCompatibilityDefinition.reduce((res, definition) => {
  res[definition.srcName] = makeFunction(
    definition.flName,
    definition.srcName,
    definition.couldBeInConstructor
  )
  return res
}, {})

const patch = (constructor) => {
  for (let definition of flCompatibilityDefinition) {
    if (constructor.prototype[definition.srcName]) {
      constructor.prototype[definition.flName] = constructor.prototype[definition.srcName]
      if (definition.couldBeInConstructor) {
        constructor[definition.flName] = constructor.prototype[definition.srcName]
      }
    }
    if (constructor[definition.srcName]) {
      constructor[definition.flName] = constructor[definition.srcName]
    }
  }
}

module.exports = {
  functions,
  patch,
}