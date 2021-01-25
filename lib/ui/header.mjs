export class AppHeader extends HTMLElement {
  constructor() {
    super()
    console.log("shadowRoot1", this.shadowRoot)
    this.attachShadow({mode: "open"})
    const container = document.createElement("header"),
          style = document.createElement("style"),
          helpWgt = document.createElement("slot"),
          accountWgt = document.createElement("slot")
    container.setAttribute("id", "screen-header")
    container.appendChild(style)
    helpWgt.setAttribute("name", "help-btn")
    accountWgt.setAttribute("name", "account-btn")
    container.appendChild(helpWgt)
    container.appendChild(accountWgt)
    this.shadowRoot.appendChild(container)
    console.log("shadowRoot2", this.shadowRoot)
  }
  static get observedAttributes() { return [] }
  connectedCallback() {

  }
  disconnectedCallback() {

  }
  adoptedCallback() {

  }
  attributeChangedCallback() {

  }
}
