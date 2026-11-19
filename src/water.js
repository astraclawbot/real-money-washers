/* Refraction ripples on the water photograph; the original image remains the fallback. */
(() => {
  const image = document.querySelector('[data-comparison-image]');
  if (!image) return;
  const surface = image.closest('.inspection-image');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.createElement('canvas');
  canvas.className = 'water-surface';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, powerPreference: 'low-power' });
  if (!gl) return;
  const count = Math.min(36, gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS) - 12);
  if (count < 8) return;
  const vertexSource = `attribute vec2 position; varying vec2 uv;
    void main(){ uv=position*0.5+0.5; gl_Position=vec4(position,0.0,1.0); }`;
  const fragmentSource = `precision mediump float;
    varying vec2 uv;
    uniform sampler2D photo;
    uniform vec2 cover;
    uniform float aspect;
    uniform float time;
    uniform vec4 drops[${count}];
    void main(){
      vec2 screen=vec2(uv.x,1.0-uv.y);
      vec2 photoUV=(screen-0.5)*cover+0.5;
      // The inner glass tray, expressed in coordinates of the original photo.
      vec2 tray=abs((photoUV-vec2(0.5,0.50))/vec2(0.315,0.40));
      float boundary=pow(pow(tray.x,8.0)+pow(tray.y,8.0),0.125);
      float water=1.0-smoothstep(0.90,1.0,boundary);
      vec2 slope=vec2(0.0);
      for(int i=0;i<${count};i++){
        float age=time-drops[i].z;
        if(age>0.0 && age<2.6 && drops[i].w>0.0){
          vec2 delta=(screen-drops[i].xy)*vec2(aspect,1.0);
          float radius=length(delta);
          float front=radius-age*0.25;
          float envelope=exp(-front*front/0.006)*exp(-age*1.7);
          float phase=front*90.0;
          float derivative=(cos(phase)*90.0-sin(phase)*front/0.003)*envelope;
          float onset=smoothstep(0.0,0.065,age);
          slope+=delta/max(radius,0.008)*derivative*0.000045*drops[i].w*onset;
        }
      }
      slope=clamp(slope,vec2(-0.025),vec2(0.025))*water;
      vec2 offset=slope/vec2(aspect,1.0)*cover;
      vec3 color=texture2D(photo,clamp(photoUV+offset,0.001,0.999)).rgb;
      // Paired light and shadow follow the wave normals, without opaque rings.
      float reflection=dot(slope,vec2(-0.6,-0.8));
      color+=reflection*1.7;
      color+=vec3(0.78,0.90,1.0)*pow(max(reflection*16.0,0.0),2.0)*0.11;
      gl_FragColor=vec4(color,1.0);
    }`;
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
    return shader;
  };
  const vertex = compile(gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertex || !fragment) return;
  const program = gl.createProgram();
  gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const locations = Object.fromEntries(['photo','cover','aspect','time','drops[0]'].map(name=>[name,gl.getUniformLocation(program,name)]));
  gl.uniform1i(locations.photo,0);
  const drops = new Float32Array(count*4);
  let cursor = 0, frame = 0, lastInput = -10, previous = null, ready = false, visible = true;
  const started = performance.now();
  const clock = () => (performance.now()-started)/1000;
  const clear = () => {
    cancelAnimationFrame(frame); frame=0; drops.fill(0); previous=null;
    canvas.hidden=true;
  };
  const resize = () => {
    const rect=surface.getBoundingClientRect();
    const scale=Math.min(devicePixelRatio || 1,1.25,1600/Math.max(rect.width,1));
    canvas.width=Math.max(1,Math.round(rect.width*scale));
    canvas.height=Math.max(1,Math.round(rect.height*scale));
    gl.viewport(0,0,canvas.width,canvas.height);
    const ratio=rect.width/rect.height, sourceRatio=image.naturalWidth/image.naturalHeight;
    gl.uniform2f(locations.cover,Math.min(1,ratio/sourceRatio),Math.min(1,sourceRatio/ratio));
    gl.uniform1f(locations.aspect,ratio);
    clear();
  };
  const render = () => {
    frame=0;
    if(!ready || !visible || reducedMotion.matches || document.hidden || clock()-lastInput>2.7){clear();return;}
    gl.uniform1f(locations.time,clock());
    gl.uniform4fv(locations['drops[0]'],drops);
    gl.drawArrays(gl.TRIANGLES,0,6);
    canvas.hidden=false;
    frame=requestAnimationFrame(render);
  };
  const load = () => {
    clear(); ready=false;
    if(!image.complete || !image.naturalWidth)return;
    try {gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);ready=true;resize();} catch { canvas.hidden=true; }
  };
  canvas.hidden=true;
  surface.append(canvas);
  image.addEventListener('load',load);
  new MutationObserver(()=>{ready=false;clear();if(image.complete)load();}).observe(image,{attributes:true,attributeFilter:['src']});
  const addDrop = (x,y,strength) => {
    const offset=(cursor++%count)*4;
    drops.set([x,y,clock(),strength],offset);
  };
  surface.addEventListener('pointermove',event=>{
    if(!ready || !visible || reducedMotion.matches || event.pointerType==='touch' || event.target.closest('.comparison-controls')){previous=null;return;}
    const rect=surface.getBoundingClientRect();
    const x=(event.clientX-rect.left)/rect.width,y=(event.clientY-rect.top)/rect.height;
    const ratio=rect.width/rect.height, sourceRatio=image.naturalWidth/image.naturalHeight;
    const px=(x-.5)*Math.min(1,ratio/sourceRatio)+.5,py=(y-.5)*Math.min(1,sourceRatio/ratio)+.5;
    if(Math.pow(Math.abs((px-.5)/.315),8)+Math.pow(Math.abs((py-.5)/.4),8)>0.85){previous=null;return;}
    const now=clock();
    if(previous && now-previous.time<0.018)return;
    const distance=previous?Math.hypot((x-previous.x)*rect.width,(y-previous.y)*rect.height):0;
    if(previous && distance<3)return;
    const steps=previous?Math.min(5,Math.max(1,Math.ceil(distance/14))):1;
    for(let step=1;step<=steps;step++){
      const t=step/steps;
      addDrop(previous?previous.x+(x-previous.x)*t:x,previous?previous.y+(y-previous.y)*t:y,Math.min(1.3,.65+distance/120));
    }
    previous={x,y,time:now};lastInput=now;
    if(!frame)frame=requestAnimationFrame(render);
  },{passive:true});
  surface.addEventListener('pointerleave',()=>{previous=null;});
  new ResizeObserver(resize).observe(surface);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible)clear();}).observe(surface);
  reducedMotion.addEventListener('change',clear);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();ready=false;clear();});
  canvas.addEventListener('webglcontextrestored',()=>{ready=false;canvas.hidden=true;});
  load();
})();
