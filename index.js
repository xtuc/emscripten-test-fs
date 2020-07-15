// import the emscripten glue code
import emscripten from './build/module.js'

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event))
})

async function handleRequest(event) {
  // this is where the magic happens
  // we send our own instantiateWasm function
  // to the emscripten module
  // so we can initialize the WASM instance ourselves
  // since Workers puts your wasm file in global scope
  // as a binding. In this case, this binding is called
  // `wasm` as that is the name Wrangler uses
  // for any uploaded wasm module
  let emscripten_module = new Promise((resolve, reject) => {
    emscripten({
      instantiateWasm(info, receive) {
        let instance = new WebAssembly.Instance(wasm, info)
        receive(instance)
        return instance.exports
      },
    }).then(module => {
      resolve({
        ls: module.cwrap('ls', 'string', ['string']),
        cat: module.cwrap('cat', 'string', ['string']),
        module,
      })
    })
  })

  try {
    let out = "";
    const print = (t1, t2 = "") => out += t1 + ":\n" + t2 + "\n"
    const {cat, ls, module} = await emscripten_module;

    module.FS.mkdir("/var");
    print("ls /", ls("/"));

    module.FS.writeFile('/var/file.js', 'file.js content');
    print("ls /var", ls("/var"));

    print("cat /var/file.js", cat("/var/file.js"));

    return new Response(out)
  } catch (e) {
    console.error(e);
    return new Response(e.stack, { status: 500 })
  }
}
