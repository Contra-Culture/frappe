export function Universe(setupEventStreams, setupObjects) {
  this.eventStreams = {}
  this.objects = {}
  const stream = (name, builder) => {
          this.eventStreams[name] = eventStream(name, builder)
        },
        object = (name, checkInvariant, setupProps, setupReactions) => {
                   const props = {},
                         reactions = {},
                         prop = (name, getter, setter) => {
                                  props[name] = { getVal: getter,
                                                  setVal: setter,
                                                }
                                },
                         reaction = (name, handler, sendStreams) => {
                                      reactions[name] = { name,
                                                          handler,
                                                          sendStreams,
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
  this.changeLog = []
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

function eventStream(name, buildMsg) {
  const subscribers = {},
        subscribe = (s) => {
          subscribers.push(s)
        },
        push = (...params) => {
          const msg = buildMsg(params)
          subscribers.forEach((s) => { s.send(name, msg) })
        }
  return { subscribe,
           push,
         }
}

export function VM(universe, setupVM) {
  this.universe = universe;
  const VMProxy = {}
  this.config = setupVM(VMProxy)
}

VM.prototype.run = ()=> {

}
