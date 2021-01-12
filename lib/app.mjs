export function App(name, setupWidgets, setupScreens, setupRoutes) {
  this.name = name
  this.widgets = {}
  this.screens = {}
  this.router = null

  let widget = (name, o) => {
    this.widgets[name] = Widget(name, o)
  }
  setupWidgets(widget)

  let screen = (name, widgets, fn) => {
    this.screens[name] = new Screen(name, widgets, fn)
  }
  setupScreens(screen)

  let node = ()=>{

  }
  setupRoutes(onRouteNotFound, root)
}

function Router() {

}

function Screen(name, fn) {
  this.name = name
  this.fn = fn
}

function Widget(name, o) {
  this.name = name
  this.o = o
}
