
require('nodetime').profile();

var mesher = require(process.argv[2]).mesher
  , res = parseInt(process.argv[3])
  , max_freq = parseInt(process.argv[4])
  , iter_count = parseInt(process.argv[5]);

var nr = 2*res + 1
  , volume = new Float32Array(nr * nr * nr)
  , dims   = new Int32Array([nr, nr, nr]);

function init_volume(freq) {
  var n = 0, s = 0.5 * freq * Math.PI / res;
  for(var z=-res; z<=res; ++z)
  for(var y=-res; y<=res; ++y)
  for(var x=-res; x<=res; ++x, ++n) {
    volume[n] = Math.sin(s * x) + Math.sin(s * y) + Math.sin(s * z);
  }
}

//Warm up run on noisy volume, try to get JIT to compile meser
init_volume(res / 4.0);
for(var i=0; i<iter_count; ++i) {
  mesher(volume, dims);
}

//Do iterations
for(var f = 0; f <= max_freq; ++f) {
  init_volume(f);
  var start = (new Date()).getTime();
  for(var i=0; i<iter_count; ++i) {
    mesher(volume, dims);
  }
  var end = (new Date()).getTime();
  var mesh = mesher(volume, dims);
  console.log(f + ", " + ((end-start) / iter_count) + ", " + mesh.vertices.length + ", " + mesh.faces.length);  
}

