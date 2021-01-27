import { stylesheet } from "./style.mjs"
import { viewGen } from "./view.mjs"
import { registry, noisyHandlers, notUndefined } from "./registry.mjs"

export { ns, customAttr, attr }

const notUndefined = function(value) {
  if (value === undefined) {
    return ["attribute's `value` should not be undefined"]
  }
}
const customAttr = function(name, getter, setter) {
  const that = {
    name,
    value: null,
  }
  const get = getter.bind(that)
  return {
    write: () => {
      this.buff.push(` ${name}="${JSON.stringify(get())}"`)
    },
    get,
    set: setter.bind(that),
  }
}
const attr = function(name, validator) {
  let value = null
  const valid = validator
  return {
    write: () => { this.buff.push(` ${name}="${JSON.stringify(value)}"`) },
    get: () => { return value },
    set: (v) => {
      const errors = valid(v)
      if (errors) {
        console.error(`invalid attribute \`${name}\` value:`, errors)
        return
      }
      value = v
    },
  }
}
// import { ns } from "./webComponent.mjs"
//
// wcomp = ns("my-comp")
// wcomp("my-comp", {"attrName": { getter, setter } })
const ns = function(prefix) {
  const componentsReg = registry(notUndefined, noisyHandlers)
  const сomp = function({xtag, attrs, style, templateSetup, connected, disconnected, adopted, attrChanged}) {
    const path = xtag.split("-")
    if (componentsReg.has(path)) {
      console.error(`component \`${xtag}\` already defined`)
      return
    }
    const tag = `${prefix}-${xtag}`



    const view = viewGen((injection) => {
      injection("style", (dsl) => {
        dsl.tag("style", (dsl) => {
          dsl.safe(style)
        })
      })
      injection("metaComment", (dsl) => {
        dsl.safe(`<!--- component: ${xtag} --->`)
      })
    })
    const Component = class extends HTMLElement {
      constructor() {
        this.createShadowRoot({
          mode: "open",
        })

        root.innerHTML = this.innerHTML + view(templateSetup)
      }
      connectedCallback() {

      }
      disconnectedCallback() {

      }
      adoptedCallback() {

      }
      attributeChangedCallback() {

      }
      static get name() {
        return tag
      }
      static get observedAttributes() {
        return attrs
      }
    }

  }

  return сomp
}
