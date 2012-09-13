exports.create = function() {
  return [];
}

exports.insert = function(array, iter, value) {
  array.splice(iter, 0, value);
}

exports.remove = function(array, iter) {
  array.splice(iter, 1);
}

exports.append = function(array, value) {
  array.push(value);
}

exports.read = function(array, iter) {
  return array[iter];
}

exports.begin = function(array) {
  return array.length-1;
}

exports.prev = function(array, iter) {
  return iter + 1;
}

exports.next = function(array, iter) {
  return iter - 1;
}

exports.end = function(array) {
  return -1;
}
