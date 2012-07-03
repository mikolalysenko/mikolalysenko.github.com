/**
 * Marching Tetrahedra in Javascript
 *
 * Based on Paul Bourke's implementation
 *  http://local.wasp.uwa.edu.au/~pbourke/geometry/polygonise/
 *
 * (Several bug fixes were made to deal with oriented faces)
 *
 * Javascript port by Mikola Lysenko
 */
var MarchingTetrahedra = (function() {
var cube_vertices = [
        [0,0,0]
      , [1,0,0]
      , [1,1,0]
      , [0,1,0]
      , [0,0,1]
      , [1,0,1]
      , [1,1,1]
      , [0,1,1] ]
  , tetra_list = [
        [0,2,3,7]
      , [0,6,2,7]
      , [0,4,6,7]
      , [0,6,1,2]
      , [0,1,6,4]
      , [5,6,1,4] ];

return function(data, dims) {
   
   var vertices = []
    , faces = []
    , n = 0
    , grid = new Float32Array(8)
    , edges = new Int32Array(12)
    , x = [0,0,0];
    
  function interp(i0, i1) {
    var g0 = grid[i0]
      , g1 = grid[i1]
      , p0 = cube_vertices[i0]
      , p1 = cube_vertices[i1]
      , v  = [x[0], x[1], x[2]]
      , t = g0 - g1;
    if(Math.abs(t) > 1e-6) {
      t = g0 / t;
    }
    for(var i=0; i<3; ++i) {
      v[i] += p0[i] + t * (p1[i] - p0[i]);
    }
    vertices.push(v);
    return vertices.length - 1;
  }
  
  //March over the volume
  for(x[2]=0; x[2]<dims[2]-1; ++x[2], n+=dims[0])
  for(x[1]=0; x[1]<dims[1]-1; ++x[1], ++n)
  for(x[0]=0; x[0]<dims[0]-1; ++x[0], ++n) {
    //Read in cube  
    for(var i=0; i<8; ++i) {
      grid[i] = data[n + cube_vertices[i][0] + dims[0] * (cube_vertices[i][1] + dims[1] * cube_vertices[i][2])];
    }
    for(var i=0; i<tetra_list.length; ++i) {
      var T = tetra_list[i]
        , triindex = 0;
      if (grid[T[0]] < 0) triindex |= 1;
      if (grid[T[1]] < 0) triindex |= 2;
      if (grid[T[2]] < 0) triindex |= 4;
      if (grid[T[3]] < 0) triindex |= 8;
      
      //Handle each case
      switch (triindex) {
        case 0x00:
        case 0x0F:
        break;
        case 0x0E:
          faces.push([ 
              interp(T[0], T[1])
            , interp(T[0], T[3]) 
            , interp(T[0], T[2]) ]);
        break;
        case 0x01:
          faces.push([ 
              interp(T[0], T[1])
            , interp(T[0], T[2])
            , interp(T[0], T[3])  ]);
        break;
        case 0x0D:
          faces.push([ 
              interp(T[1], T[0])
            , interp(T[1], T[2]) 
            , interp(T[1], T[3]) ]);
        break;
        case 0x02:
          faces.push([ 
              interp(T[1], T[0])
            , interp(T[1], T[3])
            , interp(T[1], T[2]) ]);
        break;
        case 0x0C:
          faces.push([ 
                interp(T[1], T[2])
              , interp(T[1], T[3])
              , interp(T[0], T[3])
              , interp(T[0], T[2]) ]);
        break;
        case 0x03:
          faces.push([ 
                interp(T[1], T[2])
              , interp(T[0], T[2])
              , interp(T[0], T[3])
              , interp(T[1], T[3]) ]);
        break;
        case 0x04:
          faces.push([ 
                interp(T[2], T[0])
              , interp(T[2], T[1])
              , interp(T[2], T[3]) ]);
        break;
        case 0x0B:
          faces.push([ 
                interp(T[2], T[0])
              , interp(T[2], T[3]) 
              , interp(T[2], T[1]) ]);
        break;
        case 0x05:
          faces.push([ 
                interp(T[0], T[1])
              , interp(T[1], T[2])
              , interp(T[2], T[3])
              , interp(T[0], T[3]) ]);
        break;
        case 0x0A:
          faces.push([ 
                interp(T[0], T[1])
              , interp(T[0], T[3])
              , interp(T[2], T[3])
              , interp(T[1], T[2]) ]);
        break;
        case 0x06:
          faces.push([ 
                interp(T[2], T[3])
              , interp(T[0], T[2])
              , interp(T[0], T[1])
              , interp(T[1], T[3]) ]);
        break;
        case 0x09:
          faces.push([ 
                interp(T[2], T[3])
              , interp(T[1], T[3])
              , interp(T[0], T[1])
              , interp(T[0], T[2]) ]);
        break;
        case 0x07:
          faces.push([ 
                interp(T[3], T[0])
              , interp(T[3], T[1])
              , interp(T[3], T[2]) ]);
        break;
        case 0x08:
          faces.push([ 
                interp(T[3], T[0])
              , interp(T[3], T[2])
              , interp(T[3], T[1]) ]);
        break;
      }
    }
  }
  
  return { vertices: vertices, faces: faces };
}
})();


if(exports) {
  exports.mesher = MarchingTetrahedra;
}
