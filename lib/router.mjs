export default {
  router,
}

import {
  registry,
  authPlugin,
  noisyNotFoundHandler,
  noisyAlreadyDefinedHandler,
  noisyNotValidHandler,
} from "./util/registry.mjs"

const validator = (payload) => {
  if (typeof payload === "object") {
    const error = "`payload` should not be `undefined`"
    console.error(error)
    return {
      error,
    }
  }
}
const router = function(setup) {
  const routes = registry({
    validator,
    notFoundHandler: noisyNotFoundHandler,
    alreadyDefinedHandler: noisyAlreadyDefinedHandler,
    notValidHandler: noisyNotValidHandler,
    plugins: [
      authPlugin,
    ]
  })
  const urlHelpers = registry({

  })
  const chunk = ({ matcher, payload, setup }) => {

  }
  const root = ({ payload, setup }) => {
    setup(chunk)
  }
  const notFound = () => {

  }
  const notAllowed = () => {

  }
  setup({
    root,
    notFound,
    notAllowed,
  })
  const dispatch = (path) => {

  }
  return {
    get urlHelpers() {
      return urlHelpers
    },
    dispatch
  }
}

const { as, data, children, matches } = routesSpec
console.log("root: ", routesSpec, as)
if (as !== undefined) {
  console.error("there is no need in 'as' for root node")
  return
}
routesSpec.as = "root"
if (typeof data !== "object") {
  console.error("root's data should be object")
  return
}
if (typeof this.screens[data.screen] !== "object") {
  console.error(`routes ${as} (node; ${name}) has wrong screen: ${data.screen}`)
  return
}
if (children !== undefined && typeof children !== "object") {
  console.error("root's children should be undefined or an object")
  return
}
if (matches !== undefined) {
  console.error("root node needs no matches")
  return
}
routesSpec.matches = (_) => { return true }
this.routesSpec = {
  root: routesSpec.as
}
const URLHelpers = {
  root: () => {
    window.history.pushState(data, null, "/")
    const html = this.screens[data.screen].render(data)
    this.draw(html)
  },
}
const checkNode = (name, as, nodePath, nodeSpec) => {
  if (isParamNode(name)) {
    if (typeof nodeSpec.matches !== "function") {
      console.error(`node ${name} is a param node so that it should have matches specified`)
      return
    }
  } else {
    if (nodeSpec.matches !== undefined) {
      console.error(`node ${name} is not param node so that it needs no matches`)
      return
    }
  }
  URLHelpers[as] = (routeParams) => {
    if (routeParams === undefined) {
      routeParams = {}
    }
    const data = JSON.parse(JSON.stringify(nodeSpec.data))
    const pathChunks = []
    console.log("init nodeSpec:", nodeSpec)
    data.routeParams = routeParams
    console.log("finish nodeSpec:", nodeSpec)

    nodePath.forEach((chunk) => {
      if (chunk === "") {
        return
      }
      if (isParamNode(chunk)) {
        const key = chunk.slice(1)
        if (routeParams[key] == null) { // null, undefined or NaN
          console.error(`URL helper ${as} (node ${name}) has no param ${chunk}`)
          return
        }
        if (nodeSpec.matches(routeParams[key])) {
          chunk = routeParams[key]
        } else {
          console.error(`URL helper ${as} (node ${name}) do not matches param ${chunk} (value: ${routeParams[chunk]})`)
          return
        }
      }
      pathChunks.push(chunk)
    })
    const path = pathChunks.join("/")
    window.history.pushState(data, null, path)
    console.log("screens:", this.screens, data)
    const html = this.screens[data.screen].render(data)
    this.draw(html)
  }

  if (nodeSpec.children !== undefined && typeof nodeSpec.children !== "object") {
    console.error(`node ${name} has wrong children`)
    return
  }
  if (typeof nodeSpec.children === "object") {
    console.log("childrens 2nd lvl:", name, nodeSpec)
    for (const name in nodeSpec.children) {
      const _nodePath = [...nodePath, name]
      checkNode(name, nodeSpec.children[name].as, _nodePath, nodeSpec.children[name])
    }
  }
}

const isParamNode = (name) => {
  return name[0] === ":"
}

console.log("children", children)
for (let name in children) {
  if (children.hasOwnProperty(name)) {
    checkNode(name, children[name].as, ["", name], children[name])
  }
}
this.URLHelpers = URLHelpers
