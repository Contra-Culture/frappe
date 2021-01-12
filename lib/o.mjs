export function Universe(setupEventStreams, setupObjects) {
  // event streams setup
  this.eventStreams = {}
  const stream = (name, builder) => {
    this.eventStreams[name] = new EventStream(name, builder)
  }
  setupEventStreams(stream)

  // objects setup
  this.objects = {}
  const object = (name, checkInvariant, setupProps, setupReactions) => {
    const props = {}
    const prop = (name, getter, setter) => {
      props[name] = { getter, setter }
    }
    setupProps(prop)

    const reactions = {}
    const reaction = (name, handler, sendChannels) => {
      reactions[name] = { name, handler, sendChannels }
    }
    setupReactions(reaction)

    this.objects[name] = new Obj(name, checkInvariant, props, reactions)
  }
  setupObjects(object)
}





function Obj(name, checkInvariant, props, reactions) {
  this.name = name
  this.checkInvariant = checkInvariant
  this.props = props
  this.reactions = reactions
}

Obj.prototype.send = (chName, msg) => {
  this.reactions[chName].handler(msg)
}

Obj.prototype.state = () => {
  const state = {}
  for (let p in this.props) {
    if (this.props.hasOwnProperty(p)) {
      state[p] = this.props[p].getter()
    }
  }
  return state
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
