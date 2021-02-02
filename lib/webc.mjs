import {
  stylesheet,
} from "./style.mjs"

import {
  viewGen,
} from "./view.mjs"

import {
  registry,
  valueValidator,
  noisyNotFoundHandler,
  noisyAlreadyDefinedHandler,
  noisyNotValidHandler,
} from "./util/registry.mjs"

export {
  ns,
  customAttr,
  attr,
}

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
  const componentsReg = registry({
    validator: valueValidator,
    notFoundHandler: noisyNotFoundHandler,
    alreadyDefinedHandler: noisyAlreadyDefinedHandler,
    notValidHandler: noisyNotValidHandler,
  })
  const сomp = function({xtag, attrsSetup, style, templateSetup, triggersEvents, listensEvents, hooks}) {
    const path = xtag.split("-")
    let error = null
    if (componentsReg.hasPath(path)) {
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

    const triggers = []
    if (triggersEvents) {
      if (!Array.isArray(triggersEvents)) {
        error = "`triggersEvents` should be undefined, null or an array of objects"
        console.error(error)
        return[error]
      }
      for (let i = 0, { name, messageFactory } = triggersEvents[i]; i < triggersEvents.length; { name, messageFactory } = triggersEvents[i++]) {
        if (typeof name !== "string") {
          error = "event's `name` should be string"
          console.error(error)
          return [error]
        }
        if (triggers[name] !== undefined) {
          error = `trigger for \`${name}\` already defined`
          console.error(error)
          return [error]
        }
        if (typeof messageFactory !== "function") {
          error = "event's `messageFactory` should be function"
          console.error(error)
          return [error]
        }
        triggers.push(name)
        triggers[name] = messageFactory
      }
    }

    const listens = []
    if (listensEvents) {
      if (!Array.isArray(listensEvents)) {
        error = "`listensEvents` should be undefined, null or an array of objects"
        console.error(error)
        return [error]
      }
      for (let i = 0,
               { name, handler } = listensEvents[i];
           i < listensEvents.length;
           { name, handler } = listensEvents[i++]) {
        if (typeof name !== "string") {
          error = "event's `name` should be string"
          console.error(error)
          return [error]
        }
        if (listens[name] !== undefined) {
          error = `handler for \`${name}\` already defined`
          console.error(error)
          return [error]
        }
        if (typeof handler !== "function") {
          error = "event's `handler` should be function"
          console.error(error)
          return [error]
        }
        listens.push(name)
        listens[name] = handler
      }
    }
    if (hooks && typeof hooks !== "object") {
      error = "`hooks` should be an object with properties: `connected`, `disconnected`, `adopted`, `attrChanged`"
      console.error(error)
      return [error]
    }
    const { connected, disconnected, adopted, attrChanged } = hooks
    if (connected && typeof connected !== "function") {
      error = "`hooks.connected` should be a function"
      console.error(error)
      return [error]
    }
    if (disconnected && typeof disconnected !== "function") {
      error = "`hooks.disconnected` should be a function"
      console.error(error)
      return [error]
    }
    if (adopted && typeof adopted !== "function") {
      error = "`hooks.adopted` should be a function"
      console.error(error)
      return [error]
    }
    if (attrChanged && typeof attrChanged !== "function") {
      error = "`hooks.attrChanged` should be a function"
      console.error(error)
      return [error]
    }

    const view = viewGen((injection) => {
      injection("style", (dsl) => {
        dsl.tag("style", (dsl) => {
          dsl.safe(style)
        })
      })
      injection("attributes", (dsl) => {
        const attrs = this.attributes
        for (let i = 0, attrName = attrs[i]; i < attrs.length; attrName = attrs[i++]) {
          dsl.unsafe(`${attrName}=${JSON.stringify(attrs[attrName].get())}`)
        }
      })
      injection("componentName", (dsl) => {
        dsl.safe(tag)
      })
    })
    const Component = class extends HTMLElement {
      constructor() {
        super()
        this.attachShadow({
          mode: "open",
        })
        this.shadowRoot.innerHTML = view(templateSetup)
        this.triggerEvent = (name, ...args) => {
          const factory = triggers[name]
          if (!factory) {
            const error = `trigger \`${name}\` does not exist`
            console.error(error)
            return [error]
          }
          const { message, error } = factory(...args)
          if (error) {
            console.log(`wrong message arguments: ${message}`)
            return [error]
          }
        }
      }
      connectedCallback() {
        if (this.isConnected) {
          for (let i = 0,
                   name = listens[i],
                   handler = listens[name];
               i < listens.length;
               name = listens[i++],
               handler = listens[name]) {
            this.addEventListener(name, handler, true)
          }
        }
        if (connected) {
          connected()
        }
      }
      disconnectedCallback() {
        for (let i = 0,
          name = listens[i];
          i < listens.length;
          name = listens[i++]) {
          this.removeEventListener(name, null)
        }
        if (disconnected) {
          disconnected()
        }
      }
      adoptedCallback() {
        if (adopted) {
          adopted()
        }
      }
      attributeChangedCallback(name, oldVal, newVal) {
        if (attrChanged) {
          attrChanged(name, oldVal, newVal)
        }
      }
      get attributes() {
        return __attributes
      }
      static get name() {
        return tag
      }
      static get observedAttributes() {
        return __attributes
      }
    }
    window.customElements.define(tag, Component)
  }
  return сomp
}
