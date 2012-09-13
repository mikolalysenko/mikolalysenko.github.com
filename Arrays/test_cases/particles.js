
function Particle() {
  this.x = 0.0;
  this.y = 0.0;  
  var t = Math.random() * Math.PI * 2.0
    , r = Math.random() * 0.1;
  this.vx = Math.cos(t) * r;
  this.vy = Math.sin(t) * r;
  this.color = Math.random();
}

exports.create_particle_system = function(options) {
  var Seq = options.data_structure
    , particles = Seq.create()
    , accumulator = 0.0;
  
  return {
      particles: particles
    , emitter_rate: options.emitter_rate
    , tick: function() {
      accumulator += Math.random() * this.emitter_rate * 2.0;
      while(accumulator > 1) {
        Seq.append(particles, new Particle());
        accumulator -= 1.0;
      }
      for(var iter = Seq.begin(particles); iter!== Seq.end(particles); iter = Seq.next(particles, iter)) {
        var particle = Seq.read(particles, iter);
        particle.x += particle.vx;
        particle.y += particle.vy;
        if(Math.abs(particle.x) > 10.0 || Math.abs(particle.y) > 10.0) {
          Seq.remove(particles, iter);
        }
      }
    }
  }
}

