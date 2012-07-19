function createTestData() {
  var result = {};
  
  function triangle_wave(t) {
    var it = Math.floor(t);
    if(!!(it & 1)) {
      return t - it;
    }
    return 1 - (t-it);
  }
  
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
      return {volume: volume, dims:res};
    });
  }
  
  
  result['Thin Plates'] = makeVolume(
    [[1, 63, 1],
     [1, 63, 1],
     [1, 63, 1]],
    function(x,y,z) {
      var t = 7.0 * triangle_wave(x / 7.0) - 0.5;
      if( x < 10 ) {
        t = Math.max(t, 10-x);
      }
      if( y < 10 ) {
        t = Math.max(t, 10-y);
      }
      if( z < 10 )  {
        t = Math.max(t, 10-z);
      }
      if( x > 54 ) {
        t = Math.max(t, x - 54);
      }
      if( y > 54 ) {
        t = Math.max(t, y - 54);
      }
      if( z > 54 ) {
        t = Math.max(t, z - 54);
      }
      return t;
    }
  );
  

  result['Sphere'] = makeVolume(
    [[-1.55, 1.55, 0.05],
     [-1.55, 1.55, 0.05],
     [-1.55, 1.55, 0.05]],
    function(x,y,z) {
      var r = Math.sqrt(x*x + y*y + z*z);
      return r - 0.64;
    }
  )

  result['Torus'] = makeVolume(
    [[-2.2, 2.2, 4.4 / 62.0],
     [-2.2, 2.2, 4.4 / 62.0],
     [-1.4, 1.4, 4.4 / 62.0]],
    function(x,y,z) {
      return Math.pow(1.0 - Math.sqrt(x*x + y*y), 2) + z*z - 0.25;
    }
  );
  
  
  
  result['Hyperelliptic'] = makeVolume(
    [[-2.0, 2.0, 4.0/62.0],
     [-2.0, 2.0, 4.0/62.0],
     [-2.0, 2.0, 4.0/62.0]],
    function(x,y,z) {
      return Math.pow( Math.pow(x, 6) + Math.pow(y, 6) + Math.pow(z, 6), 1.0/6.0 ) - 1.0;
    }  
  );
  
  result["Goursat's Surface"] = makeVolume(
    [[-3.0, 3.0, 6.0/62.0],
     [-3.0, 3.0, 6.0/62.0],
     [-3.0, 3.0, 6.0/62.0]],
    function(x,y,z) {
      return Math.pow(x,4) + Math.pow(y,4) + Math.pow(z,4) - 1.5 * (x*x  + y*y + z*z) + 1;
    }
  );
  
  result["Heart"] = makeVolume(
    [[-2.0, 2.0, 4.0/62.0],
     [-2.0, 2.0, 4.0/62.0],
     [-2.0, 2.0, 4.0/62.0]],
    function(x,y,z) {
      y *= 1.5;
      z *= 1.5;
      return Math.pow(2*x*x+y*y+2*z*z-1, 3) - 0.1 * z*z*y*y*y - y*y*y*x*x;
    }
  );
  
  result['Noise (Slow)'] = makeVolume(
    [[-2.0, 2.0, 4.0/126.0],
     [-2.0, 2.0, 4.0/126.0],
     [-2.0, 2.0, 4.0/126.0]], 
    function(x,y,z) {
      if(x < -1.0 || x > 1.0 ||
         y < -1.0 || y > 1.0 ||
         z < -1.0 || z > 1.0 ) {
        return 0.6;   
      }
      return 0.6 - PerlinNoise.noise(4.0 * x, 4.0 * y, 4.0 * z);
    }
  );
    
  result['Asteroid (Slow)'] = makeVolume(
    [[-1.5, 1.5, 3.0/94.0],
     [-1.5, 1.5, 3.0/94.0],
     [-1.5, 1.5, 3.0/94.0]],
    function(x,y,z) {
      return (x*x + y*y + z*z) - PerlinNoise.noise(x*2,y*2,z*2);
    }
  );
  
  result['Terrain (Slow)'] = makeVolume(
    [[-1, 1, 1.0/62.0],
     [-1, 1, 1.0/62.0],
     [-1, 1, 1.0/62.0]],
    function(x,y,z) {
      return  y + PerlinNoise.noise(x*2+5,y*2+3,z*2+0.6);
    }
  );
  
  
  result['Empty'] = function(){ return { volume: new Float32Array(32*32*32), dims:[32,32,32] } };
  
  return result;
}
