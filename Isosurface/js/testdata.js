function createTestData() {
  var result = {};
  
  function memoize(f) {
    var cached = null;
    return function() {
      if(cached === null) { 
        cached = f();
      }
      return cached;
    }
  }
  
  function makeVolume(dims, f) {
    return memoize(function() {
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
    });
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
  
  result['Sine Waves'] = makeVolume(
    [[-Math.PI*2, Math.PI*2, Math.PI/8],
     [-Math.PI*2, Math.PI*2, Math.PI/8],
     [-Math.PI*2, Math.PI*2, Math.PI/8]],
    function(x,y,z) {
      return Math.sin(x) + Math.sin(y) + Math.sin(z);
    }
  );
  
  result['Perlin Noise'] = makeVolume(
    [[-5, 5, 0.25],
     [-5, 5, 0.25],
     [-5, 5, 0.25]],
    function(x,y,z) {
      return PerlinNoise.noise(x,y,z) - 0.5;
    }
  );
    
  result['Asteroid'] = makeVolume(
    [[-1, 1, 0.08],
     [-1, 1, 0.08],
     [-1, 1, 0.08]],
    function(x,y,z) {
      return (x*x + y*y + z*z) - PerlinNoise.noise(x*2,y*2,z*2);
    }
  );
  
  
  result['Empty'] = function(){ return { data: new Float32Array(0), dims:[0,0,0] } };
  
  return result;
}
