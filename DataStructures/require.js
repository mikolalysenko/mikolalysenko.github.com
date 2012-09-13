// ==Closure.compiler==
// @compilation_level SIMPLE_OPTIMIZATIONS
// ==/Closure.compiler==

// Require() 0.3.2 unstable
//
// Copyright 2012 Torben Schulz <http://pixelsvsbytes.com/>
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.
// 
///////////////////////////////////////////////////////////////////////

(function() {
'use strict';

if (window.require !== undefined)
	throw 'RequireException: \'require\' already defined in global scope';

window.require = function(module, callback, base_url) {

  base_url = base_url || "";
  
  //Munge tokens
  var toks = module.split("/");
  if(toks[0] == '.') {
    toks = base_url.split('/').concat(toks.slice(1));
  }
  for(var i=0; i<toks.length; ++i) {
    if(toks[i] == ".." && i > 0) {
      toks.splice(i-1, 2);
      i -= 2;
    } else if(toks[i] == "." || toks[i].length === 0) {
      toks.splice(i, 1);
      i -= 1;
    }
  }
  
  var dirname = toks.slice(0,toks.length-1).join("/")
    , url = toks.join("/");
  
	if (require.cache[url]) {
		// NOTE The callback should always be called asynchronously
		var obj = require.cache[url];
		if(obj.loaded) {
		  callback && setTimeout(function(){callback(obj.exports);}, 0);
		  return obj.exports;
		} else if(callback) {
		  obj.listeners.push(callback);
		  return obj.exports;
		}
	} else {
	  window.require.cache[url] = {
	      loaded: false
	    , listeners: []
	    , exports: new Object()
	  };
  }
  
  
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
	
	  var obj = window.require.cache[url];
	  if(obj.loaded) {
	    return;
	  }
	
		if (request.readyState != 4)
			return;
		if (request.status != 200)
			throw 'RequireException: '+request.status+' '+request.statustext+' ('+url+')';

		if (request.getResponseHeader('content-type').indexOf('application/json') != -1) 
			window.require.cache[url] = JSON.parse(request.responseText);
		else 
			eval('(function(){\'use strict\';\nvar exports=window.require.cache[\''+url+'\'].exports;\nvar __DIRNAME="'+dirname+'";\nvar require=function(module,cb){return window.require(module,cb,"'+dirname+'");};\n'+request.responseText+'\n})();\n//@ sourceURL='+url);

    //Set loaded flag
    obj.loaded = true;
    
    //Wake up all listeners
    var listeners = obj.listeners;
    for(var i=0; i<listeners.length; ++i) {
      listeners[i](obj.exports);
    }
	}
	
	if(callback) {
	  window.require.cache[url].listeners.push(callback);
  }

	request.open('GET', url, !!callback);
	request.send();
	return require.cache[url].exports;
}

// INFO initializing module cache
window.require.cache = new Object();

})();
