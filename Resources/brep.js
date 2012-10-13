//Javascript Tools for BREPS
// Author: Mikola Lysenko
// License: MIT
// Copyright 2012

var BREP = {};
(function(exports) {
"use strict";

var EPSILON = 1e-6;

//Compute the star of each vertex in the mesh
function compute_stars(mesh) {
  var stars = new Array(mesh.positions.length);
  for(var i=0; i<links.length; ++i) {
    stars[i] = [];
  }
  var faces = mesh.faces;
  for(var i=0; i<faces.length; ++i) {  
    var f = faces[i];
    for(var j=0; j<f.length; ++j) {
      stars[f[j]].push(i);
    }
  }
  return stars;
};

//Unordered pair
function UOPair(a, b) {
  if(a < b) {
    this.a = a;
    this.b = b;  
  } else {
    this.a = b;
    this.b = a;
  }
}

//Compares s vs t
function compare_uopair(s, t) {
  var da = s.a - t.a;
  if(da !== 0) {
    return da;
  }
  return s.b - t.b;
}

//Merge loops a and b in place.  This is not very efficient --Mik
function merge_loops(a, b) {
  var result = a.concat(b);
  result.sort(compare_uopair);
  for(var i=result.length-1; i>0; --i) {
    if(compare_uopair(result[i], result[i-1]) === 0) {
      result.splice(i, 1);
    }
  }
  return result;
}

//Extract face loop
function face_loop(f) {
  var loop = [];
  var p = f[f.length-1];
  for(var j=0; j<f.length; ++j) {
    var n = f[j];
    loop.push(new Pair(n, p));
    p = n;
  }
  loop.sort(compare_uopair);
  return loop;
}


//Computes the link (boundary of star) of each vertex in a mesh
function compute_links(mesh) {
  var loops = new Array(mesh.positions.length);
  for(var i=0; i<loops.length; ++i) {
    loops[i] = [ ];
  }
  
  //First build link by uniting all chains incident to vertex
  var faces = mesh.faces;
  var max_loop = 0;
  for(var i=0; i<faces.length; ++i) {  
    var f = faces[i];
    var loop = face_loop(f);
    for(var j=0; j<f.length; ++j) {
      loops[f[j]] = merge_loops(loops[f[j]], f);
      max_loop = Math.max(loops[f[j]].length, max_loop);
    }
  }
  
  //Then fuse chains by fixing an orientation
  var links = new Array(loops.length);
  var visited = new Array(max_loop);
  for(var i=0; i<loops.length; ++i) {
    var l = loops[i];
    
    for(var j=0; j<l.length; ++j) {
      visited[j] = false;
    }
    
    var link = [ l[0].a, l[0].b ];
    var cur  = l[0].b;
    var done = false;
    visited[0] = false;
    
    while(!done) {
      done = true;
      for(var j=1; j<l.length; ++j) {
        if(visited[j]) {
          continue;
        }
        var E = l[j];
        if(E.a === cur) {
          cur = E.b;
          done = false;
          link.push(cur);
        } else if(E.b === cur) {
          cur = E.a;
          done = false;
          link.push(cur);
        }
      }
    }

    links[i] = link;
  }
  
  return links;
};


//Estimate the normals of a mesh
function estimate_normals(mesh) {
  
  var positions = mesh.positions;
  var faces     = mesh.faces;
  var N         = positions.length;
  var normals   = new Array(N);
  
  //Initialize normal array
  for(var i=0; i<N; ++i) {
    normals[i] = [0.0, 0.0, 0.0];
  }
  
  //Walk over all the faces and add per-vertex contribution to normal weights
  for(var i=0; i<faces.length; ++i) {
    var f = faces[i];
    var p = 0;
    var c = f[f.length-1];
    var n = f[0];
    for(var j=0; j<f.length; ++j) {
    
      //Shift indices back
      p = c;
      c = n;
      n = f[(j+1) % f.length];
    
      var v0 = positions[p];
      var v1 = positions[c];
      var v2 = positions[n];
      
      //Compute arc lengths
      var d01 = new Array(3);
      var m01 = 0.0;
      var d21 = new Array(3);
      var m21 = 0.0;
      for(var k=0; k<3; ++k) {
        d01[k] = v0[k]  - v1[k];
        m01   += d01[k] * d01[k];
        d21[k] = v2[k]  - v1[k];
        m21   += d21[k] * d21[k];
      }

      //Accumulate values in normal
      if(m01 * m21 > EPSILON) {
        var norm = normals[c];
        var w = 1.0 / Math.sqrt(m01 * m21);
        for(var k=0; k<3; ++k) {
          var u = (k+1)%3;
          var v = (k+2)%3;
          norm[k] += w * (d01[u] * d21[v] - d01[v] * d21[u]);
        }
      }
    }
  }
  
  //Scale all normals to unit length
  for(var i=0; i<N; ++i) {
    var norm = normals[i];
    var m = 0.0;
    for(var k=0; k<3; ++k) {
      m += norm[k] * norm[k];
    }
    if(m > EPSILON) {
      var w = 1.0 / Math.sqrt(m);
      for(var k=0; k<3; ++k) {
        norm[k] *= w;
      }
    } else {
      for(var k=0; k<3; ++k) {
        norm[k] = 0.0;
      }
    }
  }

  //Return the resulting set of patches
  return normals;
}

//Set up exports
exports.compute_stars    = compute_stars;
exports.compute_links    = compute_links;
exports.estimate_normals = estimate_normals;

})(typeof(exports) !== "undefined" ? exports : BREP);
