
export {
  registry,
  notUndefined,
  noisyHandlers,
}

const undefinedValueError = ["value should not be undefined"]
const notUndefined = (v) => {
  if (v === undefined) {
    return undefinedValueError
  }
}

const noisyHandlers = {
  notFound: (path) => {
    console.error(`path: ${path.join("/")} is not found`)
  },
  alreadyDefined: (path, value) => {
    console.error(`path: ${path.join("/")} already defined (value: ${value})`)
  },
  notValid: (path, value, errors) => {
    console.error(`value: \`${value}\` (path: ${path.join("/")}) is not valid: ${errors.join("\n\t")} `)
  }
}

// usage:
//
//    let {get, set} = registry(notUndefined, noisyHandlers)
//    get("some/path/Name".split("/"))
//    set("some/path/Name".split("/"), true)
//    get("some/path/Name".split("/"))
//    set("some/path/Name".split("/"), false)
//    set("some/path/NotUndefined".split("/"), undefined)
//
const registry = (validator, handlers) => {
  if (typeof validator !== "function") {
    console.error("`validator` should be function of value")
    return
  }
  if (typeof handlers !== "object") {
    console.error("`handlers` should be object")
    return
  }
  if (typeof handlers.notFound !== "function") {
    console.error("`handlers.notFound` should be function")
    return
  }
  if (typeof handlers.alreadyDefined !== "function") {
    console.error("`handlers.alreadyDefined` should be function")
    return
  }
  if (typeof handlers.notValid !== "function") {
    console.error("`handlers.notValid` should be function")
    return
  }

  const validate = validator
  const notFound = handlers.notFound
  const alreadyDefined = handlers.alreadyDefined
  const notValid = handlers.notValid
  const values = {}
  const children = {}

  return {
    has: (path) => {
      const [chunk, ...restChunks] = path
      if (restChunks.length === 0) {
        return values[chunk] !== undefined
      } else {
        const child = children[chunk]
        if (child !== undefined) {
          return child.has(restChunks)
        }
      }
      return false
    },
    get: (path) => {
      const [chunk, ...restChunks] = path
      if (restChunks.length === 0) {
        const v = values[chunk]
        if (v !== undefined) {
          return v
        }
      } else {
        const child = children[chunk]
        if (child !== undefined) {
          return child.get(restChunks)
        }
      }
      return notFound(path)
    },
    set: (path, value) => {
      const errors = validate(value)
      if (errors !== undefined && errors.length > 0) {
        return notValid(path, value, errors)
      }
      const [chunk, ...restChunks] = path
      if (restChunks.length === 0) {
        const __value = values[chunk]
        if (__value !== undefined) {
          return alreadyDefined(path, value)
        }
        values[chunk] = value
      } else {
        let child = children[chunk]
        if (child === undefined) {
          child = registry(validator, handlers)
          children[chunk] = child
        }
        child.set(restChunks, value)
      }
    }
  }
}

