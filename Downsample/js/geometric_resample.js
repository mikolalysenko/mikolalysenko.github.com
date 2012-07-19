
//Geometric resampling
var GeometricFilter = (function() {
"use strict";
  
return function(volume, dims) {
  
  var ndims = new Int32Array(3);
  for(var i=0; i<3; ++i) {
    ndims[i] = Math.floor(dims[i] / 2) + 1;
  }
  
  var nvolume = new Float32Array(ndims[0] * ndims[1] * ndims[2])
    , n = 0
    , grid = new Float32Array(8)
    , grad = new Float32Array(3);
  for(var i=0; i<8; ++i) {
    grid[i] = 0.0;
  }
  
  
  var points = new Array(ndims[0] * ndims[1] * ndims[2]);
  
  for(var k=0; k<ndims[2]; ++k)
  for(var j=0; j<ndims[1]; ++j)
  for(var i=0; i<ndims[0]; ++i, ++n) {
  
    //Read in grid
    var m = 0;
    for(var dz=0; dz<2; ++dz) {
      var iz = 2*(k)+dz;
      if(iz < 0 || iz >=dims[2]) {
        for(var l=0; l<4; ++l) {
          grid[m++] = 1.0;
        }
        continue;
      }
      for(var dy=0; dy<2; ++dy) {
        var iy = 2*(j)+dy;
        if(iy < 0 || iy >= dims[1]) {
          for(var l=0; l<2; ++l) {
            grid[m++] = 1.0;
          }
          continue;
        }
        for(var dx=0; dx<2; ++dx) {
          var ix = 2*(i)+dx;
          if(ix < 0 || ix >= dims[0]) {
            grid[m++] = 1.0;
            continue;
          }
          grid[m++] = volume[ix+dims[0]*(iy+dims[1]*(iz))];
        }
      }
    }
    
    //Compute mask
    var mask = 0;
    for(var m=0; m<8; ++m) {
      mask |= grid[m] < 0 ? 1<<m : 0;
    }
    
    //Handle all-in/all-out cases
    if(mask === 0) {
      nvolume[n] = 0.8;
      continue;
    } else if(mask === 0xff) {
      nvolume[n] = -0.8;
      continue;
    }
    
    //Compute vertex centroid 
    var weight = 0.0
      , e_count = 0.0;
      
    //Loop over cube edges
    for(var d=0; d<3; ++d) {
      var u = (d+1)%3
        , v = (d+2)%3;
      for(var x=0; x<8; ++x) {
        if(!!(x & (1<<d))) {
          continue;
        } 
        var y = x ^ (1<<d);
        
        //Check for 0 crossing
        if( !!(mask & (1<<x)) === !!(mask & (1<<y)) ) {
          continue;
        }
        
        e_count += 1.0;

        //Find the point of intersection along d-axis
        var g0 = grid[x]                 //Unpack grid values
          , g1 = grid[y]
          , t  = g0 - g1;                 //Compute point of intersection
        if(Math.abs(t) > 1e-6) {
          t = g0 / t;
        } else {
          t = 0.0;
        }
        var ti = 1.0 - t;
        
        //Compute gradient of vector field at point of intersection
        grad[d] = grid[y] - grid[x];
        grad[u] = (grid[x^(1<<u)] - grid[x]) * ti + (grid[y^(1<<u)] - grid[y]) * t;
        grad[v] = (grid[x^(1<<v)] - grid[x]) * ti + (grid[y^(1<<v)] - grid[y]) * t;
        if(!!(x & (1<<u))) {
          grad[u] = -grad[u];
        }
        if(!!(x & (1<<v))) {
          grad[v] = -grad[v];
        }
        
        //Normalize
        var gl = Math.sqrt(grad[0] * grad[0] + grad[1] * grad[1] + grad[2] * grad[2]);
        if(Math.abs(gl) < 1e-6)  {
          gl = 1.0;
        }
        gl = 1.0 / gl;
        
        //Compute weight and add
        //weight += 0.5 * gl * (grad[0] + grad[1] + grad[2]) - t * gl * grad[d];
        weight = Math.min(0.5 * gl * (grad[0] + grad[1] + grad[2]) - t * gl * grad[d]);
      }
    }

    //nvolume[n] = weight / e_count;
    nvolume[n] = weight;
  }
  
  return { volume: nvolume, dims:ndims };
}})();
