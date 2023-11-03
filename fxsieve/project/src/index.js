// console.log(fxhash);
// console.log(fxrand());

const sp = new URLSearchParams(window.location.search)
//  console.log(sp);

// this is how to define parameters
$fx.params([
  {
    id: "color_id",
    name: "A color",
    type: "color",
    update: "sync",
    //default: "ff5500",
  },
])

function main() {
    document.body.innerHTML = `<style> 
    body {  background-color: #050505; 
    }</style>
    <div class="container">
    <canvas id="canvas"></canvas>
    <div id="draw-area"></div>
    <div id="p5canvas"></div>
    <div class="content">
    
    </div>
  </div>
  `
}

main()

$fx.on(
  "params:update",
  (newRawValues) => {
    if (newRawValues.number_id === 5) return true
    return false
  },
  () => main()
)
