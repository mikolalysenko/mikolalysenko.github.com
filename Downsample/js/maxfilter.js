
//Maximum filter
function MaxFilter(volume, dims) {
  "use strict";
  
  var ndims = new Int32Array(3);
  for(var i=0; i<3; ++i) {
    ndims[i] = Math.ceil(dims[i] / 2);
  }
  
  var nvolume = new Float32Array(ndims[0] * ndims[1] * ndims[2])
    , n = 0;
  for(var k=0; k<ndims[2]; ++k)
  for(var j=0; j<ndims[1]; ++j)
  for(var i=0; i<ndims[0]; ++i) {
    var s = -1e16;
    for(var dz=0; dz<2; ++dz) {
      var iz = 2*(k)+dz;
      if(iz < 0 || iz >=dims[2]) {
        s = Math.max(s, 1.0);
        continue;
      }
      for(var dy=0; dy<2; ++dy) {
        var iy = 2*(j)+dy;
        if(iy < 0 || iy >= dims[1]) {
          s = Math.max(s, 1.0);
          continue;
        }
        for(var dx=0; dx<2; ++dx) {
          var ix = 2*(i)+dx;
          if(ix < 0 || ix >= dims[0]) {
            s = Math.max(s, 1.0);
            continue;
          }
          s = Math.max(s, volume[ix+dims[0]*(iy+dims[1]*(iz))]);
        }
      }
    }
    nvolume[n++] = s;
  }
  
  return { volume: nvolume, dims:ndims };
}

