import { stylesheet } from "./style.mjs"
import { view } from "./view.mjs"
import { registry, noisyHandlers } from "./registry.mjs"

export { ns }

// import { ns } from "./webComponent.mjs"
//
// wcomp = ns("my-comp")
// wcomp("my-comp", {"attrName": { getter, setter } })
const ns = function(prefix) {
  const
  componentsReg = registry((v) => {
    if (typeof v !== "object") {
      return ["value should be an object with `.prototype` and `.observedAttributes` properties"]
    }
    if (typeof v.prototype !== "object") {
      return ["`value.prototype` property should be an object"]
    }
    if (!Array.isArray(v.observedAttributes)) {
      return ["`value.observedAttributes` property should be an array of strings"]
    } else {
      if (v.observedAttributes.length > 0) {
        for (let i = 0, attr = v.observedAttributes[i]; i < v.observedAttributes.length; attr = v.observedAttributes[i++]) {
          if (typeof attr !== "string") {
            return [`\`value.observedAttributes\` property should be an array of strings: #${i}`]
          }
        }
      }
    }
  }, noisyHandlers),
  addComp = function({xtag, attrs, stylesReg, stylesheetSetup, templateSetup, connected, disconnected, adopted, attrChanged}) {
    const path = xtag.split("-")
    if (componentsReg.has(path)) {
      console.error(`component \`${xtag}\` already defined`)
      return
    }
    const tag = `${prefix}-${xtag}`,
          component = Object.create(HTMLElement.prototype)

    component.connectedCallback = function() {
      const
      root = this.createShadowRoot({
        mode: "open",
      }),
      style = stylesheet({
        registry: stylesReg,
        setup:    stylesheetSetup,
      })
      root.innerHTML = this.innerHTML + view(templateSetup, { style })
      connected()
    }

    component.disconnectedCallback = disconnected
    component.adoptedCallback = adopted
    component.attributeCangedCallback = attrChanged
    const constructor = {
      prototype: component,
      observedAttributes: attrs,
    }
    componentsReg.set(path, constructor)
    customElements.define(tag, constructor)
  }

  return addComp
}
