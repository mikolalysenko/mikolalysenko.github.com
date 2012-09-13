//Packed memory array
//
// Supports fast iteration like vector, but O(log^2(n)) insert/delete like linked list
//
exports.makePMA = function(ArrayType, item_size) {

  var levels      = 1
    , chunk_size  = levels * item_size
    , buffer      = new ArrayType( chunk_size << (levels+1) )
    , occupancy   = new UInt8Array( 1<<(levels+1) )
    , item_count  = 0; 
    
  //Reallocate the data structure
  function set_levels(nlevels) {
  
    var nchunk_size = nlevels * item_size
      , nbuffer     = new ArrayType(chunk_size << (nlevels+1))
      , noccupancy  = new UInt8Array(1<<(nlevels+1));
    
    //Rebalance array into new buffer, swap pointers
    
  
  }
    
  //Rebalance all the elements in range
  function rebalance(lo, hi) {
  
  }
  
  return {
    //Basic iterator stuff
      begin: function() {
    }
    , end: function() {
    }
    , value: function(iter) {
    }
    , next: function(iter) {
    }
    , prev: function(iter) {
    }
    , valid: function(iter) {
    }

    //Iterator modification stuff
    , insert: function(iter, value) {
    }
    , remove: function(iter) {
    }

    //Updates
    , push: function(value) {
    }
    , pop: function() {
    }
    , unshift: function(value) {
    }
    , shift: function() {
    }
    
    //Status flags
    , count: function() {
    }
  };
}

