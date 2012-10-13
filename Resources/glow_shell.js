// GLOW PingPong shell
// Author: Mikola Lysenko (http://0fps.net)
// License: BSD

//Simulation parameters
var parameters = {
    WIDTH: 256,
    HEIGHT: 256,
    STEPS_PER_FRAME: 1
};

// create a context and set white background
var context;
try {
  context = new GLOW.Context();
} catch(e) {
  alert("WebGL not supported :-(");
  return;
}

//Make sure we have floating point textures
if( !context.enableExtension( "OES_texture_float" )) {
  alert( "No support for float textures!" );
  return;
}

//Set up basic parameters
context.setupClear( { red: 1, green: 1, blue: 1 } );

// attach the context's DOM element
var container = document.getElementById("container");
container.appendChild( context.domElement );


//Allocate ping pong buffers
var buffer_dims = [ parameters.WIDTH, parameters.HEIGHT ];
var buffers = new Array(2);
var current_buffer = 0;
(function() { 
    
    
    //Create initial conditions
    var initial_state = new Float32Array(buffer_dims[0] * buffer_dims[1] * 4);
    var ptr = 0;
    for(var j=0; j<buffer_dims[1]; ++j) {
        for(var i=0; i<buffer_dims[0]; ++i) {
            var x = Math.floor(i / parameters.INNER_RADIUS);
            var y = Math.floor(j / parameters.INNER_RADIUS);
            
            initial_state[ptr]   = Math.random();
            initial_state[ptr+1] = 0;
            initial_state[ptr+2] = 0;
            initial_state[ptr+3] = 0;
            ptr += 4;
        }
    }
    
    //Initialize buffers
    for(var i=0; i<buffers.length; ++i) {
        buffers[i] = new GLOW.FBO( {
            width:     buffer_dims[0],
            height:    buffer_dims[1],
            magFilter: GL.NEAREST,
            minFilter: GL.NEAREST,
            type:      GL.FLOAT,
            wrapS:     GL.REPEAT,
            wrapT:     GL.REPEAT,
            depth:     false, 
            stencil:   false,
            data:      initial_state
        } );
    }
})();


//Pass through vertex shader
var passThruVS = [
    "attribute  vec3    vertices;",
    "attribute  vec2    uvs;",
    "varying    vec2    uv;",

    "void main(void)",
    "{",
        "uv = uvs;",
        "gl_Position = vec4( vertices.x, vertices.y, 1.0, 1.0 );",
    "}"
].join( "\n" );

//Common shader functions
var commonFS = [

    "#ifdef GL_ES",
        "precision highp float;",
    "#endif",        
    "#define PI 3.14159265358979323846264",
    (function() {
        var result = [];
        for(var param in parameters) {
            result.push("#define " + param + " " + parameters[param]);
        }
        return result.join("\n");
    })(),
    
    "uniform    sampler2D    state;",
    "varying    vec2         uv;",
    "float f(vec2 p) {",
        "return texture2D(state, uv+(p/vec2(WIDTH, HEIGHT))).r;",
    "}"
    
].join("\n");

//Updates the state of a single cell
var updateStateFS = [
    
    commonFS,
    
    "void main( void ) {",
        "gl_FragColor = texture2D(state, uv);",
    "}"
].join( "\n" );

//Computes the color of a single pixel
var renderStateFS = [
    commonFS,

    "void main( void ) {",
        "gl_FragColor = vec4(texture2D(state, uv).xyz, 1);",
    "}"

].join( "\n" );


//Creates a shader
function makeShader(frag_src, buf_num) { 
    return new GLOW.Shader({
        vertexShader: passThruVS,
        fragmentShader: frag_src,
        data: {
            state: buffers[buf_num],
            vertices: GLOW.Geometry.Plane.vertices(),
            uvs: GLOW.Geometry.Plane.uvs()
        },
        indices: GLOW.Geometry.Plane.indices(),
        primitives: GLOW.Geometry.Plane.primitives()
    });
};


//Create processes
var updatePass = new Array(buffers.length);
var renderPass = new Array(buffers.length);

//This is stupid, but I can't figure out how to get GLOW to swap a buffer -Mik
(function() {
    for(var i=0; i<buffers.length; ++i) {
        updatePass[i] = makeShader(updateStateFS, (i - 1 + buffers.length) % buffers.length);
        renderPass[i] = makeShader(renderStateFS, i);
    }
})();


// Render (using setInterval as WebGL Inspector have problem with requestAnimationFrame)
var nextFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();


//Render a frame
function render() {
    //Initialize context
    context.cache.clear();
    context.enableDepthTest(false);
    
    for(var i=0; i<parameters.STEPS_PER_FRAME; ++i) {
        //Increment buffer number
        current_buffer = (current_buffer + 1) % buffers.length;
        
        //Compute next state
        buffers[current_buffer].bind();
        updatePass[current_buffer].draw();
        buffers[current_buffer].unbind();
    }
    
    //Render state of system to canvas
    renderPass[current_buffer].draw();
    
    nextFrame(render);
}

render();
​
