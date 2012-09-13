exports.create = function(ArrayType, item_size) {

  function Cell(next, prev, value) {
    this.next   = next;
    this.prev   = prev;
    this.value  = value;
  }

  var head  = null
    , tail  = null
    , count = 0;
    
  //Create the data structure
  var list = {
  
    //Iterator functions
      begin: function() {
      return head;
    }
    , end: function() {
      return null;
    }
    , buffer: function(iter) {
      return iter.value;
    }
    , index: function(iter) {
      return 0;
    }
    , next: function(iter) {
      return iter.next;
    }
    , prev: function(iter) {
      if(iter)
        return iter.prev;
      return tail;
    }
    , valid: function(iter) {
      return !!iter;
    }
    
    //Iterator modification stuff
    , insert: function(iter, value) {
      ++count;
      
      //Special case: At end of list
      if(!iter) {
        var ncell = new Cell(null, tail, value);
        if(tail) {
          tail.next = ncell;
        } else {
          head = ncell;
        }
        tail = ncell;
        return;
      }
      //Otherwise, just insert normally
      var ncell = new Cell(iter, iter.prev, value);
      if(iter.prev) {
        iter.prev.next = ncell;
      } else {
        head = ncell;
      }
      iter.prev = ncell;
    }
    , remove: function(iter) {
      --count;
      if(iter.prev) {
        iter.prev.next = iter.next;
      } else {
        head = iter.next;
      }
      if(iter.next) {
        iter.next.prev = iter.prev;
      } else {
        tail = iter.prev;
      }
    }
    
    
    //Updates
    , push: function(value) {
      list.insert(list.end(), value);
    }
    , pop: function() {
      list.remove(list.prev(list.end()));
    }
    , unshift: function(value) {
      list.insert(list.begin(), value);
    }
    , shift: function() {
      list.remove(list.begin());
    }
    
    //Status stuff
    , count: function() {
      return count;
    } 
  };
  
  return list;
}
