import { stylesheet } from "./style.mjs"
import { viewGen } from "./view.mjs"
import { registry, noisyHandlers, notUndefined } from "./registry.mjs"

export { ns }

// import { ns } from "./webComponent.mjs"
//
// wcomp = ns("my-comp")
// wcomp("my-comp", {"attrName": { getter, setter } })
const ns = function(prefix) {
  const componentsReg = registry(notUndefined, noisyHandlers)
  const сomp = function({xtag, attrs = {}, stylesReg, stylesheetSetup, templateSetup, connected, disconnected, adopted, attrChanged}) {
    const path = xtag.split("-")
    if (componentsReg.has(path)) {
      console.error(`component \`${xtag}\` already defined`)
      return
    }
    const tag = `${prefix}-${xtag}`
    const style = stylesheet({
      registry: stylesReg,
      setup: stylesheetSetup,
    })
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
