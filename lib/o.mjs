export function Universe(setupEventStreams, setupObjects) {
  // event streams setup
  this.eventStreams = {}
  const stream = (name, builder) => {
    this.eventStreams[name] = new EventStream(name, builder)
  }
  setupEventStreams(stream)

  // objects setup
  this.objects = {}
  const object = (name, invariant, setupProps, reactionsSetup) => {
    const props = {}
    let prop = (name, value, check) => {
      props[name] = { getter: () => {
                        return value;
                      },
                      setter: (v) => {
                        error = check(v)
                        if (typeof error === "string") {
                          value = null
                          return `invalid property "${name}": ${error}`
                        }
                        value = v
                      }
                    }
    }
    setupProps(invariant, prop)
    this.object[name] = new Obj(name, props, invariant, reactions)
  }
  setupObjects(object)
}





function Obj(name, propsSetup, invariant, reactionsSetup) {
  this.name = name
  this.props = {}
  const prop = (name, validator) => {
    this.props[name] = validator
  }
  propsSetup(prop)
  this.invariant = invariant
  this.reactions = {}
  const reacts = () => {

  }
  seactionsSetup(reacts)
}

Obj.prototype.state = () => {
}

function EventStream(name, builder) {
  this.name = name
  this.subscribers = []
  this.builder = builder
}

EventStream.prototype.subscribe = (obj) => {
  this.subscribers.push(obj)
}
EventStream.prototype.push = (...params) => {
  const msg = this.builder.apply(params)
  for (let i = 0, subscriber = this.subscribers[i]; i < this.subscribers.length; subscriber = this.subscribers[i++]) {
    subscriber.send(this.name, msg)
  }
}

export function VM(universe, setupVM) {
  this.universe = universe;
  const VMProxy = {}
  this.config = setupVM(VMProxy)
}

VM.prototype.run = ()=> {

}
