
//Median filter
function MedianFilter(volume, dims) {
  "use strict";
  
  var ndims = new Int32Array(3);
  for(var i=0; i<3; ++i) {
    ndims[i] = Math.ceil(dims[i] / 2) + 2;
  }
  
  var nvolume = new Float32Array(ndims[0] * ndims[1] * ndims[2])
    , n = 0
    , ranks = new Array(8);
  for(var k=0; k<ndims[2]; ++k)
  for(var j=0; j<ndims[1]; ++j)
  for(var i=0; i<ndims[0]; ++i) {
    var idx = 0;
    for(var dz=0; dz<2; ++dz) {
      var iz = 2*(k-1)+dz;
      if(iz < 0 || iz >=dims[2]) {
        continue;
      }
      for(var dy=0; dy<2; ++dy) {
        var iy = 2*(j-1)+dy;
        if(iy < 0 || iy >= dims[1]) {
          continue;
        }
        for(var dx=0; dx<2; ++dx) {
          var ix = 2*(i-1)+dx;
          if(ix < 0 || ix >= dims[0]) {
            continue;
          }
          ranks[idx++] = volume[ix+dims[0]*(iy+dims[1]*(iz))];
        }
      }
    }
    
    nvolume[n++] = ranks.slice(0, idx).sort(function(a,b){return b<=a;})[idx>>1];
  }
  
  return { volume: nvolume, dims:ndims };
}

