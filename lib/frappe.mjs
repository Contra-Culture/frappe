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
univ.init = function() {
  const head = doc.head
  const body = doc.body

  doc.body.replaceChildren()
}
/*
* univ:end
*/

/*
* app:begin
*/
const App = function(name, setup) {
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
const app = App.prototype
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

