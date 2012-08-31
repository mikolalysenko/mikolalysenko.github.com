// Browser-require
//  https://github.com/rsms/browser-require

// CommonJS compatible module loading.
// (Except from require.paths, it's compliant with spec 1.1.1.)
(function(parentExports){
  // normalize an array of path components
  function normalizeArray (v, keepBlanks) {
    var L = v.length, dst = new Array(L), dsti = 0,
        i = 0, part, negatives = 0,
        isRelative = (L && v[0] !== '');
    for (; i<L; ++i) {
      part = v[i];
      if (part === '..') {
        if (dsti > 1) {
          --dsti;
        } else if (isRelative) {
          ++negatives;
        } else {
          dst[0] = '';
        }
      } else if (part !== '.' && (dsti === 0 || keepBlanks || part !== '')) {
        dst[dsti++] = part;
      }
    }
    if (negatives) {
      dst[--negatives] = dst[dsti-1];
      dsti = negatives + 1;
      while (negatives--) { dst[negatives] = '..'; }
    }
    dst.length = dsti;
    return dst;
  }
  // normalize an id
  function normalizeId(id, parentId) {
    id = id.replace(/\/+$/g, '');
    return normalizeArray((parentId ? parentId + '/../' + id : id).split('/'))
           .join('/');
  }
  // normalize a url
  function normalizeUrl(url, baseLocation) {
    if (!(/^\w+:/).test(url)) {
      var u = baseLocation.protocol+'//'+baseLocation.hostname;
      if (baseLocation.port && baseLocation.port !== 80) {
        u += ':'+baseLocation.port;
      }
      var path = baseLocation.pathname;
      if (url.charAt(0) === '/') {
        url = u + normalizeArray(url.split('/')).join('/');
      } else {
        path += ((path.charAt(path.length-1) === '/') ? '' : '/../') + url;
        url = u + normalizeArray(path.split('/')).join('/');
      }
    }
    return url;
  }
  // define a constant (read-only) value property
  var defineConstant;
  if (Object.defineProperty) {
    defineConstant = function (obj, name, value) {
      Object.defineProperty(obj, name, {value: value, writable: false,
        enumerable: true, configurable: false});
    }
  } else {
    defineConstant = function (obj, name, value) { obj[name] = value; }
  }
  // require/load/import a module
  // require(id[, parentId]) -> [object module-api]
  // @throws Error /module not found (json-rep-of-id)/
  function require (id, parentId) {
    var originalInputId = id; // for "not found" error message
    if (id.charAt(0) === '.') {
      id = normalizeId(id, parentId);
    }
    if (!require.modules.hasOwnProperty(id)) {
      throw new Error('module not found '+JSON.stringify(originalInputId));
    }
    var mod = require.modules[id];
    if (mod.exports === undefined) {
      var _require = function (_id) {
        //console.log('_require', _id, 'from', id);
        return require(_id, id);
      };
      defineConstant(_require, 'main', require.main);
      var block = mod.block; delete mod.block;
      mod.exports = {};
      if (require.initFilter) {
        block = require.initFilter(block);
      }
      block(_require, mod, mod.exports);
    }
    return mod.exports;
  }
  // define a module
  // define(String id, [String uri,] block(require, module, exports){...})
  function define (id, uri, block) {
    if (typeof uri === 'function') {
      block = uri; uri = null;
    }
    var mod = {block: block};
    defineConstant(mod, 'id', String(id));
    if (uri) {
      defineConstant(mod, 'uri', String(uri));
    }
    require.modules[mod.id] = mod;
    return mod;
  }
  // modules keyed by id
  require.modules = {};
  // search paths -- disabled until we use/need this
  //require.paths = [];
  // main module, accessible from require.main
  var mainModule = define('');
  delete mainModule.block;
  mainModule.exports = parentExports;
  defineConstant(require, 'main', mainModule);
  // the define function
  require.define = define;
  // export the require function
  parentExports.require = require;

  // -------------------------------------------------------
  // Optional require.load
  if (typeof XMLHttpRequest === "undefined") {
    // we make use of XHR
    XMLHttpRequest = function () {
      try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); } catch (e) {}
      try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); } catch (e) {}
      try { return new ActiveXObject("Msxml2.XMLHTTP"); } catch (e) {}
      throw new Error("This browser does not support XMLHttpRequest.");
    };
  }
  /**
   * Load and define a module
   * load ( spec Object, Function(callback(err Error)) )
   * load ( specs Array, Function(callback(err Error)) )
   * load ( url String, Function(callback(err Error)) )
   */
  function load (spec, callback) {
    if ((spec instanceof Array) ||
        Object.prototype.toString.call(spec) === "[object Array]") {
      if (callback) {
        // load multiple and join on callback
        var countdown = spec.length;
        for (var i=0;i<spec.length;++i) {(function(u){
          load(u, function (err) {
            if (err) {
              countdown = 0;
              //throw err;
              callback(err);
            } else if (--countdown === 0) {
              callback();
            }
          });
        })(spec[i]);}
      } else {
        // load multiple (blocking) -- don't use this for network resources
        for (var i=0;i<spec.length;++i) {
          load(spec[i]);
        }
      }
      return;
    } else if (typeof spec === 'string') {
      spec = {url:spec};
    }
    if (!spec.url && spec.id) {
      spec.url = spec.id + '.js';
    } else if (spec.url && !spec.id) {
      var m = /^[^\/]+\/\/[^\/]+\/(.+)$/.exec(spec.url);
      if (m) {
        spec.id = m[1];
      } else {
        spec.id = spec.url;
      }
      spec.id = spec.id.replace(/\.[^\.]+$/, '');
    } else if (!spec.url && !spec.id) {
      throw new TypeError('missing both "url" and "id"');
    }
    // normalize url
    spec.url = normalizeUrl(spec.url, window.location);
    var xhr = new XMLHttpRequest();
    var async = !!callback;
    function evalResponse() {
      try {
        eval('require.define("'+spec.id+'",'+
             ' "'+spec.url.replace(/"/g, '\\"')+'"'+
             ', function (require, module, exports) {'+xhr.responseText+'});');
      } catch (err) {
        err.message += ' in '+spec.url;
        throw err;
      }
    }
    xhr.open('GET', spec.url, async);
    if (async) {
      xhr.onreadystatechange = function (ev) {  
        if (xhr.readyState == 4) {
          if ((xhr.status < 300 && xhr.status >= 200)
            || (xhr.status === 0 && !spec.url.match(/^(?:https?|ftp):\/\//i))) {
            try {
              evalResponse();
              callback(null);
            } catch (err) {
              callback(err);
            }
          } else {
            callback(new Error('failed to load remote module with HTTP'+
                               ' response status '+xhr.status+' '+
                               xhr.responseText));
          }
        }
      };
    }
    xhr.send(null);
    if (!async) {
      evalResponse();
    }
  }
  require.load = load;

})(this);
