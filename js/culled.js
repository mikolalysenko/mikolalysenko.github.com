//Naive meshing (with face culling)
function CulledMesh(volume, dims) {
  //Precalculate direction vectors for convenience
  var dir = new Array(3);
  for(var i=0; i<3; ++i) {
    dir[i] = [[0,0,0], [0,0,0]];
    dir[i][0][(i+1)%3] = 1;
    dir[i][1][(i+2)%3] = 1;
  }
  //March over the volume
  var quads = []
    , x = [0,0,0]
    , B = [[false,true]    //Incrementally update bounds (this is a bit ugly)
          ,[false,true]
          ,[false,true]]
    , n = -dims[0]*dims[1];
  for(           B[2]=[false,true],x[2]=-1; x[2]<dims[2]; B[2]=[true,(++x[2]<dims[2]-1)])
  for(n-=dims[0],B[1]=[false,true],x[1]=-1; x[1]<dims[1]; B[1]=[true,(++x[1]<dims[1]-1)])
  for(n-=1,      B[0]=[false,true],x[0]=-1; x[0]<dims[0]; B[0]=[true,(++x[0]<dims[0]-1)], ++n) {
    //Read current voxel and 3 neighboring voxels using bounds check results
    var p =   (B[0][0] && B[1][0] && B[2][0]) ? volume[n]                 : false
      , b = [ (B[0][1] && B[1][0] && B[2][0]) ? volume[n+1]               : false
            , (B[0][0] && B[1][1] && B[2][0]) ? volume[n+dims[0]]         : false
            , (B[0][0] && B[1][0] && B[2][1]) ? volume[n+dims[0]*dims[1]] : false
          ];
    //Generate faces
    for(var d=0; d<3; ++d)
    if(p != b[d]) {
      var t = [x[0],x[1],x[2]]
        , u = dir[d][0]
        , v = dir[d][1];
      ++t[d];
      quads.push([
          [t[0],           t[1],           t[2]          ]
        , [t[0]+u[0],      t[1]+u[1],      t[2]+u[2]     ]
        , [t[0]+u[0]+v[0], t[1]+u[1]+v[1], t[2]+u[2]+v[2]]
        , [t[0]     +v[0], t[1]     +v[1], t[2]     +v[2]]
      ]);
    }
  }
  return quads;
}

