function GreedyMesh(volume, dims) {
  function f(i,j,k) {
    return volume[i + dims[0] * (j + dims[1] * k)];
  }
  //Sweep over 3-axes
  var quads = [];
  for(var d=0; d<3; ++d) {
    var i, j, k, l, w, h
      , u = (d+1)%3
      , v = (d+2)%3
      , x = [0,0,0]
      , q = [0,0,0]
      , mask = new Int32Array(dims[u] * dims[v]);
    q[d] = 1;
    for(x[d]=-1; x[d]<dims[d]; ) {
      //Compute mask
      var n = 0;
      for(x[v]=0; x[v]<dims[v]; ++x[v])
      for(x[u]=0; x[u]<dims[u]; ++x[u]) {
        var a = (0    <= x[d]      ? !!f(x[0],      x[1],      x[2])      : false),
            b = (x[d] <  dims[d]-1 ? !!f(x[0]+q[0], x[1]+q[1], x[2]+q[2]) : false);
        mask[n++] = ((a !== b) ? 1 : 0) + (b ? 2 : 0);
      }
      //Increment x[d]
      ++x[d];
      //Generate mesh for mask using lexicographic ordering
      n = 0;
      for(j=0; j<dims[v]; ++j)
      for(i=0; i<dims[u]; ) {
        if(mask[n] === 1) {
          //Compute width
          for(w=1; !!mask[n+w] && i+w<dims[u]; ++w) {
          }
          //Compute height (this is slightly awkward
          var done = false;
          for(h=1; j+h<dims[v]; ++h) {
            for(k=0; k<w; ++k) {
              if(!mask[n+k+h*dims[u]]) {
                done = true;
                break;
              }
            }
            if(done) {
              break;
            }
          }
          //Add quad
          x[u] = i;  x[v] = j;
          var du = [0,0,0]; du[u] = w;
          var dv = [0,0,0]; dv[v] = h;
          quads.push([
              [x[0],             x[1],             x[2]            ]
            , [x[0]+du[0],       x[1]+du[1],       x[2]+du[2]      ]
            , [x[0]+du[0]+dv[0], x[1]+du[1]+dv[1], x[2]+du[2]+dv[2]]
            , [x[0]      +dv[0], x[1]      +dv[1], x[2]      +dv[2]]
          ]);
          //Zero-out mask
          for(l=0; l<h; ++l)
          for(k=0; k<w; ++k) {
            mask[n+k+l*dims[u]] = 0;
          }
          //Increment counters and continue
          i += w; n += w;
        } else {
          ++i;    ++n;
        }
      }
    }
  }
  return quads;
}
