export function App(name, window, HTMLContainer, routesSpec) {
  this.name = name
  this.window = window
  this.HTMLContainer = HTMLContainer
  this.screens = { root: (data)=>{
                               return `<pre style="display:block;width:960px;padding:20px;margin:100px auto;background-color:#e5e7e9">screen: ${data.screen}</pre>`
                             },
                 }

  this.draw = function(html) {
    console.log("draw", html)
    this.HTMLContainer.innerHTML = html
  }

  const {data, children, matches} = routesSpec
  if (typeof data !== "object") {
    console.log("root's data should be object")
    return
  }
  data.screen = "root"
  if (children !== undefined && typeof children !== "object") {
    console.log("root's children should be undefined or an object")
    return
  }
  if (matches !== undefined) {
    console.log("root node needs no matches")
    return
  }
  routesSpec.matches = (_) => { return true }
  this.routesSpec = {root: routesSpec}
  this.URLHelpers = {root: ()=>{
    window.history.pushState(data, "root title", "/")
    const html = this.screens[data.screen](data)
    this.draw(html)
  }}
}

