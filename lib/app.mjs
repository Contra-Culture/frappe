export {
  App,
}

function App(name, window, HTMLContainer, widgetsSpec, layoutsSpec, screensSpec, routesSpec) {
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

