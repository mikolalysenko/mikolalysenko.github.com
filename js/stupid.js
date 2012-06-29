//The stupidest possible way to generate a Minecraft mesh (I think)
function StupidMesh(volume, dims) {
  var quads = [], x = [0,0,0], n = 0;
  for(x[2]=0; x[2]<dims[2]; ++x[2])
  for(x[1]=0; x[1]<dims[1]; ++x[1])
  for(x[0]=0; x[0]<dims[0]; ++x[0])
  if(volume[n++]) {
    for(var d=0; d<3; ++d) {
      var t = [x[0], x[1], x[2]]
        , u = [0,0,0]
        , v = [0,0,0]; 
      u[(d+1)%3] = 1;
      v[(d+2)%3] = 1;
      for(var s=0; s<2; ++s) {
        t[d] = x[d] + s;
        quads.push([
            [t[0],           t[1],           t[2]          ]
          , [t[0]+u[0],      t[1]+u[1],      t[2]+u[2]     ]
          , [t[0]+u[0]+v[0], t[1]+u[1]+v[1], t[2]+u[2]+v[2]]
          , [t[0]     +v[0], t[1]     +v[1], t[2]     +v[2]]
        ]);
      }
    }
  }
  return quads;
}

