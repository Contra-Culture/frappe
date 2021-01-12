export function Universe(setupEventStreams, setupObjects) {
  this.eventStreams = {}
  this.objects = {}

  const stream = (name, builder) => {
          this.eventStreams[name] = new EventStream(name, builder)
        },
        object = (name, checkInvariant, setupProps, setupReactions) => {
                   const props = {},
                         reactions = {},
                         prop = (name, getter, setter) => {
                                  props[name] = { getVal: getter,
                                                  setVal: setter,
                                                }
                                },
                         reaction = (name, handler, sendChannels) => {
                                      reactions[name] = {
                                        name,
                                        handler,
                                        sendChannels,
                                      }
                                    }

                    setupProps(prop)
                    setupReactions(reaction)
                    this.objects[name] = new Obj(name, checkInvariant, props, reactions)
                  }

  setupEventStreams(stream)
  setupObjects(object)
}

Universe.prototype.inspect = function() {
  console.log("objects:\n", this.objects)
  console.log("eventStreams:\n", this.eventStreams)
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
  for (let i = 0,
           s = this.subscribers[i];
       i < this.subscribers.length;
       s = this.subscribers[i++]) {
    s.send(this.name, msg)
  }
}

export function VM(universe, setupVM) {
  this.universe = universe;
  const VMProxy = {}
  this.config = setupVM(VMProxy)
}

VM.prototype.run = ()=> {

}
