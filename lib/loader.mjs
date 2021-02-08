export {
  Loader,
}

import {
  Registry,
  noisyNotFoundHandler,
  noisyAlreadyDefinedHandler,
  noisyNotValidHandler,
  valueValidator,
} from "./util/registry.mjs"

const __scripts = Symbol("scripts")
const scriptRecord = (value) => {
  if (typeof v === "object" && value.constructor && value.constructor.name !== "HTMLScriptElement") {
    const error = "`value` should be an object constructed by `HTMLScriptElement`"
    console.error(error)
    return [error]
  }
}
const Loader = function() {
  this[__scripts] = new Registry({
    validator: scriptRecord,
    valueValidator,
    notFoundHandler: noisyNotFoundHandler,
    alreadyDefinedHandler: noisyAlreadyDefinedHandler,
    notValidHandler: noisyNotValidHandler,
  })
}
const loader = Loader.prototype
loader.load = function(path, { title, src, async, defer }) {
  const scriptRecord = {
    title,
    src,
    async,
    defer,
  }
  const scriptElem = document.createElement("script")
  scriptElem.setAttribute("title", title)
  scriptElem.setAttribute("src", src)
  scriptElem.setAttribute("async", async)
  scriptElem.setAttribute("defer", defer)
  scriptElem.setAttribute("type", "module")

  document.head.appendChild(scriptElem)
  path = path.concat(title)
  this[__scripts].setValue(path, scriptRecord)
  console.log(`script \`${title}\` loaded`)
}
loader.unload = function(path) {
  for (const [title, scriptElem] in this[__scripts].getValues(path)) {
    console.log(`script \`${title}\` unloaded`)
    document.head.removeChild(scriptElem)
  }
}

