import { stylesheet } from "./style.mjs"
import { viewGen } from "./view.mjs"
import { registry, noisyHandlers, notUndefined } from "./registry.mjs"

export { ns }

// import { ns } from "./webComponent.mjs"
//
// wcomp = ns("my-comp")
// wcomp("my-comp", {"attrName": { getter, setter } })
const ns = function(prefix) {
  const
  componentsReg = registry(notUndefined, noisyHandlers),
  сomp = function({xtag, attrs = [], stylesReg, stylesheetSetup, templateSetup, connected, disconnected, adopted, attrChanged}) {
    const path = xtag.split("-")
    if (componentsReg.has(path)) {
      console.error(`component \`${xtag}\` already defined`)
      return
    }
    const
    tag = `${prefix}-${xtag}`,
    Component = class extends HTMLElement {
      connectedCallback() {
        const
        root = this.createShadowRoot({
          mode: "open",
        }),
        style = stylesheet({
          registry: stylesReg,
          setup: stylesheetSetup,
        }),
        view = viewGen()

        root.innerHTML = this.innerHTML + view(templateSetup, { style })
        connected()
      }
      constructor() {

      }
      disconnectedCallback() {

      }
      adoptedCallback() {

      }
      attributeCangedCallback() {

      }
      static get name() {
        return tag
      }
      static get observedAttributes() {
        return attrs
      }
    }
    componentsReg.set(path, Component)
    customElements.define(tag, Component)
    console.log("component registered", Component)
  }

  return сomp
}
