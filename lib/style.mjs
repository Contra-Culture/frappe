import { registry, noisyHandlers } from "./registry.mjs"

export { stylesRegistry, prop, stylesheet }

const
prop = function(prop, ...values) {
  if (Array.isArray) {
    values = values.join(", ")
  }
  return {prop, values}
},
propsListValidator = function(value) {
  if (!Array.isArray(value)) {
    return ["value should be array of CSS style properties"]
  }
  for (let i = 0, p = value[i]; i < value.length; p = value[i++]) {
    if (typeof p.prop !== "string") {
      return [`invalid property: \`[${i}].prop\` should be a string`]
    }
    if (typeof p.values !== "string" && !Array.isArray(p.values)) {
      return [`invalid property ${p.prop}: \`[${i}].values\` should be a string or an array of strings`]
    }
  }
},
stylesRegistry = function() {
  return registry(propsListValidator, noisyHandlers)
},
// const stylesReg = stylesRegistry()
// stylesReg.set("custom/butons/plain", [{prop: "background-color:", values: "#f5f6f7"}])
//
// const CSSOMRoot = stylesheet("my-stylesheet", document.head, stylesReg, (css) => {
//   css.style({selector: ".my-selector", setup: (css) => {
//     css.mixin("custom/buttons/plain")
//     css.prop("color", "#444444")
//   }})
// })
stylesheet = (title, container, registry, setup) => {
  const stylesContainer = document.createElement("style"),
        stylesheet = {
          buff: [],
          indent: "",
          registry,
        }
  stylesContainer.setAttribute("title", title)
  setup({
    style:     cssStyleRule.bind(stylesheet),
    import:    cssImportRule.bind(stylesheet),
    media:     cssMediaRule.bind(stylesheet),
    fontFace:  cssFontFaceRule.bind(stylesheet),
    page:      cssPageRule.bind(stylesheet),
    namespace: cssNamespaceRule.bind(stylesheet),
    keyframes: cssKeyframesRule.bind(stylesheet),
    supports:  cssSupportsRule.bind(stylesheet),
  })
  stylesContainer.textContent = stylesheet.buff.join("\n")
  container.appendChild(stylesContainer)
  for (let i = 0, ss = document.styleSheets[i]; i < document.styleSheets.length; ss = document.styleSheets[i++]) {
    if (ss.title === title) {
      return ss
    }
  }
},
cssStylePropRule = function ({prop, values}) {
  if (Array.isArray(values)) {
    values = values.join(", ")
  }
  this.buff.push(`${prop}: ${values};`)
},
// h1 {           // selectror
//   color: pink; // styleProps[0]
// }
cssStyleRule = function({selector, setup}) {
  this.buff.push(`${selector} {`)
  setup({
    mixin: cssMixin.bind(this),
    prop: cssStylePropRule.bind(this),
  })
  this.buff.push("}")
},
// The @import CSS at-rule is used to import style rules from other style sheets.
//
// @import url;
// @import url list-of-media-queries;
// @import url supports(supports-query);
// @import url supports(supports-query) list-of-media-queries;
//
// @import url("style.css") screen;
//
cssImportRule = function({url, media}) {
  if (Array.isArray(media)) {
    media = media.join(" and ")
  }
  this.buff.push(`@import url(${url}) ${media};`)
},
// The @media CSS at - rule can be used to apply part of a style sheet based on the result of one or more media queries.
// With it, you specify a media query and a block of CSS to apply to the document
// if and only if the media query matches the device on which the content is being used.
//
// /* At the top level of your code */
// @media screen and(min - width: 900px) {
//   article {
//     padding: 1rem 3rem;
//   }
// }
//
// /* Nested within another conditional at-rule */
// @supports(display: flex) {
//   @media screen and(min - width: 900px) {
//     article {
//       display: flex;
//     }
//   }
// }
cssMediaRule = function({media, setup}) {
  if (Array.isArray(media)) {
    media = media.join(" and ")
  }
  this.buff.push(`@media ${media} {`)
  setup({
    style:     cssStyleRule.bind(this),
    import:    cssImportRule.bind(this),
    media:     cssMediaRule.bind(this),
    fontFace:  cssFontFaceRule.bind(this),
    page:      cssPageRule.bind(this),
    namespace: cssNamespaceRule.bind(this),
    keyframes: cssKeyframesRule.bind(this),
    supports:  cssSupportsRule.bind(this),
  })
  this.buff.push("}")
},
// The @font-face CSS at-rule specifies a custom font with which to display text;
// the font can be loaded from either a remote server or a locally-installed font on the user's own computer.
//
// @font-face {
//   font-family: MyHelvetica;
//   src: local("Helvetica Neue Bold"),
//     local("HelveticaNeue-Bold"),
//     url(MgOpenModernaBold.ttf);
//   font-weight: bold;
// }
//
// font-display
// font-family
// font-stretch
// font-style
// font-weight
// font-variant
// font-feature-settings
// font-variation-settings
// src
// unicode-range
cssFontFaceRule = function(setup) {
  this.buff.push("@font-face {")
  setup({
    mixin: cssMixin.bind(this),
    prop:  cssStylePropRule.bind(this),
  })
  this.buff.push("}")
},
// The @page CSS at-rule is used to modify some CSS properties when printing a document.
//
// @page {
//   margin: 1cm;
// }
cssPageRule = function({selector, setup}) {
  this.buff.push(`@page ${selector} {`)
  setup({
    mixin: cssMixin.bind(this),
    prop:  cssStylePropRule.bind(this),
  })
  this.buff.push("}")
},
// @namespace is an at-rule that defines XML namespaces to be used in a CSS style sheet.
//
// @namespace url(http://www.w3.org/1999/xhtml);

cssNamespaceRule = function(name) {
  this.buff.push(`@namespace "${name}";`)
},

// The @keyframes CSS at - rule controls the intermediate steps in a CSS animation sequence by defining styles
// for keyframes(or waypoints) along the animation sequence.This gives more control over the intermediate steps
// of the animation sequence than transitions.
//
// @keyframes slidein {
//   from {
//     transform: translateX(0 %);
//   }
//
//   to {
//     transform: translateX(100 %);
//   }
// }
cssKeyframesRule = function({name, setup}) {
  this.buff.push(`@keyframes ${name} {`)
  setup({
    keyframe: cssKeyframeRule.bind(this),
  })
  this.buff.push("\n}\n")
},

cssKeyframeRule = function ({keyText, setup}) {
  if (Array.isArray(style)) {
    style = style.join("\n\t\t")
  }
  this.buff.push(`\n\t${keyText} {`)
  setup({
    mixin: cssMixin.bind(this),
    prop:  cssStylePropRule.bind(this),
  })
  this.buff.push("\n\t}")
},

// The @supports CSS at-rule lets you specify declarations that depend on a browser's support
// for one or more specific CSS features. This is called a feature query.
// The rule may be placed at the top level of your code or nested inside any other conditional group at-rule.
//
// @supports(display: grid) {
//   body {
//     color: blue;
//   }
// }
cssSupportsRule = function({rules, setup}) {
  if (Array.isArray(rules)) {
    rules = rules.join(" and ")
  }
  this.buff.push(`@supports ${rules} {`)
  setup({
    style:     cssStyleRule.bind(this),
    import:    cssImportRule.bind(this),
    media:     cssMediaRule.bind(this),
    fontFace:  cssFontFaceRule.bind(this),
    page:      cssPageRule.bind(this),
    namespace: cssNamespaceRule.bind(this),
    keyframes: cssKeyframesRule.bind(this),
    supports:  cssSupportsRule.bind(this),
  })
  this.buff.push("}")
},
cssMixin = function(path) {
  const props = this.registry.get(path),
        addProp = cssStylePropRule.bind(this)
        console.log("props", props)
  for (let i = 0, prop = props[i]; i < props.length; prop = props[i++]) {
    addProp(prop)
  }
}
