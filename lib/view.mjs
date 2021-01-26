export { viewGen }

const
viewGen = function(setup) {
  const
  __extentions = {},
  use = function(name, ext) {
    if (typeof name !== "string") {
      console.error("`name` should be string")
      return
    }
    if (typeof ext !== "function") {
      console.error("`ext` should be a function")
      return
    }
    __extentions[name] = ext
  },
  view = function(setup) {
    const
    that = {
      buff: [],
    },
    dsl = {
      safe: __safe.bind(that),
      unsafe: __unsafe.bind(that),
      tag: __tag.bind(that),
    }
    const extentions = {}
    for (let name in __extentions) {
      if (__extentions.hasOwnProperty(name)) {
        extentions[name] = __extentions[name].bind(dsl)
      }
    }
    setup(dsl, extentions)
    return buff.join("")
  }
  if (setup !== undefined && typeof setup !== "function") {
    console.error("`setup` should be undefined or a function")
    return
  }
  if (setup) {
    setup(use)
  }
  return view
},
__safe = function(safe)  {
  buff.push(safe)
},
__unsafe = function(unsafe) {
  const safe = unsafe.replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
  buff.push(safe)
},
__tag = function(name, attrs, setupChildren) {
  if (attrs != null && typeof attrs === "object") {
    buff.push(`<${name}`)
    for (let a in attrs) {
      if (attrs.hasOwnProperty(a)) {
        buff.push(` ${a}="${attrs[a]}"`)
      }
    }
    buff.push(">")
  } else {
    buff.push(`<${name}>`)
  }
  if (typeof setupChildren === "function") {
    setupChildren(helpers)
  }
  buff.push(`</${name}>`)
}
