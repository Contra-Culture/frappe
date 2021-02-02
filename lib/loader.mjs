export {
  loader,
}

import {
  registry,
  noisyNotFoundHandler,
  noisyAlreadyDefinedHandler,
  noisyNotValidHandler,
  notUndefined,
} from "./util/registry.mjs"

const scriptRecord = (value) => {
  if (typeof v === "object" && value.constructor && value.constructor.name !== "HTMLScriptElement") {
    const error = "`value` should be an object constructed by `HTMLScriptElement`"
    console.error(error)
    return [error]
  }
}
const loader = function(window) {
  const scriptsRegistry = registry({
    validator: scriptRecord,
    notUndefined,
    notFoundHandler: noisyNotFoundHandler,
    alreadyDefinedHandler: noisyAlreadyDefinedHandler,
    notValidHandler: noisyNotValidHandler,
  })
  const doc = window.document
  const head = doc.head

  const load = (path, {title, src, async, defer }) => {
    const scriptRecord = {
      title,
      src,
      async,
      defer,
    }
    const scriptElem = doc.createElement("script")
    scriptElem.setAttribute("title", title)
    scriptElem.setAttribute("src", src)
    scriptElem.setAttribute("async", async)
    scriptElem.setAttribute("defer", defer)
    scriptElem.setAttribute("type", "module")
    head.appendChild(scriptElem)
    path = path.concat(title)
    scriptsRegistry.setValue(path, scriptRecord)
    console.log(`script \`${title}\` loaded`)
  }

  const unload = (path) => {
    for (const [title, scriptElem] in scriptsRegistry.getValues(path)) {
      console.log(`script \`${title}\` unloaded`)
      head.removeChild(scriptElem)
    }
  }

  return {
    load,
    unload,
  }
}