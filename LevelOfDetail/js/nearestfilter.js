
//Naive box filter for downsampling volume
function NearestFilter(volume, dims) {
  "use strict";
  
  var ndims = new Int32Array(3);
  for(var i=0; i<3; ++i) {
    ndims[i] = Math.floor(dims[i]/2);
  }
  
  var nvolume = new Float32Array(ndims[0] * ndims[1] * ndims[2])
    , n = 0;
  for(var k=0; k<ndims[2]; ++k)
  for(var j=0; j<ndims[1]; ++j)
  for(var i=0; i<ndims[0]; ++i) {
    if(2*i < dims[0] && 2*j < dims[1] && 2*k < dims[2]) {
      nvolume[n++] = volume[2*i + dims[0] * (2*j + dims[1] * (2* k))];
    } else {
      nvolume[n++] = 1.0;
    }
  }
  
  return { volume: nvolume, dims:ndims };
}

