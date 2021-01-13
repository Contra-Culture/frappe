export function App(name, window, HTMLContainer, routesSpec) {
  this.name = name
  this.window = window
  this.HTMLContainer = HTMLContainer
  this.screens = { root:
                     (data) => {
                       return `<pre style="display:block;width:960px;padding:20px;margin:100px auto;background-color:#e5e7e9">screen: ${data.screen}</pre>`
                     },
                   articles:
                     (data) => {
                       return `<pre style="display:block;width:960px;padding:20px;margin:100px auto;background-color:#e5e7e9">screen: ${data.screen}</pre>`
                     },
                 }

  this.draw = function(html) {
    console.log("draw", html)
    this.HTMLContainer.innerHTML = html
  }

  const {data, children, matches} = routesSpec
  if (typeof data !== "object") {
    console.error("root's data should be object")
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
  this.routesSpec = {root: routesSpec}
  const URLHelpers = { root: () => {
                                      window.history.pushState(data, null, "/")
                                      const html = this.screens[data.screen](data)
                                      this.draw(html)
                                   },
                     },
        checkNode =
          (name, nodePath, nodeParams) => {
            if (isParamNode(name)) {
              if (typeof nodeParams.matches !== "function") {
                console.error(`node ${name} is a param node so that it should have matches specified`)
                return
              }
            } else {
              if (nodeParams.matches !== undefined) {
                console.error(`node ${name} is not param node so that it needs no matches`)
                return
              }
            }

            URLHelpers[name] =
              (...routeParams) => {
                console.log("url helper: ", name, nodePath, nodeParams)
                const pathChunks = []
                nodePath.forEach((chunk) => {
                  if (chunk === "") {
                    return
                  }

                  if (isParamNode(chunk)) {
                    if (routeParams[chunk] == null) { // null, undefined or NaN
                      console.error(`URL helper ${name} has no param ${chunk}`)
                      return
                    }
                    if (nodeParams.matches(routeParams[chunk])) {
                      chunk = routeParams[chunk]
                    } else {
                      console.error(`URL helper ${name} do not matches param ${chunk} (value: ${routeParams[chunk]})`)
                      return
                    }
                  }
                  pathChunks.push(chunk)
                })
                const path = pathChunks.join("/")
                const data = nodeParams.data
                window.history.pushState(data, null, path)
                console.log("screens:", this.screens, data)
                const html = this.screens[data.screen](data)
                this.draw(html)
              }

              if (nodeParams.children !== undefined && typeof nodeParams.children !== "object") {
                for (const [name, nodeParams] in Object.entries(nodeParams.children)) {
                  const nodePath = [...nodePath, name]
                  checkNode(name, nodePath, nodeParams)
                }
              }
          },
        isParamNode =
          (name) => {
            return name[0] === ":"
          }
  console.log("children", children)
  for (let name in children) {
    if (children.hasOwnProperty(name)) {
      console.log("children 1st lvl: ", name, children[name])
      checkNode(name, ["", name], children[name])
    }
  }
  this.URLHelpers = URLHelpers
}

