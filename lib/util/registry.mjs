export {
  registry,
  authPlugin,
  notUndefined,
  noisyNotFoundHandler,
  noisyAlreadyDefinedHandler,
  noisyNotValidHandler,
}

const undefinedValueError = ["value should not be undefined"]
const notUndefined = (v) => {
  if (v === undefined) {
    return undefinedValueError
  }
}

const noisyNotFoundHandler = (path) => {
  console.error(`path: ${path.join("/")} is not found`)
}

const noisyAlreadyDefinedHandler = (path, value) => {
  console.error(`path: ${path.join("/")} already defined (value: ${value})`)
}

const noisyNotValidHandler = (path, value, errors) => {
  console.error(`value: \`${value}\` (path: ${path.join("/")}) is not valid: ${errors.join("\n\t")} `)
}

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
// usage:
//
//    let {get, set} = registry(notUndefined, noisyHandlers)
//    get("some/path/Name".split("/"))
//    set("some/path/Name".split("/"), true)
//    get("some/path/Name".split("/"))
//    set("some/path/Name".split("/"), false)
//    set("some/path/NotUndefined".split("/"), undefined)
//
const registry = ({ validator, notFoundHandler, alreadyDefinedHandler, notValidHandler, plugins }) => {
  if (typeof validator !== "function") {
    const error = "`validator:` should be function of value"
    console.error(error)
    return {
      error,
    }
  }
  if (typeof notFoundHandler !== "function") {
    const error = "`notFound:` should be function"
    console.error(error)
    return {
      error,
    }
  }
  if (typeof alreadyDefinedHandler !== "function") {
    const error = "`alreadyDefined:` should be function"
    console.error(error)
    return {
      error,
    }
  }
  if (typeof notValidHandler !== "function") {
    const error = "`notValid:` should be function"
    console.error(error)
    return {
      error,
    }
  }
  if (plugins !== undefined && !Array.isArray(plugins)) {
    console.log("plugins: ", plugins)
    const error = "`plugins` should be an array or undefined"
    console.error(error)
    return {
      error,
    }
  }
  const registeredPlugins = []
  if (Array.isArray(plugins)) {
    for (let i = 0, plugin = plugins[i]; i < plugins.length; plugin = plugins[i++]) {
      const name = plugin.name
      if (registeredPlugins[name] !== undefined) {
        const error = `plugin \`${name}\` already defined`
        console.error(error)
        return {
          error,
        }
      }
      registeredPlugins.push(plugin)
      registeredPlugins[name] = plugin
    }
  }

  const validate = validator
  const handleNotFound = notFoundHandler
  const handleAlreadyDefined = alreadyDefinedHandler
  const handleNotValid = notValidHandler
  const values = {}
  const children = {}
  const hasPath = (path) => {
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
  }
  const getValues = (path, pluginPayload) => {
    if (path.length === 0) {
      return values.entries
    } else {
      const [chunk, ...restChunks] = path
      const child = children[chunk]
      if (child !== undefined) {
        registeredPlugins.forEach((plugin) => {
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
  const getValue = (path, pluginPayload) => {
    const [chunk, ...restChunks] = path
    if (restChunks.length === 0) {
      let v = values[chunk]
      registeredPlugins.forEach((plugin) => {
        if (plugin.checkOnMatch) {
          plugin.checkOnMatch(path, v, pluginPayload)
        }
        if (plugin.unpackValue) {
          v = plugin.unpack(v)
        }
      })
      if (v !== undefined) {
        return v
      }
    } else {
      const child = children[chunk]
      if (child !== undefined) {
        registeredPlugins.forEach((plugin) => {
          if (plugin.onPathChunkMatched) {
            plugin.checkOnMatch(path, v, pluginPayload)
          }
        })
        return child.getValue(restChunks)
      }
    }
    return handleNotFound(path)
  }
  const setValue = (path, value, pluginPayload) => {
    const errors = validate(value)
    if (errors !== undefined && errors.length > 0) {
      return handleNotValid(path, value, errors)
    }
    const [chunk, ...restChunks] = path
    if (restChunks.length === 0) {
      const __value = values[chunk]
      if (__value !== undefined) {
        return handleAlreadyDefined(path, value)
      }
      values[chunk] = value
    } else {
      let child = children[chunk]
      if (child === undefined) {
        child = registry({
          validator,
          notFoundHandler,
          alreadyDefinedHandler,
          notValidHandler,
          registeredPlugins,
        })
        children[chunk] = child
      }
      registeredPlugins.forEach((plugin) => {
        if (plugin.packValue) {
          plugin.pack(path, v, pluginPayload)
        }
      })
      child.setValue(restChunks, value)
    }
  }
  return {
    hasPath,
    getValues,
    getValue,
    setValue,
  }
}

