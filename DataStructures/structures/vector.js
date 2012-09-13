//A flat array of fixed size items stored in a packed type array.
//
// Basically this class is a workaround for the lack of packed struct support in javascript
//
exports.create = function(ArrayType, item_size) {

  var buffer_size = 0
    , buffer = new ArrayType(item_size, Math.ceil(4096 / item_size));
  
  //Reserves some space  
  function check_resize() {
    if(buffer_size + item_size <= buffer.length) {
      return;
    }
    var tmp = new ArrayType(2*buffer.length);
    tmp.set(buffer);
    buffer = tmp;
  }
  
  return {
    //Basic iterator stuff
      begin: function() {
      return 0;
    }
    , end: function() {
      return buffer_size;
    }
    , buffer: function(iter) {
      return buffer;
    }
    , index: function(iter) {
      return iter;
    }
    , next: function(iter) {
      return iter + item_size;
    }
    , prev: function(iter) {
      return iter - item_size;
    }
    , valid: function(iter) {
      return 0 <= iter && iter < buffer_size;
    }

    //Iterator modification stuff
    , insert: function(iter, value) {
      check_resize();
      buffer.set(buffer.subarray(iter, buffer_size), iter+item_size);
      buffer.set(value, iter);
      buffer_size += item_size;
    }
    , remove: function(iter) {
      buffer.set(buffer.subarray(iter+item_size, buffer_size), iter);
      buffer_size -= item_size;
    }

    //Updates
    , push: function(value) {
      check_resize();
      buffer.set(value, buffer_size);
      buffer_size += item_size;
    }
    , pop: function() {
      buffer_size -= item_size;
    }
    , unshift: function(value) {
      check_resize();
      buffer.set(buffer.subarray(item_size, buffer_size), item_size);
      buffer.set(value);
      buffer_size += item_size;
    }
    , shift: function() {
      buffer.set(buffer.subarray(item_size, buffer_size));
      buffer_size -= item_size;
    }
    
    //Status flags
    , count: function() {
      return buffer_size / item_size;
    }
    , item_size: function() {
      return item_size;
    }
  };
}

