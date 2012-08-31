"use strict";

//Retrieve event emitter
var EventEmitter = require('./events.js').EventEmitter;
module.exports = new EventEmitter();

exports.gl = null;

//State tracking stuff, reduce number of render state changes
var current_array_buffer    = null
  , current_element_buffer  = null
  , current_shader = null
  , current_attributes = [];


//------------------------------------------------------------------
// Vertex Buffer Objects
//------------------------------------------------------------------
//Vertex buffer wrapper
function VertexBuffer(args) {
  this.buffer = exports.gl.createBuffer();
  this.type   = args.type || exports.gl.ARRAY_BUFFER;
  this.size   = 0;
  this.deleted = false;
  //Initialize data
  this.bind();
  if(args.data) {
    this.size = args.data.length;
    exports.gl.bufferData(this.type, args.data, args.hint || exports.gl.STATIC_DRAW);
  } else if(args.size) {
    this.size = args.size;
    exports.gl.bufferData(this.type, args.size, args.hint || exports.gl.STATIC_DRAW);
  }
  exports.emit("vbo", this);
};
VertexBuffer.prototype = {
  bind: function() {
    if(this.deleted) {
      return;
    }
    if(this.type === exports.gl.ARRAY_BUFFER) {
      if(current_array_buffer === this)
        return;
      exports.gl.bindBuffer(this.type, this.buffer);
      current_array_buffer = this;
    } else {
      if(current_element_buffer === this)
        return;
      exports.gl.bindBuffer(this.type, this.buffer);
      current_element_buffer = this;
    }
  }
  , set: function(data, hint) {
    if(this.deleted) {
      return;
    }
    this.bind();
    this.size = data.length;
    exports.gl.bufferData(this.type, data, hint || exports.gl.DYNAMIC_DRAW);
  }
  , resize: function(size, hint) {
    if(this.deleted) {
      return;
    }
    this.bind();
    this.size = size;
    exports.gl.bufferData(this.type, size, hint || exports.gl.DYNAMIC_DRAW);
  }
  , write: function(start, data) {
    if(this.deleted) {
      return;
    }
    this.bind();
    exports.gl.bufferSubData(this.type, start, data);
  }
  , destroy: function() {
    if(this.deleted) {
      return;
    }
    exports.gl.deleteBuffer(this.buffer);
    this.deleted = true;
  }
};
exports.VertexBuffer = VertexBuffer;


//------------------------------------------------------------------
// Shaders
//------------------------------------------------------------------
//Creates shader object
function createShaderObject (src, type) {
  var gl = exports.gl
    , shader = gl.createShader (type);
  gl.shaderSource (shader, src);
  gl.compileShader (shader);
  if (!gl.getShaderParameter (shader, gl.COMPILE_STATUS)) {
    throw new Error((type == gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT") + " SHADER:\n" + gl.getShaderInfoLog (shader));
  }
  return shader;
}
//Uniform and attribute parser
var simpleTypes = {
    "float":    "1f"
  , "bool":     "1i"
  , "int":      "1i"
  , "uint":     "1i"
  , "vec2":     "2fv"
  , "vec3":     "3fv"
  , "vec4":     "4fv"
  , "ivec2":    "2iv"
  , "ivec3":    "3iv"
  , "ivec4":    "4iv"
  , "uvec2":    "2fv"
  , "uvec3":    "3fv"
  , "uvec4":    "4fv"
  , "bvec2":    "2iv"
  , "bvec3":    "3iv"
  , "bvec4":    "4iv"
};
var matrixTypes = {
    "mat2":     2
  , "mat3":     3
  , "mat4":     4
};
var samplerTypes = {
    "sampler2D":    "2D"
  , "samplerCube":  "Cube"
};
function getParams(src, uniforms, attributes) {
  var reg = /(uniform|attribute)\s+(bool|u?int|float|[biu]?vec[234]|mat[234]|sampler2D|samplerCube)\s+(\w+)\s*;/gm;
  reg.compile();
  for(var tmp = reg.exec(src); !!tmp; tmp = reg.exec(src)) {
    if(tmp[1] == "uniform") {
      uniforms[tmp[3]] = tmp[2];
    } else {
      attributes[tmp[3]] = tmp[2];
    }
  }
}
function addUniform(container, program, uniform, type) {
  var gl = exports.gl
    , location = gl.getUniformLocation(program, uniform);
  if(!location) {
    console.warn("Unused uniform: ", uniform, type);
    container[uniform] = null;
    return;
  }
  container.__defineGetter__(uniform, function() {
    return gl.getUniform(program, location);
  }); 
  if(type in simpleTypes) {  
    container.__defineSetter__(uniform, eval([
        "function(value) {"
      , "gl.uniform" + simpleTypes[type] + "(location, value);"
      , "return value;"
      , "}"].join('\n')));
  } else if(type in matrixTypes) {
    container.__defineSetter__(uniform, eval([
        "function(value) {"
      , "gl.uniformMatrix" + matrixTypes[type] + "(location, false, value);"
      , "return value;"
      , "}"].join('\n')));
  } else if(type in samplerTypes) {
    container.__defineSetter__(uniform, function(value) {
      gl.uniform1i(program, value);
      return value;
    });
  } else {
    throw new Error("Invalid type for uniform");
  }
}
function addAttribute(container, program, attribute, type) {
  var gl = exports.gl
    , location = gl.getAttribLocation(program, attribute);
  container[attribute + "_location"] = location;
  if(location < 0) {
    console.warn("Unused attribute location");
    container[attribute] = null;
    return;
  }
  if(!(type in simpleTypes)) {
    throw new Error("Invalid attribute type: " + attribute + ", " + type);
  }
  container.attributes[location] = true;
  container.__defineSetter__(attribute, eval([
    "function(value) {"
    , "gl.vertexAttrib" + type + "(" + location + ", value);"
    , "return value;"
    , "}"].join('\n')));
  var ele_size = parseInt(type.charAt(0));    
  container[attribute + "_bind"] = function(args) {
    args.buffer.bind();
    gl.vertexAttribPointer(
        location
      , ele_size
      , args.type || gl.FLOAT
      , args.stride || 0
      , args.offset || 0);
  };
}
function Shader(vertex_shader, fragment_shader) {
  //First compile program
  var gl = exports.gl
    , program = gl.createProgram()
    , vs = createShaderObject(vertex, gl.VERTEX_SHADER)
    , fs = createShaderObject(fragment, gl.FRAGMENT_SHADER);
  gl.attachShader (program, vs);
  gl.attachShader (program, fs);
  gl.linkProgram (program);
  if (!gl.getProgramParameter (program, gl.LINK_STATUS)) {
    throw new Error([
        "Error creating shader:"
      , "--- Validate status: ---" 
      , gl.getProgramParameter (program, gl.VALIDATE_STATUS)
      , "--- GL Error: ---"
      , gl.getError ()
      , "--- Vertex Shader ---"
      , vertex
      , "--- Fragment Shader ---"
      , fragment].join('\n'));
  }
  gl.deleteShader (vs);
  gl.deleteShader (fs);
  
  //Set members
  this.program = program;
  this.deleted = false;
  this.attributes = new Array(current_attributes.length);
  for(var i=0; i<current_attributes.length; ++i) {
    this.attributes[i] = false;
  }
  
  //Add uniform and attribute accessor methods
  var uniforms    = {}
    , attributes  = {};
  getParams(vertex_shader,    uniforms, attributes);
  getParams(fragment_shader,  uniforms, attributes);
  for(var p in uniforms) {
    addUniform(this, program, p, uniforms[p]);
  }
  for(var p in attributes) {
    addAttribute(this, program p, attributes[p]);
  }
  
  exports.emit("shader", this);
}
Shader.prototype = {
  bind: function() {
    if(this.deleted || current_shader === this) {
      return;
    }
    exports.gl.useProgram(this);
    for(var i=0; i<current_attributes.length; ++i) {
      if(current_attributes[i] === this.attributes[i]) {
        continue;
      } else if(this.attributes[i]) {
        exports.gl.enableVertexAttribArray(this.attributes[i]);
      } else {
        exports.gl.enableVertexAttribArray(this.attributes[i]);
      }
      current_attributes[i] = this.attributes[i];
    }
    current_shader = this;
  }
  , destroy: function() {
    if(this.deleted) {
      return;
    }
    if(current_shader === this) {
      current_shader = null;
    }
    exports.gl.deleteProgram(this.program);
    this.deleted = true;
  }
};
exports.Shader = Shader;



//------------------------------------------------------------------
// Basic Initialization
//------------------------------------------------------------------
function check_error() {
  var code = exports.gl.getError();
  if(code === exports.gl.NO_ERROR) {
    return;
  }
  throw new Error("WebGL Error.  Code = ", code);
}

var canvas = null;
function onWindowResize (event) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  exports.gl.viewport (0, 0, canvas.width, canvas.height);
  exports.width   = canvas.width;
  exports.height  = canvas.height;
  exports.emit("resize", canvas.width, canvas.height);
  check_error();
}

var nextFrame = window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || window.oRequestAnimationFrame
  || window.msRequestAnimationFrame
  || function(callback, element) {
      window.setTimeout(callback, 1000 / 60);
  };
  
exports.init = function() {
  canvas = params.canvas_element;
  exports.gl = canvas.getContext ('experimental-webgl');
  
  var n_attribs = exports.gl.getParameter(exports.gl.MAX_VERTEX_ATTRIBS);
  current_attributes = [];
  for(var i=0; i<n_attribs; ++i) {
    current_attributes.push(false);
  }
  
  onWindowResize ();
  window.addEventListener ('resize', onWindowResize, false);
  
  exports.emit("init");
  check_error();
  
  nextFrame(animate);
}

function animate () {
  nextFrame(animate);
  exports.emit("draw");
  check_error();
}

