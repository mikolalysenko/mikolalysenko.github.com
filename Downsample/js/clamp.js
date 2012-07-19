function Clamp(data) {
  "use strict";
  var dims = data.dims
    , volume = new Float32Array(dims[0] * dims[1] * dims[2]); 
  for(var i=0; i<volume.length; ++i) {
    volume[i] = Math.max(-1.0, Math.min(1.0, data.volume[i]));
  }
  return {volume:volume, dims:dims};
}
