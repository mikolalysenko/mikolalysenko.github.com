function Sigmoid(data) {
  "use strict";
  var dims = data.dims
    , volume = new Float32Array(dims[0] * dims[1] * dims[2]); 
  for(var i=0; i<volume.length; ++i) {
    volume[i] = 2.0 / (1.0 + Math.exp(-volume[i])) - 1.0;
  }
  return volume;
}
