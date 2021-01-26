export { viewGen }

const
viewGen = function(setup) {
  const
  injectionSetups = {},
  injection = function(name, setup) {
    if (typeof name !== "string") {
      console.error("`name` should be string")
      return
    }
    if (typeof setup !== "function") {
      console.error("`setup` should be a function")
      return
    }
    injectionSetups[name] = setup
  },
  view = function(setup) {
    const that = {
      buff: [],
      injections: {},
    }
    that.dsl = {
      safe: __safe.bind(that),
      unsafe: __unsafe.bind(that),
      tag: __tag.bind(that),
    }
    for (let name in injectionSetups) {
      if (injectionSetups.hasOwnProperty(name)) {
        that.injections[name] = () => { injectionSetups[name](that.dsl) }
      }
    }
    setup(that.dsl, that.injections)
    return that.buff.join("")
  }
  if (setup !== undefined && typeof setup !== "function") {
    console.error("`setup` should be undefined or a function")
    return
  }
  if (setup) {
    setup(injection)
  }
  return view
},
__safe = function(safe)  {
  this.buff.push(safe)
},
__unsafe = function(unsafe) {
  const safe = unsafe.replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
  this.buff.push(safe)
},
__tag = function(name, attrs, setupChildren) {
  if (attrs != null && typeof attrs === "object") {
    this.buff.push(`<${name}`)
    for (let a in attrs) {
      if (attrs.hasOwnProperty(a)) {
        this.buff.push(` ${a}="${attrs[a]}"`)
      }
    }
    this.buff.push(">")
  } else {
    this.buff.push(`<${name}>`)
  }
  if (typeof setupChildren === "function") {
    setupChildren(this.dsl, this.injections)
  }
  this.buff.push(`</${name}>`)
}
