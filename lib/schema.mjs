// spec("order", (dsl) => {
//   dsl.array("items", (dsl) => {
//     dsl.variant()
//   })
// })

const spec = (name, setup) => {
  const spec = {spec: null}
  const dsl = {
    map:     map.bind(spec),
    array:   array.bind(spec),
    record:  record.bind(spec),
    string:  string.bind(spec),
    number:  number.bind(spec),
    variant: variant.bind(spec),
    object:  object.bind(spec),
  }
  setup(dsl)
  return
}

const map = (name, setup) => {
  if (this.spec) {
    console.error(`spec already defined: ${this.spec.name}`)
    return
  }
  let __keyMatches
  let __valueMatches
  const dsl ={
    map: map.bind(spec),
    array: array.bind(spec),
    record: record.bind(spec),
    string: string.bind(spec),
    number: number.bind(spec),
    variant: variant.bind(spec),
    object: object.bind(spec),
    keyMatches: (k) => {
      if (__keyMatches) {
        console.error("`keyMatches` already specified")
        return
      }
      if(typeof __keyMatches !== "function") {
        console.error("`keyMatches` should be a function of key(string)")
        return
      }
      __keyMatches = k
    },
    valueMatches: (spec) => {

    },
  }

  setup({keyMatches})
  this.spec = {
    name,
    match: (v) => {
      if (typeof v !== "object") {
        return `\`${name}\` should be object`
      }
      for (let p in v) {
        if (v.hasOwnProperty(p)) {
          let errors = kmatch(p)
          if (errors) {
            return errors
          }
          errors = vspec.match(v[p])
          if (errors) {
            return errors
          }
        }
      }
    }
  }
}

const array = () => {
  if (this.spec) {
    console.error(`spec already defined: ${this.spec.name}`)
    return
  }
  this.spec = {
    name,
    match: (v) => {
      if (typeof v !== "object") {
        return `\`${name}\` should be object`
      }
    }
  }
}

const record = () => {

}

const string = () => {

}

const number = () => {

}

const variant = () => {

}

const object = () => {

}

