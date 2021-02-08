export {
  App,
  Univ,
  Layout,
  Screen,
  Flow,
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
const __name = Symbol("name")
const __template = Symbol("template")
const __loader = Symbol("loader")
const __components = Symbol("components registry")
const __apps = Symbol("apps registry")
const __widgets = Symbol("widgets registry")
const __routes = Symbol("routes registry")
const __layout = Symbol("layout")
const __screens = Symbol("screens registry")
const __flows = Symbol("flows registry")
const __screenToLayoutInjections = Symbol("screen to layout injections")
const __layoutToScreenInjections = Symbol("layout to screen injections")

class Univ {
  constructor(name, loader) {
    this[__name] = name
    this[__loader] = loader
    this[__components] = new Registry({
      validator: valueValidator,
      notFoundHandler: noisyNotFoundHandler,
      alreadyDefinedHandler: noisyAlreadyDefinedHandler,
      notValidHandler: noisyNotValidHandler,
    })
    this[__widgets] = new Registry({
      validator: valueValidator,
      notFoundHandler: noisyNotFoundHandler,
      alreadyDefinedHandler: noisyAlreadyDefinedHandler,
      notValidHandler: noisyNotValidHandler,
    })
    this[__apps] = new Map()
    this[__routes] = new Registry({
      validator: valueValidator,
      notFoundHandler: noisyNotFoundHandler,
      alreadyDefinedHandler: noisyAlreadyDefinedHandler,
      notValidHandler: noisyNotValidHandler,
      plugins: [
        authPlugin,
      ],
    })
  }
  get name() {
    return this[__name]
  }
  get components() {
    return this[__components]
  }
  get widgets() {
    return this[__widgets]
  }
  get apps() {
    return this[__apps]
  }
  get routes() {
    return this[__routes]
  }
  init() {
    const head = doc.head
    const body = doc.body

    doc.body.replaceChildren()
  }
  loadApp(name, src, async, defer ) {
    const title = `\`${name}\` frappe app`
    this[__loader].load(["apps", name], {
      title,
      src,
      async,
      defer,
    })
  }
  loadComponent(name, src, async, defer) {
    const title = `\`${name}\` frappe component`
    this[__loader].load(["components", name], {
      title,
      src,
      async,
      defer,
    })
  }
  loadWidget = function (name, src, async, defer) {
    const title = `\`${name}\` frappe widget`
    this[__loader].load(["widgets", name], {
      title,
      src,
      async,
      defer,
    })
  }
  registerComponent(path, component) {
    const name = path.join("__")
    this[__components].setValue(path, {
      component,
    })
    console.log(`\`${name}\` widget registered`)
  }
  registerWidget(path, widget) {
    const name = path.join("__")
    this[__widgets].setValue(path, {
      widget,
    })
    console.log(`\`${name}\` widget registered`)
  }
  registerApp(name, app) {
    this[__apps].set(name, {
      app,
    })
    console.log(`\`${name}\` app registered`)
  }
  mountApp(segment, appName) {
    if (!this[__apps].has(appName)) {
      error = `\`${appName}\` app is not registered`
      console.error(error)
    }
    this[__routes].setValue([segment], {
      appName,
    })
  }
  mountRootApp(appName) {
    mountApp(rootSegment, appName)
  }
}

class App {
  constructor(name) {
    if (typeof name !== "string") {
      const error = "`name` should be string"
      console.error(error)
      return {
        error,
      }
    }
    this[__name] = name
    this[__screens] = new Map()
    this[__routes] = new Registry({
      validator: valueValidator,
      notFoundHandler: noisyNotFoundHandler,
      alreadyDefinedHandler: noisyAlreadyDefinedHandler,
      notValidHandler: noisyNotValidHandler,
      plugins: [
        authPlugin,
      ],
    })
    this[__flows] = new Map()
  }
  get name() {
    return this[__name]
  }
  get layout() {
    return this[__layout]
  }
  get screens() {
    return this[__screens]
  }
  get flows() {
    return this[__flows]
  }
  useLayout(layout) {
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
  registerScreen(name, screen) {
    if (this[__screens].has(name)) {
      error = `\`${name}\` screen already defined`
      console.error(error)
      throw error
    }
    this[__screens].set(name, screen)
  }
  registerFlow(name, flow) {
    if (this[__flows].has(name)) {
      error = `\`${name}\` flow already defined`
      console.error(error)
      throw error
    }
    this[__flows].set(name, flow)
  }
  mountScreen(path, name) {
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
  mountRootScreen(name) {
    this.mountScreen([rootSegment], name)
  }
  mountFlow(path, name) {
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
  mountRootFlow(name) {
    this.mountFlow([rootSegment], name)
  }
  enrich() {

  }
  init() {

  }
}

class Layout {
  constructor({ name, template, widgets, screenToLayoutInjections, layoutToScreenInjections }) {
    if (typeof name !== "string") {
      const error = "`name` should be string"
      console.error(error)
      return {
        error,
      }
    }
    this[__name] = name
    // todo: more checks
    if (typeof template !== "object") {
      const error = "`template` should be object"
      console.error(error)
      return {
        error,
      }
    }
    this[__template] = template
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
    this[__widgets] = widgets // todo
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
    this[__screenToLayoutInjections] = screenToLayoutInjections
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
    this[__layoutToScreenInjections] = layoutToScreenInjections
  }
  get name() {
    return this[__name]
  }
  get template() {
    return this[__template]
  }
  get widgets() {
    return this[__widgets]
  }
  get screenToLayoutInjections() {
    return this[__screenToLayoutInjections]
  }
  get layoutToScreenInjections() {
    return this[__layoutToScreenInjections]
  }
}

class Screen {
  constructor() {

  }
  render() {

  }
}

class Flow {
  constructor() {

  }
}
