/**
 * Geometric Surface Resampling
 */
var GeometricFilter = (function() {
"use strict";

//Precompute edge table, like Paul Bourke does.
// This saves a bit of time when computing the centroid of each boundary cell
var cube_edges = new Int32Array(24)
  , edge_table = new Int32Array(256);
(function() {

  //Initialize the cube_edges table
  // This is just the vertex number of each cube
  var k = 0;
  for(var i=0; i<8; ++i) {
    for(var j=1; j<=4; j<<=1) {
      var p = i^j;
      if(i <= p) {
        cube_edges[k++] = i;
        cube_edges[k++] = p;
      }
    }
  }

  //Initialize the intersection table.
  //  This is a 2^(cube configuration) ->  2^(edge configuration) map
  //  There is one entry for each possible cube configuration, and the output is a 12-bit vector enumerating all edges crossing the 0-level.
  for(var i=0; i<256; ++i) {
    var em = 0;
    for(var j=0; j<24; j+=2) {
      var a = !!(i & (1<<cube_edges[j]))
        , b = !!(i & (1<<cube_edges[j+1]));
      em |= a !== b ? (1 << (j >> 1)) : 0;
    }
    edge_table[i] = em;
  }
})();

return function(data, dims) {
  "use strict";
  
  //Generate vertices
  var x = new Int32Array(3)
    , grid = new Float32Array(8)
    , vertices = []
    , n = 0;
  for(x[2]=0; x[2]<dims[2]-1; ++x[2], n+=dims[0])
  for(x[1]=0; x[1]<dims[1]-1; ++x[1], ++n)
  for(x[0]=0; x[0]<dims[0]-1; ++x[0], ++n) {
    //Read in 8 field values around this vertex and store them in an array
    //Also calculate 8-bit mask, like in marching cubes, so we can speed up sign checks later
    var mask = 0, g = 0, idx = n;
    for(var k=0; k<2; ++k, idx += dims[0]*(dims[1]-2))
    for(var j=0; j<2; ++j, idx += dims[0]-2)      
    for(var i=0; i<2; ++i, ++g, ++idx) {
      var p = data[idx];
      grid[g] = p;
      mask |= (p < 0) ? (1<<g) : 0;
    }
    
    //Check for early termination if cell does not intersect boundary
    if(mask === 0 || mask === 0xff) {
      //Add empty vertex
      vertices.push([]);
      continue;
    }
    
    //Sum up edge intersections
    var edge_mask = edge_table[mask]
      , v = [0.0,0.0,0.0]
      , e_count = 0;
      
    //For every edge of the cube...
    for(var i=0; i<12; ++i) {
    
      //Use edge mask to check if it is crossed
      if(!(edge_mask & (1<<i))) {
        continue;
      }
      
      //If it did, increment number of edge crossings
      ++e_count;
      
      //Now find the point of intersection
      var e0 = cube_edges[ i<<1 ]       //Unpack vertices
        , e1 = cube_edges[(i<<1)+1]
        , g0 = grid[e0]                 //Unpack grid values
        , g1 = grid[e1]
        , t  = g0 - g1;                 //Compute point of intersection
      if(Math.abs(t) > 1e-6) {
        t = g0 / t;
      } else {
        continue;
      }
      
      //Interpolate vertices and add up intersections (this can be done without multiplying)
      for(var j=0, k=1; j<3; ++j, k<<=1) {
        var a = e0 & k
          , b = e1 & k;
        if(a !== b) {
          v[j] += a ? 1.0 - t : t;
        } else {
          v[j] += a ? 1.0 : 0;
        }
      }
    }
    
    //Now we just average the edge intersections and add them to coordinate
    var s = 1.0 / e_count;
    for(var i=0; i<3; ++i) {
      v[i] = x[i] + s * v[i];
    }
    vertices.push(v);
  }
  
  
  //Now resample using vertex coordinates
  var ndims = [0,0,0];
  for(var i=0; i<3; ++i) {
    ndims[i] = (dims[i] >> 1) + 1;
  }
  
  var nvolume = new Float32Array(ndims[0] * ndims[1] * ndims[2])
    , n = 0;
  for(var k=0; k<ndims[2]; ++k)
  for(var j=0; j<ndims[1]; ++j)  
  for(var i=0; i<ndims[0]; ++i, ++n) {

    var p = [2*i+1, 2*j+1, 2*k+1]
      , closest_dist = Math.sqrt(3.0)
      , closest_vec = [0,0,0];
      
    for(var dz=0; dz<=1; ++dz)
    for(var dy=0; dy<=1; ++dy)
    for(var dx=0; dx<=1; ++dx) {
    
      var nidx = [2*i+dx, 2*j+dy, 2*k+dz]
        , in_bounds = true;
      for(var l=0; l<3; ++l) {
        if(nidx[l] < 0 || nidx[l] >= dims[l]-1) {
          in_bounds = false;
          break;
        }
      }
      if(!in_bounds) {
        continue;
      }
    
      var pt = vertices[nidx[0] + (dims[0]-1)*(nidx[1] + (dims[1]-1)*nidx[2])];
      if(pt.length === 0) {
        continue;
      }
    
      var delta = [0.0, 0.0, 0.0];
      for(var l=0; l<3; ++l) {
        delta[l] = pt[l] - p[l];
      }
      var dist = Math.sqrt(delta[0]*delta[0] + delta[1]*delta[1] + delta[2]*delta[2]);
      
      if(dist < closest_dist) {
        closest_dist = dist;
        closest_vec = delta;
      }
    }
    
    //Compute sign
    var offset = [2*i+1,2*j+1,2*k+1];
    /*
    for(var l=0; l<3; ++l) {
      offset[l] += closest_vec[i] <= 0 ? 1 : 0;
     if(offset[l] >= dims[l]) {
      offset[l] = dims[l]-1;
     }       
    }
    */
    var sign = data[offset[0] + dims[0]*(offset[1] + dims[1]*offset[2]) ];
    
    //Update volume
    nvolume[n] = sign <= 0 ? -closest_dist : closest_dist;
  }
  
  
  //All done!  Return the result
  return { volume:nvolume, dims:ndims };
};
})();
