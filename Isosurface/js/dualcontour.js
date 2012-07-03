"use strict";
var DualContouring = (function() {

var cube_vertices = [
      [0,0,0]
    , [1,0,0]
    , [0,1,0]
    , [1,1,0]
    , [0,0,1]
    , [1,0,1]
    , [0,1,1]
    , [1,1,1] ]
 , cube_edges = new Int32Array([
      0, 1
    , 0, 2
    , 0, 4
    , 1, 3
    , 1, 5
    , 2, 3
    , 2, 6
    , 3, 7
    , 4, 5
    , 4, 6
    , 5, 7
    , 6, 7 ]);

//Internal buffer
var buffer = new Int32Array(4096);

return function(data, dims) {

  var vertices = []
    , faces = []
    , n = 0
    , x = new Int32Array(3)
    , d = new Int32Array(3)
    , R = new Int32Array([1, (dims[0]+1), (dims[0]+1)*(dims[0]+1)])
    , grid = new Float32Array(8)
    , buf_no = 1;
   
  //Resize buffer if necessary 
  if(R[2] * 2 > buffer.length) {
    buffer = new Int32Array(R[2] * 2);
  }
  
  //March over the voxel grid
  for(x[2]=0; x[2]<dims[2]-1; ++x[2], n+=dims[0], buf_no ^= 1, R[2]=-R[2]) {
    var m = 1 + (dims[0]+1) * (1 + buf_no * (dims[1]+1));
    for(x[1]=0; x[1]<dims[1]-1; ++x[1], ++n, m+=2)
    for(x[0]=0; x[0]<dims[0]-1; ++x[0], ++n, ++m) {
    
      //Read in field values
      var mask = 0, g = 0, idx = n;
      for(var k=0; k<2; ++k, idx += dims[0]*(dims[1]-2))
      for(var j=0; j<2; ++j, idx += dims[0]-2)      
      for(var i=0; i<2; ++i, ++g, ++idx) {
        var p = data[idx];
        mask |= (p < 0) ? (1 << g) : 0;
        grid[g] = p;
      }
      
      //If cell is not on boundary, skip it
      if((mask === 0) || (mask === 0xff)) {
        continue;
      }
      buffer[m] = vertices.length;

      //Compute vertex and face
      var v = [0,0,0], e_count = 0;
      for(var i=0; i<24; i+=2) {
        var e0 = cube_edges[i]
          , e1 = cube_edges[i+1]
          , s0 = !!(mask & (1 << e0))
          , s1 = !!(mask & (1 << e1));
        //Check for 0-crossing
        if( s0 === s1 ) {
          continue; 
        }
        //Add face
        var iu = ((i>>1)+1)%3
          , iv = ((i>>1)+2)%3;
        if(i < 6 && x[iu] > 0 && x[iv] > 0) {
          var du = R[iu]
            , dv = R[iv];
          if(mask & 1) {
            faces.push([buffer[m], buffer[m-du], buffer[m-du-dv], buffer[m-dv]]);
          } else {
            faces.push([buffer[m], buffer[m-dv], buffer[m-du-dv], buffer[m-du]]);
          }
        }
        //Find edge intersections
        ++e_count;
        var p0 = cube_vertices[e0]
          , p1 = cube_vertices[e1]
          , g0 = grid[e0]
          , g1 = grid[e1]
          , t  = g0 - g1;
        if(Math.abs(t) > 1e-6) {
          t = g0 / t;
        } else {
          t = 0.0;
        }
        for(var j=0; j<3; ++j) {
          v[j] = (v[j] + p0[j]) + t * (p1[j] - p0[j]);
        }
      }
      //Add vertex to list
      var s = 1.0 / e_count;
      for(var i=0; i<3; ++i) {
        v[i] = x[i] + s * v[i];
      }
      vertices.push(v);
    }
  }
  
  return { vertices: vertices, faces: faces };
};
})();


if(exports) {
  exports.mesher = DualContouring;
}


