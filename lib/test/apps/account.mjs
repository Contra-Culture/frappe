export {
  App,
}

((window) => {
  const name = "account"
  const app = new App(name, ()=>{})
  window.frappeUniv.registerApp(name, app)
})(window)
