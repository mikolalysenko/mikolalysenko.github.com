
//Naive box filter for downsampling volume
function BoxFilter(volume, dims) {
  "use strict";
  
  var ndims = new Int32Array(3);
  for(var i=0; i<3; ++i) {
    ndims[i] = Math.floor(dims[i] / 2);
  }
  
  var nvolume = new Float32Array(ndims[0] * ndims[1] * ndims[2])
    , n = 0;
  for(var k=0; k<ndims[2]; ++k)
  for(var j=0; j<ndims[1]; ++j)
  for(var i=0; i<ndims[0]; ++i) {
  
    var s = 0.0;
    for(var dz=-1; dz<2; ++dz) {
      var iz = 2*(k)+dz;
      if(iz < 0) {
        iz = -iz;
      }
      if(iz >= dims[2]) {
        iz = 2*dims[2]-2-iz;
      }
      
      for(var dy=-1; dy<2; ++dy) {
        var iy = 2*(j)+dy;
        if(iy < 0) {
          iy = -iy;
        }
        if(iy >= dims[1]) {
          iy = 2*dims[1]-2-iy;
        }
        
        for(var dx=-1; dx<2; ++dx) {
          var ix = 2*(i)+dx;
          if(ix < 0) {
            ix = -ix;
          }
          if(ix >= dims[0]) {
            ix = 2*dims[0]-2-ix;
          }
          s += volume[ix+dims[0]*(iy+dims[1]*(iz))];
        }
      }
    }
    nvolume[n++] = s / 27.0;
  }
  
  return { volume: nvolume, dims:ndims };
}

