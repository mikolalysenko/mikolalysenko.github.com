exports.create = function() {
  return [];
}

exports.insert = function(array, iter, value) {
  //Not supported  
  throw new Error("Unsupported operation");
}

exports.remove = function(array, iter) {
  array[iter] = array[array.length - 1];
  array.pop();
}

exports.append = function(array, value) {
  array.push(value);
}

exports.read = function(array, iter) {
  return array[iter];
}

exports.begin = function(array) {
  return array.length - 1;
}

exports.prev = function(array, iter) {
  //Not supported  
  throw new Error("Unsupported operation");
}

exports.next = function(array, iter) {
  return iter - 1;
}

exports.end = function(array) {
  return -1;
}

