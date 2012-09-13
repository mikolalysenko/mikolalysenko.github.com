function Cell(prev, next, value) {
  this.prev = prev;
  this.next = next;
  this.value = value;
}

function List(head, tail) {
  this.head = head;
  this.tail = tail;
}

exports.create = function() {
  return new List(null, null);
}

exports.append = function(list, value) {
  var ncell = new Cell(list.tail, null, value);
  if(!list.head) {
    list.head       = ncell;
    list.tail       = ncell;
  } else {
    list.tail.next  = ncell;
    list.tail       = ncell;
  }
}

exports.insert = function(list, iter, value) {
  if(iter === null) {
    exports.append(list, value);
    return;  
  }
  var ncell = new Cell(iter.prev, iter, value);
  iter.prev = ncell;
  if(iter.prev) {
    iter.prev.next = ncell;
  } else {
    list.head = ncell;
  }
}

exports.remove = function(list, iter) {
  if(iter.prev) {
    iter.prev.next = iter.next;
  } else {
    list.head = iter.next;
  } 
  if(iter.next) {
    iter.next.prev = iter.prev;
  } else {
    list.tail = iter.prev;
  }
}

exports.read = function(list, iter) {
  return iter.value;
}

exports.begin = function(list) {
  return list.head;
}

exports.next = function(list, iter) {
  return iter.next;
}

exports.prev = function(list, iter) {
  return iter.prev;
}

exports.end = function(list) {
  return null;
}

