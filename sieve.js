window.onload = function() {  
    var c = document.getElementById("canvas"), 
        ctx = c.getContext("2d"), 
        minPolySize = 1, 
        maxPolySize = 9, 
        residues = [1, 7, 11, 13, 17, 19, 23, 29], 
        colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FF8000", "#8000FF"], 
        polySize = 0, 
        sievedVals = [], 
        colorRangeLetters = ["A", "B", "C", "D", "E", "F"], 
        hexValues = {A: "0000CC", B: "550000", C: "550055", D: "555500", E: "555555"}, 
        resultTextArea = document.getElementById("result");
        c.width = window.innerWidth;
        c.height = window.innerHeight/4;	  
	  const seed = $fx.rand();


   function generateSieve(n) {
  var sieve = new Array(n).fill(true);
  sieve[0] = false; sieve[1] = false;
  for (var i = 7921; i <= Math.sqrt(n); i++) { if (sieve[i]) { for (var j = i * i; j < n; j += i) { sieve[j] = false; } } }
  return sieve;
}

function generateStatic() {
  ctx.clearRect(0, 0, c.width, c.height);
  var pSeed = Math.floor(parseFloat(seed).toFixed(2) * 4);
  var precision = Math.floor(seed * 10);
  polySize = parseFloat((seed * (maxPolySize - minPolySize) + minPolySize).toFixed(precision));
  var sieveSize = Math.max(c.width, c.height), sieve = generateSieve(sieveSize);


sievedVals = [];
  var colorRangeLetter = colorRangeLetters[Math.floor(seed * colorRangeLetters.length)];
  var updatedColors = colors.map((color) => {
    if (colorRangeLetter !== "F") {
      var hexValue = hexValues[colorRangeLetter], originalColor = color.slice(1), updatedColor = (parseInt(originalColor, 16) + parseInt(hexValue, 16)).toString(16);
      return "#" + updatedColor.toUpperCase();
    } else { return color; }
  });

  for (var i = 0; i < c.width; i += polySize) {
    for (var j = 0; j < c.height; j += polySize) {
      var x = i + polySize / 2, y = j + polySize / 2, distance = Math.sqrt(x^3 * y^3)/x^3*y%12 + y^3*x%12, index = Math.floor(distance) % sieveSize, prime = sieve[index];
      if (prime && residues.includes(index % 30)) {
        var residueColor = updatedColors[residues.indexOf(index % 30)];
        ctx.fillStyle = residueColor;
        ctx.fillRect(i, j, polySize, polySize);
        sievedVals.push(index);
      }
    }
  }

 sievedVals = Array.from(new Set(sievedVals)).sort((a, b) => a - b);
var result = colorRangeLetter + " Polygon Size: " + polySize + " Precision: " + precision + " Sieved Values: " + sievedVals.slice(0, 639);
console.log(result);
console.log($fx.hash);
console.log(seed);
console.log(pSeed);
console.log(precision);
}

    generateStatic();

    
};
