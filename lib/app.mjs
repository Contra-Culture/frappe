export function App(name, document, setupWidgets, setupScreens, setupRoutes) {
  this.name = name
  this.document = document
  this.widgets = {}
  this.screens = {}
  this.screenFinder = null
  this.routes = {}

  let widget = (name, o) => {
    this.widgets[name] = Widget(name, o)
  }
  setupWidgets(widget)

  let screen = (name, widgets, fn) => {
    this.screens[name] = new Screen(name, widgets, fn)
  }
  setupScreens(screen)

  let screenFinder = null
  const sfGen = (screen, data, chunkMatcher, setupChildren) => {
    const __sfGen = function(screen, data, chunkMatcher, setupChildren) {
      const children = []
      if ( setupChildren !== null ) {
        const node = (screen, data, chunkMatcher, setupChildren) => {
          children.push(__sfGen(screen, data, chunkMatcher, setupChildren))
        }
        setupChildren(node)
      }
      return (URLChunks, idx) => {
        if (idx === undefined) {
          idx = 0
        }
        const chunk = URLChunks[idx]
        if ( chunkMatcher(chunk) ) {
          if ( idx === URLChunks.length - 1 ) {
            return { screen,
                     data,
                   }
          } else {
            console.log("children: ", children)
            for ( let i = 0,
                      child = children[i];
                  i < children.length;
                  child = children[i++] ) {
              let found = child(URLChunks, idx + 1)
              if (typeof found === "object") {
                return found
              }
            }
          }
        }
      }
    }
    screenFinder = __sfGen(screen, data, chunkMatcher, setupChildren);
  }

  setupRoutes(sfGen)
  this.screenFinder = screenFinder
}

App.prototype.findRoute = function() {
  console.log("location.pathname: ", this.document.location.pathname)

  let chunks = this.document.location.pathname.split("/")
  console.log("chunks", chunks)
  return this.screenFinder(chunks)
}

function Screen(name, fn) {
  this.name = name
  this.fn = fn
}

function Widget(name, o) {
  this.name = name
  this.o = o
}
