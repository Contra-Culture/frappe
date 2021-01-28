import { stylesheet } from "./style.mjs"
import { viewGen } from "./view.mjs"
import { registry, noisyHandlers, notUndefined } from "./registry.mjs"

export { ns, customAttr, attr }

const customAttr = function(name, getter, setter) {
  return (() => {
    const that = {
      name,
      value: null,
    }
    return {
      name,
      get: getter.bind(that),
      set: setter.bind(that),
    }
  })()
}
const attr = function(name, validator) {
  const valid = validator
  return (() => {
    let value = null
    return {
      name,
      get: () => { return value },
      set: (v) => {
        const errors = valid(v)
        if (errors) {
          console.error(`invalid attribute \`${name}\`: ${JSON.stringify(errors)}`)
          return
        }
        value = v
      },
    }
  })()
}
// import { ns } from "./webComponent.mjs"
//
// wcomp = ns("my-comp")
// wcomp("my-comp", {"attrName": { getter, setter } })
const ns = function(prefix) {
  const componentsReg = registry(notUndefined, noisyHandlers)
  const сomp = function({xtag, attrsSetup, style, templateSetup, emitsEvents, handlesEvents, connected, disconnected, adopted, attrChanged}) {
    const path = xtag.split("-")
    let error = null
    if (componentsReg.has(path)) {
      error = `component \`${xtag}\` already defined`
      console.error(error)
      return [error]
    }
    const tag = `${prefix}-${xtag}`
    if (attrsSetup !== undefined && attrsSetup !== null && typeof attrsSetup !== "function") {
      error = "`attrsSetup` should be null, undefined or a function"
      console.error(error)
      return [error]
    }
    const __attributes = []
    const attr = (params) => {
      if (error) {
        return
      }
      const {name, get, set} = params
      if (typeof name !== "string") {
        error = `\`${name}\` should be string`
        console.error(error)
        return [error]
      }
      if (typeof get !== "function") {
        error = `\`${get}\` should be function`
        console.error(error)
        return [error]
      }
      if (typeof set !== "function") {
        error = `\`${set}\` should be function`
        console.error(error)
        return [error]
      }
      if (__attributes[name] !== undefined) {
        error = `\`${name}\` already defined`
        console.error(error)
        return [error]
      }
      __attributes[name] = { name, get, set }
      __attributes.push(name)
    }
    attrsSetup(attr)

    const view = viewGen((injection) => {
      injection("style", (dsl) => {
        dsl.tag("style", (dsl) => {
          dsl.safe(style)
        })
      })
      injection("metaComment", (dsl) => {
        dsl.safe(`<!--- component: ${xtag} --->`)
      })
      injection("attributes", (dsl) => {
        const attrs = this.attributes
        for (let i = 0, attrName = attrs[i]; i < attrs.length; attrName = attrs[i++]) {
          dsl.unsafe(`${attrName}=${JSON.stringify(attrs[attrName].get())}`)
        }
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
      get attributes() {
        return __attributes
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
