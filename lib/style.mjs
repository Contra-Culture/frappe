import {
  Registry,
  noisyNotFoundHandler,
  noisyAlreadyDefinedHandler,
  noisyNotValidHandler,
} from "./util/registry.mjs"

export {
  stylesRegistry,
  prop,
  stylesheet,
 }

const prop = function(prop, ...values) {
  if (Array.isArray) {
    values = values.join(", ")
  }
  return {prop, values}
}

const propsListValidator = function(value) {
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
}

const stylesRegistry = function() {
  return new Registry({
    validator: propsListValidator,
    notFoundHandler: noisyNotFoundHandler,
    alreadyDefinedHandler: noisyAlreadyDefinedHandler,
    notValidHandler: noisyNotValidHandler,
  })
}
// usage:
//
// import { stylesheet } from "./style.mjs"
//
// const css = stylesheet({
//   title: "my-stylesheet",
//   registry: stylesReg,
//   setup: (css) => {
//     css.namespace("Some.xml")
//     css.import({ url: "some-path.url", media: "screen" })
//     css.page({
//       selector: ":first", setup: (css) => {
//         css.prop({ prop: "color", values: "#ff0000" })
//       }
//     })
//     css.style({
//       selector: "body, html", setup: (css) => {
//         css.mixin("custom/buttons/plain".split("/"))
//         css.prop({ prop: "color", values: "#444444" })
//       }
//     })
//     css.media({
//       media: ["screen", "(min-width: 900px)"], setup: (css) => {
//         css.style({
//           selector: "h1", setup: (css) => {
//             css.prop({ prop: "color", values: "#f40569" })
//           }
//         })
//       }
//     })
//   },
// })
// console.log(CSSOMRoot)
const stylesheet = ({registry, setup}) => {
  const stylesheet = {
    registry,
    buff: [],
    indent: "",
  }
  setup({
    style: cssStyleRule.bind(stylesheet),
    import: cssImportRule.bind(stylesheet),
    media: cssMediaRule.bind(stylesheet),
    fontFace: cssFontFaceRule.bind(stylesheet),
    page: cssPageRule.bind(stylesheet),
    namespace: cssNamespaceRule.bind(stylesheet),
    keyframes: cssKeyframesRule.bind(stylesheet),
    supports: cssSupportsRule.bind(stylesheet),
  })
  return stylesheet.buff.join("\n")
}

const cssStylePropRule = function ({prop, values}) {
  if (Array.isArray(values)) {
    values = values.join(", ")
  }
  this.buff.push(`${prop}: ${values};`)
}

// h1 {           // selectror
//   color: pink; // styleProps[0]
// }
const cssStyleRule = function({selector, setup}) {
  this.buff.push(`${selector} {`)
  setup({
    mixin: cssMixin.bind(this),
    prop: cssStylePropRule.bind(this),
  })
  this.buff.push("}")
}

// The @import CSS at-rule is used to import style rules from other style sheets.
//
// @import url;
// @import url list-of-media-queries;
// @import url supports(supports-query);
// @import url supports(supports-query) list-of-media-queries;
//
// @import url("style.css") screen;
//
const cssImportRule = function({url, media}) {
  if (Array.isArray(media)) {
    media = media.join(" and ")
  }
  this.buff.push(`@import url("${url}") ${media};`)
}

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
const cssMediaRule = function({media, setup}) {
  if (Array.isArray(media)) {
    media = media.join(" and ")
  }
  this.buff.push(`@media ${media} {`)
  setup({
    style: cssStyleRule.bind(this),
    import: cssImportRule.bind(this),
    media: cssMediaRule.bind(this),
    fontFace: cssFontFaceRule.bind(this),
    page: cssPageRule.bind(this),
    namespace: cssNamespaceRule.bind(this),
    keyframes: cssKeyframesRule.bind(this),
    supports: cssSupportsRule.bind(this),
  })
  this.buff.push("}")
}

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
const cssFontFaceRule = function(setup) {
  this.buff.push("@font-face {")
  setup({
    mixin: cssMixin.bind(this),
    prop:  cssStylePropRule.bind(this),
  })
  this.buff.push("}")
}

// The @page CSS at-rule is used to modify some CSS properties when printing a document.
//
// @page {
//   margin: 1cm;
// }
const cssPageRule = function({selector, setup}) {
  this.buff.push(`@page ${selector} {`)
  setup({
    mixin: cssMixin.bind(this),
    prop: cssStylePropRule.bind(this),
  })
  this.buff.push("}")
}

// @namespace is an at-rule that defines XML namespaces to be used in a CSS style sheet.
//
// @namespace url(http://www.w3.org/1999/xhtml);
const cssNamespaceRule = function(name) {
  this.buff.push(`@namespace "${name}";`)
}

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
const cssKeyframesRule = function({name, setup}) {
  this.buff.push(`@keyframes ${name} {`)
  setup({
    keyframe: cssKeyframeRule.bind(this),
  })
  this.buff.push("\n}\n")
}

const cssKeyframeRule = function ({keyText, setup}) {
  if (Array.isArray(style)) {
    style = style.join("\n\t\t")
  }
  this.buff.push(`\n\t${keyText} {`)
  setup({
    mixin: cssMixin.bind(this),
    prop:  cssStylePropRule.bind(this),
  })
  this.buff.push("\n\t}")
}

// The @supports CSS at-rule lets you specify declarations that depend on a browser's support
// for one or more specific CSS features. This is called a feature query.
// The rule may be placed at the top level of your code or nested inside any other conditional group at-rule.
//
// @supports(display: grid) {
//   body {
//     color: blue;
//   }
// }
const cssSupportsRule = function({rules, setup}) {
  if (Array.isArray(rules)) {
    rules = rules.join(" and ")
  }
  this.buff.push(`@supports ${rules} {`)
  setup({
    style: cssStyleRule.bind(this),
    import: cssImportRule.bind(this),
    media: cssMediaRule.bind(this),
    fontFace: cssFontFaceRule.bind(this),
    page: cssPageRule.bind(this),
    namespace: cssNamespaceRule.bind(this),
    keyframes: cssKeyframesRule.bind(this),
    supports: cssSupportsRule.bind(this),
  })
  this.buff.push("}")
}

const cssMixin = function(path) {
  const props = this.registry.getValue(path)
  const addProp = cssStylePropRule.bind(this)
  console.log("props", props)
  for (let i = 0, prop = props[i]; i < props.length; prop = props[i++]) {
    addProp(prop)
  }
}
