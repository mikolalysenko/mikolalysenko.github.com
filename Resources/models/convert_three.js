//Converts a three.js triangulated mesh into a polygonal mesh
var fs = require('fs');
var mesh = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));


var positions = [];
var VP = mesh.vertexPositions;
for(var i=0; i<VP.length; i+=3) {
  positions.push([VP[i], VP[i+1], VP[i+2]]);
}

var faces = [];
var FP = mesh.indices;
for(var i=0; i<FP.length; i+=3) {
  faces.push([FP[i], FP[i+1], FP[i+2]]);
}

console.log(JSON.stringify({
    positions: positions
  , faces: faces
}));


