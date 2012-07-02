function createTestData() {
  var result = {};
  
  function makeVolume(dims, f) {
    var res = new Array(3);
    for(var i=0; i<3; ++i) {
      res[i] = 2 + Math.ceil((dims[i][1] - dims[i][0]) / dims[i][2]);
    }
    var volume = new Float32Array(res[0] * res[1] * res[2])
      , n = 0;
    for(var k=0, z=dims[2][0]-dims[2][2]; k<res[2]; ++k, z+=dims[2][2])
    for(var j=0, y=dims[1][0]-dims[1][2]; j<res[1]; ++j, y+=dims[1][2])
    for(var i=0, x=dims[0][0]-dims[0][2]; i<res[0]; ++i, x+=dims[0][2], ++n) {
      volume[n] = f(x,y,z);
    }
    return {data: volume, dims:res};
  }

  result['Sphere'] = makeVolume(
    [[-1.0, 1.0, 0.25],
     [-1.0, 1.0, 0.25],
     [-1.0, 1.0, 0.25]],
    function(x,y,z) {
      return x*x + y*y + z*z - 1.0;
    }
  );
  
  result['BigSphere'] = makeVolume(
    [[-1.0, 1.0, 0.05],
     [-1.0, 1.0, 0.05],
     [-1.0, 1.0, 0.05]],
    function(x,y,z) {
      return x*x + y*y + z*z - 1.0;
    }
  );
  
  result['Torus'] = makeVolume(
    [[-2.0, 2.0, 0.2],
     [-2.0, 2.0, 0.2],
     [-1.0, 1.0, 0.2]],
    function(x,y,z) {
      return Math.pow(1.0 - Math.sqrt(x*x + y*y), 2) + z*z - 0.25;
    }
  );
  
  result['Empty'] = { data: new Float32Array(0), dims:[0,0,0] };
  
  return result;
}
