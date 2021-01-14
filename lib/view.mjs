
export const view = (setup) => {
  const buff = []
  const helpers = {
    safe: (safe) => {
            buff.push(safe)
          },
    unsafe: (unsafe) => {
      safe = unsafe.replaceAll("&", "&amp;")
                   .replaceAll("<", "&lt;")
                   .replaceAll(">", "&gt;")
                   .replaceAll('"', "&quot;")
      buff.push(safe)
    },
    tag:  (name, attrs, setupChildren) => {
            if (attrs != null && typeof attrs === "object") {
              buff.push(`<${name} `)
              for (let a in attrs) {
                if (attrs.hasOwnProperty(a)) {
                  buff.push(`${a}="${attrs[a]}" `)
                }
              }
              buff.push(">")
            } else {
              buff.push(`<${name}>`)
            }
            if (typeof setupChildren === "function") {
              setupChildren(helpers)
            }
            buff.push(`</${name}>`)
          },
  }
  setup(helpers)
  return buff.join("")
}
