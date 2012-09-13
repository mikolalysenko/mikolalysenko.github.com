var particles = require('./particles.js').create_particle_system({
    data_structure: require(process.argv[2]).create
  , emitter_rate:   2.0
}); 


//Warm up
console.log("Warming up...");
for(var i=0; i<10000; ++i) {
  particles.tick();
}
console.log("Running benchmark");

//Do simulation
var NUM_ITERS = 1000000;
var start = new Date();
for(var i=0; i<NUM_ITERS; ++i) {
  particles.tick();
}
var end = new Date();
console.log("Average time per tick = ", (end-start) / (NUM_ITERS * 1000.0), "s");

