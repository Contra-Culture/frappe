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
                   article:
                     (data) => {
                       return `<pre style="display:block;width:960px;padding:20px;margin:100px auto;background-color:#e5e7e9">screen: ${data.screen}, articleID: ${data.routeParams.articleID}</pre>`
                     },
                 }

  this.draw = function(html) {
    this.HTMLContainer.innerHTML = html
  }

  const {as, data, children, matches} = routesSpec
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
  if (children !== undefined && typeof children !== "object") {
    console.error("root's children should be undefined or an object")
    return
  }
  if (matches !== undefined) {
    console.error("root node needs no matches")
    return
  }
  routesSpec.matches = (_) => { return true }
  this.routesSpec = {root: routesSpec.as}
  const URLHelpers = { root: () => {
                                      window.history.pushState(data, null, "/")
                                      const html = this.screens[data.screen](data)
                                      this.draw(html)
                                   },
                     },
        checkNode =
          (name, as, nodePath, nodeParams) => {
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
            URLHelpers[as] =
              (routeParams) => {
                if (routeParams === undefined) {
                  routeParams = {}
                }
                const data = JSON.parse(JSON.stringify(nodeParams.data))

                const pathChunks = []
                console.log("init nodeParams:", nodeParams)
                data.routeParams = routeParams
                console.log("finish nodeParams:", nodeParams)

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
                    if (nodeParams.matches(routeParams[key])) {
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
                const html = this.screens[data.screen](data)
                this.draw(html)
              }

              if (nodeParams.children !== undefined && typeof nodeParams.children !== "object") {
                console.error(`node ${name} has wrong children`)
                return
              }
              if (typeof nodeParams.children === "object") {
                console.log("childrens 2nd lvl:", name, nodeParams)
                for (const name in nodeParams.children) {
                  const _nodePath = [...nodePath, name]
                  checkNode(name, nodeParams.children[name].as, _nodePath, nodeParams.children[name])
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
      checkNode(name, children[name].as, ["", name], children[name])
    }
  }
  this.URLHelpers = URLHelpers
}

