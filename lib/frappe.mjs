export {
  App,
  Univ,
}

import {
  Registry,
  authPlugin,
  valueValidator,
  noisyNotFoundHandler,
  noisyAlreadyDefinedHandler,
  noisyNotValidHandler,
} from "./util/registry.mjs"

const rootSegment = ""
const __components = Symbol("components registry")
const __apps = Symbol("apps registry")
const __widgets = Symbol("widgets registry")
const __routes = Symbol("routes registry")
const __layout = Symbol("layout")
const __screens = Symbol("screens registry")
const __flows = Symbol("flows registry")

/*
* univ:begin
*/
function Univ(name, loader, setup) {
  Object.defineProperty(this, "name", {
    get: () => { return name },
  })
  Object.defineProperty(this, "loader", {
    get: () => { return loader }
  })
  this[__components] = new Registry({
    validator: valueValidator,
    notFoundHandler: noisyNotFoundHandler,
    alreadyDefinedHandler: noisyAlreadyDefinedHandler,
    notValidHandler: noisyNotValidHandler,
  })
  Object.defineProperty(this, "components", {
    get: () => {
      return this[__components]
    },
  })
  this[__widgets] = new Registry({
    validator: valueValidator,
    notFoundHandler: noisyNotFoundHandler,
    alreadyDefinedHandler: noisyAlreadyDefinedHandler,
    notValidHandler: noisyNotValidHandler,
  })
  Object.defineProperty(this, "widgets", {
      get: () => {
      return this[__widgets]
    },
  })
  this[__apps] = new Map()
  Object.defineProperty(this, "apps", {
    get: () => {
      return this[__apps]
    },
  })
  this[__routes] = new Registry({
    validator: valueValidator,
    notFoundHandler: noisyNotFoundHandler,
    alreadyDefinedHandler: noisyAlreadyDefinedHandler,
    notValidHandler: noisyNotValidHandler,
    plugins: [
      authPlugin,
    ],
  })
  Object.defineProperty(this, "routes", {
    get: () => {
      return this[__routes]
    },
  })

  /*
  * setup:begin
  */
  let error
  const registerComponent = (path, loadPath) => {
    if (error !== undefined) {
      return
    }
    this[__components].setValue(path, {
      loadPath,
    })
  }
  const registerWidget = (path, loadPath) => {
    if (error !== undefined) {
      return
    }
    this[__widgets].setValue(path, {
      loadPath,
    })
  }
  const registerApp = (name, loadPath) => {
    if (error !== undefined) {
      return
    }
    this[__apps].set(name, {
      loadPath,
    })
  }
  const mountApp = (segment, appName) => {
    if (error !== undefined) {
      return
    }
    if (!this[__apps].has(appName)) {
      error = `\`${appName}\` app is not registered`
      console.error(error)
    }
    this[__routes].setValue([segment], {
      appName,
    })
  }
  const mountRootApp = (appName) => {
    mountApp(rootSegment, appName)
  }
  const setupScope = {
    registerComponent,
    registerWidget,
    registerApp,
    mountApp,
    mountRootApp,
  }
  setup(setupScope)
  if (error !== undefined) {
    throw error
  }
  /*
  * setup:end
  */
}

const univ = Univ.prototype
univ.init = function({ window }) {
  const document = window.document
  const head = document.head
  const body = document.body

  document.body.replaceChildren()
}
/*
* univ:end
*/

/*
* app:begin
*/
const Ap = function(name, setup) {
  if (typeof name !== "string") {
    const error = "`name` should be string"
    console.error(error)
    return {
      error,
    }
  }
  if (typeof setup !== "function") {
    const error = "`setup` should be function"
    console.error(error)
    return {
      error,
    }
  }
  Object.defineProperty(this, "name", {
    get: () => {
      return name
    }
  })
  Object.defineProperty(this, "layout", {
    get: () => {
      return this[__layout]
    }
  })
  this[__screens] = new Map()
  Object.defineProperty(this, "screens", {
    get: () => {
      return this[__screens]
    }
  })
  this[__flows] = new Map()
  Object.defineProperty(this, "flows", {
    get: () => {
      return this[__flows]
    }
  })
  this[__routes] = new Registry({
    validator: valueValidator,
    notFoundHandler: noisyNotFoundHandler,
    alreadyDefinedHandler: noisyAlreadyDefinedHandler,
    notValidHandler: noisyNotValidHandler,
    plugins: [
      authPlugin,
    ],
  })

  /*
  * setup:begin
  */
  let error
  const useLayout = (layout) => {
    if (error !== undefined) {
      return
    }
    if (this.__layout) {
      error = "layout already defined"
      console.error(error)
      throw error
    }
    this[__layout] = layout
  }
  const registerScreen = (name, screen) => {
    if (this[__screens].has(name)) {
      error = `\`${name}\` screen already defined`
      console.error(error)
      throw error
    }
    this[__screens].set(name, screen)
  }
  const registerFlow = (name, flow) => {
    if (this[__flows].has(name)) {
      error = `\`${name}\` flow already defined`
      console.error(error)
      throw error
    }
    this[__flows].set(name, flow)
  }
  const mountScreen = (path, name) => {
    const screen = this[__screens][name]
    if (!screen) {
      const error = `screen \`${name}\` is not registered`
      console.error(error)
      return {
        error,
      }
    }
    this[__routes].setValue(path, screen)
  }
  const mountRootScreen = (name) => {
    const screen = this[__screens][name]
    if (!screen) {
      const error = `screen \`${name}\` is not registered`
      console.error(error)
      return {
        error,
      }
    }
    this[__routes].setValue([rootSegment], screen)
  }
  const mountFlow = () => {
    const flow = this[__flows][name]
    if (!flow) {
      const error = `flow \`${name}\` is not registered`
      console.error(error)
      return {
        error,
      }
    }
    this[__routes].setValue(path, flow)
  }
  const mountRootFlow = () => {
    const flow = this[__flows][name]
    if (!flow) {
      const error = `flow \`${name}\` is not registered`
      console.error(error)
      return {
        error,
      }
    }
    this[__routes].setValue([rootSegment], flow)
  }
  const setupScope = {
    useLayout,
    registerScreen,
    registerFlow,
    mountRootScreen,
    mountScreen,
    mountFlow,
    mountRootFlow,
  }
  setup(setupScope)
  if (error !== undefined) {
    throw error
  }
  /*
  * setup:end
  */
}
const app = Ap.prototype
app.enrich = function() {

}
app.init = function() {

}
/*
* app:end
*/

/*
* layout:begin
*/
const Layout = function({ name, template, widgets, screenToLayoutInjections, layoutToScreenInjections }) {
  if (typeof name !== "string") {
    const error = "`name` should be string"
    console.error(error)
    return {
      error,
    }
  }
  // todo: more checks
  if (typeof template !== "object") {
    const error = "`template` should be object"
    console.error(error)
    return {
      error,
    }
  }
  if (widgets !== undefined && !Array.isArray(widgets)) {
    const error = "`widgets` should be undefined or array of strings"
    console.error(error)
    return {
      error,
    }
  } else if (widgets) {
    for (let i = 0, w = widgets[i]; i < widgets.length; w = widgets[i++]) {
      if (typeof w !== "string") {
        const error = `\`widgets\` should be array of strings: \`widgets[${i}]\` is not string`
        console.error(error)
        return {
          error,
        }
      }
    }
  }
  if (screenToLayoutInjections !== undefined && typeof screenToLayoutInjections !== "object") {
    const error = "`screenToLayoutInjections` should be undefined or object"
    console.error(error)
    throw error
  } else if (screenToLayoutInjections) {
    for (const [name, inj] in Object.entries(screenToLayoutInjections)) {
      if (typeof inj !== "function") {
        const error = `\`screenToLayoutInjections[${name}]\` should be function`
        console.error(error)
        return {
          error,
        }
      }
    }
  }
  if (layoutToScreenInjections !== undefined && typeof layoutToScreenInjections !== "object") {
    const error = "`layoutToScreenInjections` should be undefined or object"
    console.error(error)
    throw error
  } else if (layoutToScreenInjections) {
    for (const [name, inj] in Object.entries(layoutToScreenInjections)) {
      if (typeof inj !== "function") {
        const error = `\`layoutToScreenInjections[${name}]\` should be function`
        console.error(error)
        return {
          error,
        }
      }
    }
  }

  Object.defineProperty(this, "name", {
    get: () => {
      return name
    }
  })
  Object.defineProperty(this, "template", {
    get: () => {
      return template
    }
  })
  Object.defineProperty(this, "widgets", {
    get: () => {
      return widgets
    }
  })
  Object.defineProperty(this, "screenToLayoutInjections", {
    get: () => {
      return screenToLayoutInjections
    }
  })
  Object.defineProperty(this, "layoutToScreenInjections", {
    get: () => {
      return layoutToScreenInjections
    }
  })
}
const layout = Layout.prototype
/*
* layout:end
*/

/*
* screen:begin
*/
const Screen = function() {

}
const screen = Screen.prototype
screen.render = function(layout) {

}
/*
* screen:end
*/

/*
* flow:begin
*/
const Flow = function () {

}
const flow = Flow.prototype
/*
* flow:end
*/

const App = function({name, window, HTMLContainer, widgetsSpec, layoutsSpec, screensSpec, routesSpec}) {
  this.name = name
  this.window = window
  this.HTMLContainer = HTMLContainer
  this.layouts = null
  this.currentScreen = null

  // widgets
  if (typeof widgetsSpec !== "object") {
    console.error("widgetsSpec should be object")
    return
  }
  const widgets = {}
  console.log("widget entries: ", Object.entries(widgetsSpec))
  for (let name in widgetsSpec) {
    if (widgetsSpec.hasOwnProperty(name)) {
      let spec = widgetsSpec[name]
      console.log('wgt: ', name, spec)
      const {prepare, render, exit} = spec
      if (prepare !== undefined && typeof prepare !== "function") {
        console.error("widget's prepare should be function")
        return
      }
      if (render !== undefined && typeof render !== "function") {
        console.error("widget's render should be function")
        return
      }
      if (exit !== undefined && typeof exit !== "function") {
        console.error("widget's exit should be function")
        return
      }
      widgets[name] = {
        prepare,
        render,
        exit,
      }
    }
  }
  this.widgets = widgets

  // layouts
  if (typeof layoutsSpec !== "object") {
    console.error("layoutsSpec should be object")
    return
  }
  const layouts = {}
  for (let name in layoutsSpec) {
    if (layoutsSpec.hasOwnProperty(name)) {
      let spec = layoutsSpec[name]
      if (typeof spec !== "object") {
        console.error("layout's spec should be object")
        return
      }
      const {widgets, prepare, render, exit} = spec
      if (!Array.isArray(widgets)) {
        console.error("layout widgets should be array")
        return
      }
      widgets.forEach((wName) => {
        if (typeof this.widgets[wName] !== "object") {
          console.error(`layout ${name} has wrong widget ${wName}`)
          return
        }
      })
      if (prepare !== undefined && typeof prepare !== "function") {
        console.error("layout prepare should be function")
        return
      }
      if (render !== undefined && typeof render !== "function") {
        console.error("layout render should be function")
        return
      }
      if (exit !== undefined && typeof exit !== "function") {
        console.error("layout exit should be function")
        return
      }
      layouts[name] = {
        widgets,
        prepare,
        render,
        exit,
      }
    }
  }
  this.layouts = layouts

  // screens
  if (typeof screensSpec !== "object") {
    console.error("layoutsSpec should be object")
    return
  }

  const screens = {}
  for (let name in screensSpec) {
    if (screensSpec.hasOwnProperty(name)) {
      let spec = screensSpec[name]
      if (typeof spec !== "object") {
        console.error("screen's spec should be object")
        return
      }
      const {layout, widgets, prepare, exit, render} = spec
      if (typeof layout !== "string") {
        console.error("screen's layout should be string")
        return
      }
      if (typeof this.layouts[layout] !== "object") {
        console.error(`screen's ${name} has wrong layout ${layout}`)
        return
      }
      if (!Array.isArray(widgets)) {
        console.error("screen's widgets should be array")
        return
      }
      widgets.forEach((wName) => {
        if (typeof this.widgets[wName] !== "object") {
          console.error(`screen's ${name} has wrong widget ${wName}`)
          return
        }
      })
      if (prepare !== undefined && typeof prepare !== "function") {
        console.error("screen's prepare should be function")
        return
      }
      if (render !== undefined && typeof render !== "function") {
        console.error("screen's render should be function")
        return
      }
      if (exit !== undefined && typeof exit !== "function") {
        console.error("screen's exit should be function")
        return
      }
      screens[name] = {
        layout,
        widgets,
        prepare,
        exit,
        render,
      }
    }
  }
  this.screens = screens
  this.draw = function(html) {
    this.HTMLContainer.innerHTML = html
  }
  // dispatcher
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
}

