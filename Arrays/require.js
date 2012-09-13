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

window.require = function(module, callback) {
	var url = window.require.resolve(module);

	if (require.cache[url]) {
		// NOTE The callback should always be called asynchronously
		callback && setTimeout(callback, 0);
		return require.cache[url];
	}

	require.cache[url] = new Object();

	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		if (request.readyState != 4)
			return;
		if (request.status != 200)
			throw 'RequireException: '+request.status+' '+request.statustext+' ('+url+')';

		if (request.getResponseHeader('content-type').indexOf('application/json') != -1) 
			window.require.cache[url] = JSON.parse(request.responseText);
		else 
			eval('(function(){'+(window.require.strict?'\'use strict\';':'')+'var exports=window.require.cache[\''+url+'\'];'+request.responseText+'\n})();\n//@ sourceURL='+url);

		callback && callback();
	}

	request.open('GET', url, !!callback);
	request.send();
	return require.cache[url];
}
window.require.resolve = function(module) {
	var r = module.match(/^(\.{0,2}\/)?([^\.]*)(\..*)?$/);
	return (r[1]?r[1]:'/js_modules/')+r[2]+(r[3]?r[3]:'/index.js');
}
// INFO initializing module cache
window.require.cache = new Object();
// INFO initializing strict mode toggle
window.require.strict = false;

})();
