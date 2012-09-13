var particles = require('./particles.js').create_particle_system({
    data_structure: require(process.argv[2]).create
  , emitter_rate:   200.0
}); 

//Warm up
console.log("Warming up...");
for(var i=0; i<2000; ++i) {
  particles.tick();
}
console.log("Initial population:", particles.count());

//Do simulation
console.log("Running benchmark");
var NUM_ITERS = 10000;
var start = new Date();
for(var i=0; i<NUM_ITERS; ++i) {
  particles.tick();
}
var end = new Date();
console.log("Final population:", particles.count());
console.log("Score = ", (end-start) / (NUM_ITERS * 1000.0), "s / tick");

