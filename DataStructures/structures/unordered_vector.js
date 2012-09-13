var vector = require('./vector.js');

exports.create = function(ArrayType, item_size) {
  var vec = vector.create(ArrayType, item_size);
  
  vec.remove = function(iter) {
    var buf = vec.buffer(iter)
      , eob = vec.end() - item_size;
    for(var i=0; i<item_size; ++i) {
      buf[iter+i] = buf[eob+i];
    }
    vec.pop();
  }

  return vec;
}


