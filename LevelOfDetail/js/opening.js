
//Morophological opening filter
function OpeningFilter(volume, dims) {
  "use strict";
  

  //Erode
  var pvolume = new Float32Array(dims[0] * dims[1] * dims[2])
    , n = 0;
  for(var k=0; k<dims[2]; ++k)
  for(var j=0; j<dims[1]; ++j)
  for(var i=0; i<dims[0]; ++i) {
    var s = -1e16;
    for(var dz=-1; dz<=1; ++dz) {
      var iz = k+dz;
      if(iz < 0 || iz >=dims[2]) {
        continue;
      }
      for(var dy=-1; dy<=1; ++dy) {
        var iy = j+dy;
        if(iy < 0 || iy >= dims[1]) {
          continue;
        }
        for(var dx=-1; dx<=1; ++dx) {
          var ix = i+dx;
          if(ix < 0 || ix >= dims[0]) {
            continue;
          }
          s = Math.max(s, volume[ix+dims[0]*(iy+dims[1]*(iz))]);
        }
      }
    }
    pvolume[n++] = s;
  }
  
  //Dilate
  var ndims = new Int32Array(3);
  for(var i=0; i<3; ++i) {
    ndims[i] = Math.ceil(dims[i]/2);
  }
  var nvolume = new Float32Array(ndims[0] * ndims[1] * ndims[2]);
  n = 0;
  for(var k=0; k<ndims[2]; ++k)
  for(var j=0; j<ndims[1]; ++j)
  for(var i=0; i<ndims[0]; ++i) {
    var s = 1e16;
    for(var dz=-1; dz<=1; ++dz) {
      var iz = 2*k+dz;
      if(iz < 0 || iz >=dims[2]) {
        continue;
      }
      for(var dy=-1; dy<=1; ++dy) {
        var iy = 2*j+dy;
        if(iy < 0 || iy >= dims[1]) {
          continue;
        }
        for(var dx=-1; dx<=1; ++dx) {
          var ix = 2*i+dx;
          if(ix < 0 || ix >= dims[0]) {
            continue;
          }
          s = Math.min(s, pvolume[ix+dims[0]*(iy+dims[1]*(iz))]);
        }
      }
    }
    nvolume[n++] = s;
  }
  
  return { volume: nvolume, dims:ndims };
}

