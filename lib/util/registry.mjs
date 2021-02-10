export {
  Registry,
  authPlugin,
  valueValidator,
  noisyNotFoundHandler,
  noisyAlreadyDefinedHandler,
  noisyNotValidHandler,
}

/*
* validators:begin
*/
const undefinedValueError = ["value should not be undefined"]
const valueValidator = (v) => {
  if (v === undefined) {
    return undefinedValueError
  }
}
/*
* validators:end
*/

/*
* handlers:begin
*/
const noisyNotFoundHandler = (path) => {
  console.error(`path: ${path.join("/")} is not found`)
}
const noisyAlreadyDefinedHandler = (path, value) => {
  console.error(`path: ${path.join("/")} already defined (value: ${value})`)
}
const noisyNotValidHandler = (path, value, errors) => {
  console.error(`value: \`${value}\` (path: ${path.join("/")}) is not valid: ${errors.join("\n\t")} `)
}
/*
* handlers:end
*/

/*
* plugins:begin
*/
const authPlugin = {
  // plugin name
  get name() {
    return "auth"
  },
  // returns packed value on write
  pack: (_, value, { authorizer }) => {
    return {
      value,
      authorize: authorizer,
    }
  },
  // returns unpacked value on read
  unpack: (__path, packed, __pluginPayload) => {
    return packed.value
  },
  // tests value against pluginPayload and returns errors if the test fails
  checkOnMatch: (_, value, {authPayload}) => {
    return value.authorize(authPayload)
  }
}
/*
* plugins:end
*/

const __plugins = Symbol("plugins")
const __validator = Symbol("validator")
const __notFoundHandler = Symbol("registry `not found` handler")
const __alreadyDefinedHandler = Symbol("registry `already defined` handler")
const __notValidHandler = Symbol("registry `not valid` handler")
const __values = Symbol("registry values")
const __children = Symbol("children registries")


class Registry {
  constructor({ validator, notFoundHandler, alreadyDefinedHandler, notValidHandler, plugins }) {
    if (typeof validator !== "function") {
      const error = "`validator:` should be function of value"
      console.error(error)
      return {
        error,
      }
    }
    this[__validator] = validator

    if (typeof notFoundHandler !== "function") {
      const error = "`notFound:` should be function"
      console.error(error)
      return {
        error,
      }
    }
    this[__notFoundHandler] = notFoundHandler

    if (typeof alreadyDefinedHandler !== "function") {
      const error = "`alreadyDefined:` should be function"
      console.error(error)
      return {
        error,
      }
    }
    this[__alreadyDefinedHandler] = alreadyDefinedHandler

    if (typeof notValidHandler !== "function") {
      const error = "`notValid:` should be function"
      console.error(error)
      return {
        error,
      }
    }
    this[__notValidHandler] = notValidHandler

    if (plugins !== undefined && typeof plugins.forEach !== "function") {
      console.log("plugins: ", plugins)
      const error = "`plugins` should be an array or undefined"
      console.error(error)
      return {
        error,
      }
    }
    this[__plugins] = new Map()

    if (plugins && typeof plugins.forEach === "function") {
      for (let i = 0, plugin = plugins[i]; i < plugins.length; plugin = plugins[i++]) {
        const name = plugin.name
        if (this[__plugins].has(name)) {
          const error = `plugin \`${name}\` already defined`
          console.error(error)
          return {
            error,
          }
        }
        this[__plugins].set(name, plugin)
      }
    }

    this[__values] = new Map()
    this[__children] = new Map()
  }

  hasPath(path) {
    const [chunk, ...restChunks] = path
    if (restChunks.length === 0) {
      return this[__values].has(chunk)
    } else {
      const child = this[__children].get(chunk)
      if (child !== undefined) {
        return child.hasPath(restChunks)
      }
    }
    return false
  }
  getValues(path, pluginPayload) {
    if (path.length === 0) {
      return this[__values].entries
    } else {
      const [chunk, ...restChunks] = path
      const child = this[__children].get(chunk)
      if (child !== undefined) {
        this[__plugins].forEach((plugin) => {
          if (plugin.checkOnMatch) {
            const { error } = plugin.checkOnMatch(path, v, pluginPayload)
            console.error(error)
            return {
              error,
            }
          }
        })
        return child.getValues(restChunks, pluginPayload)
      }
    }
    return notFound(path)
  }
  getValue(path, pluginPayload) {
    const [chunk, ...restChunks] = path
    if (restChunks.length === 0) {
      let v = this[__values].get(chunk)
      this[__plugins].forEach((plugin) => {
        if (plugin.checkOnMatch) {
          plugin.checkOnMatch(path, v, pluginPayload)
        }
        if (plugin.unpackValue) {
          v = plugin.unpack(v)
        }
      })
      if (v !== undefined) {
        return v
      } else {
        return this[__notFoundHandler](path)
      }
    } else {
      const child = this[__children].get(chunk)
      if (child !== undefined) {
        this[__plugins].forEach((plugin) => {
          if (plugin.onPathChunkMatched) {
            plugin.checkOnMatch(path, v, pluginPayload)
          }
        })
        return child.getValue(restChunks)
      }
    }
    return this[__notFoundHandler](path)
  }
  setValue(path, value, pluginPayload) {
    const errors = this[__validator](value)
    if (errors !== undefined && errors.length > 0) {
      return this[__notValidHandler](path, value, errors)
    }
    const [chunk, ...restChunks] = path
    if (restChunks.length === 0) {
      const __value = this[__values].get(chunk)
      if (__value !== undefined) {
        return this[__alreadyDefinedHandler](path, value)
      }
      this[__values].set(chunk, value)
    } else {
      let child = this[__children].get(chunk)
      if (child === undefined) {
        child = new Registry({
          validator: this[__validator],
          notFoundHandler: this[__notFoundHandler],
          alreadyDefinedHandler: this[__alreadyDefinedHandler],
          notValidHandler: this[__notValidHandler],
          plugins: this[__plugins],
        })
        this[__children].set(chunk, child)
      }
      this[__plugins].forEach((plugin) => {
        if (plugin.packValue) {
          plugin.pack(path, v, pluginPayload)
        }
      })
      child.setValue(restChunks, value)
    }
  }
  merge(path, reg) {
    if (this.hasPath(path)) {
      this[__alreadyDefinedHandler](path, child)
    }

    let that = this
    for (let i = 0, chunk = path[i]; i < chunk.length; chunk = path[i++]) {

    }
    let children = that[__children][chunk]
    if (path.length === 1) {
      this[__children][path[0]] = child
    } else {

    }
  }
}

