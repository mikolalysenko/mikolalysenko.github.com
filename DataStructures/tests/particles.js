exports.create_particle_system = function(options) {
  var particles   = options.data_structure(Float32Array, 5)
    , accumulator = 0.0;
  return {
      emitter_rate: options.emitter_rate
    , tick: function() {
      accumulator += Math.random() * this.emitter_rate * 2.0;
      while(accumulator >= 1.0) {
        var t = Math.random() * Math.PI * 2.0
          , v = Math.random() * 0.1 + 0.01;
        particles.push(new Float32Array([
            0.0, 0.0
          , Math.cos(t) * v, Math.sin(t) * v
          , Math.random()
        ]));
        accumulator -= 1.0;
      }
      
      for(var iter = particles.prev(particles.end());
        particles.valid(iter);
        iter = particles.prev(iter)) {
        var buf = particles.buffer(iter)
          , idx = particles.index(iter);
        buf[idx+0] += buf[idx+2];
        buf[idx+1] += buf[idx+3];
        if(Math.abs(buf[idx]) > 10.0 || Math.abs(buf[idx+1]) > 10.0) {
          particles.remove(iter);
        }
      }
    }
    , foreachParticle: function(visitor) {
      for(var iter = particles.begin(); iter !== particles.end(); iter = particles.next(iter)) {
        var buf = particles.buffer(iter)
          , idx = particles.index(iter);
        visitor(buf[idx+0], buf[idx+1], buf[idx+2], buf[idx+3], buf[idx+4]);
      }
    }
    , count : function() {
      return particles.count();
    }
  }
}

