//Sinc filtering
function SincFilter(volume, dims) {
  "use strict";
  
  var ndims = new Int32Array(3);
  for(var i=0; i<3; ++i) {
    ndims[i] = Math.ceil(dims[i] / 2);
  }

  //Copy field
  var tvolume = new Float32Array(dims[0] * dims[1] * dims[2]);
  for(var i=0; i<tvolume.length; ++i) {
    tvolume[i] = volume[i];
  }
  
  //Kernel is separable, so perform over each axis independendly
  for(var d=0; d<3; ++d) {
    var u = (d+1)%3
      , v = (d+2)%3
      , uh = (u < d ? ndims[u] : dims[u])
      , vh = (v < d ? ndims[v] : dims[v])
      , x = [0,0,0];
      
    var fft = new FFT(dims[d], 1)
      , ifft = new FFT(ndims[d], 1)
      , buffer = new Float32Array(dims[d]);
      
    for(x[u]=0; x[u]<uh; ++x[u])
    for(x[v]=0; x[v]<vh; ++x[v]) {

      //Unpack buffer
      for(x[d]=0; x[d]<dims[d]; ++x[d]) {
        buffer[x[d]] = tvolume[x[0] + dims[0] * (x[1] + dims[1] * x[2])];
      }
      
      //Apply sinc filter
      fft.forward(buffer);
      var result = ifft.inverse(fft.real, fft.imag);
      
      //Write back into volume
      for(x[d]=0; x[d]<ndims[d]; ++x[d]) {
        tvolume[x[0] + dims[0] * (x[1] + dims[1] * x[2])] = result[x[d]];
      }
    }
  }
  
  //Slice out sub volume
  var nvolume = new Float32Array(ndims[0] * ndims[1] * ndims[2])
    , n = 0;
  for(x[2]=0; x[2]<ndims[2]; ++x[2])
  for(x[1]=0; x[1]<ndims[1]; ++x[1])
  for(x[0]=0; x[0]<ndims[0]; ++x[0], ++n) {
    nvolume[n] = tvolume[x[0] + dims[0] * (x[1] + dims[1] * x[2])];
  }
  
  return { volume: nvolume, dims:ndims };
}

