//Convert .obj file to JSON
var fs = require('fs');
var obj = fs.readFileSync(process.argv[2], 'utf8');

var lines = obj.split('\n');

var positions = [];
var faces = [];

for(var i=0; i<lines.length; ++i) {

  var l = lines[i].split(' ');
  
  if(l[0] === 'v') {
    var p = new Array(3);
    for(var j=0; j<3; ++j) {
      p[j] = parseFloat(l[j+1]);
    }
    positions.push(p);
  } else if (l[0] === 'f') {
    var f = new Array(3);
    for(var j=0; j<3; ++j) {
      f[j] = parseInt(l[j+1].split('/')[0] - 1);
    }
    faces.push(f);
  }
}

console.log(JSON.stringify({
    positions: positions
  , faces: faces
}));

