var Seq = require(process.argv[2]);

//Create initial data structure
for(var i=5; i<23; ++i) {
  var n = (1<<i)
    , d = Seq.create();
  
  console.log("Running test, n=", n);
  
  //Fill in data structure
  var start = (new Date());
  for(var j=0; j<n; ++j) {
    Seq.append(d, Math.random());
  }
  var end = (new Date());
  console.log( "Create time: ", (end - start) / 1000.0 );
  
  //Walk over the array a couple of times
  start = new Date();
  for(var j=0; j<10; ++j) {
    var s = 0;
    for(var iter = Seq.begin(d); iter !== Seq.end(d); iter = Seq.next(d, iter)) {
      s += Seq.read(d, iter);
    }
  }
  end = new Date();
  console.log( "Iter. time: ", (end - start) / 10000.0 );
}

