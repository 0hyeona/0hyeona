(() => {
  'use strict';

  // 커서 이동 흔적을 시간에 따라 감쇠시키는 독립 구현입니다.
  // 외부 라이브러리 설치 없이 기존 제목과 폰트를 사용합니다.
  const options = {
    strength: 1.15,       // 왜곡 강도. 권장 0.3 ~ 1.2
    radius: 0.28,        // 제목 높이에 대한 반응 반경
    duration: 0.9        // 잔상이 사라지는 시간(초)
  };
  const MAX_TRAIL = 32;

  async function init() {
    const title = document.getElementById('hero-title');
    if (!title || title.dataset.warpReady) return;
    const lines = Array.from(title.children).filter(el => el.classList.contains('hero-title-line'));
    if (!lines.length) return;
    title.dataset.warpReady = 'true';
    await document.fonts.ready;

    const canvas = document.createElement('canvas');
    canvas.className = 'hero-warp__canvas';
    canvas.setAttribute('aria-hidden', 'true');
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false });
    if (!gl) return; // WebGL이 없으면 원래 HTML 제목을 표시합니다.

const vertex = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;
const fragment = `#version 300 es
precision highp float;
uniform sampler2D uTextTexture;
uniform vec2 uResolution;
uniform vec4 uTrail[32];
uniform vec2 uDirection[32];
uniform float uStrength;
uniform float uRadius;
uniform vec2 uPress;
uniform float uAmount;
in vec2 vUv;
out vec4 fragColor;
void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 field = vec2(0.0);
  for (int i = 0; i < 32; i++) {
    vec4 point = uTrail[i];
    vec2 delta = (vUv - point.xy) * vec2(aspect, 1.0);
    float distanceToPoint = length(delta);
    float area = 1.0 - smoothstep(0.0, uRadius, distanceToPoint);
    float age = point.z;
    float envelope = smoothstep(0.0, 0.12, age) * pow(1.0 - age, 2.0);
    float influence = area * area * envelope * point.w;
    vec2 pull = uDirection[i] * 0.035;
    vec2 swell = delta * 0.16 * sin(age * 3.14159265);
    field += (pull + swell) * influence;
  }
  vec2 pressDelta = (vUv - uPress) * vec2(aspect, 1.0);
  float pressArea = 1.0 - smoothstep(0.0, 0.38, length(pressDelta));
  field += pressDelta * pressArea * pressArea * uAmount * 1.8;
  field *= uStrength;
  float magnitude = length(field);
  field *= min(1.0, 0.065 / max(magnitude, 0.00001));
  vec2 sampleUV = vUv - field / vec2(aspect, 1.0);
  if (any(lessThan(sampleUV, vec2(0.0))) || any(greaterThan(sampleUV, vec2(1.0)))) {
    fragColor = vec4(0.0);
  } else {
    fragColor = texture(uTextTexture, sampleUV);
  }
}
`;


    function compile(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(message);
      }
      return shader;
    }

    let program;
    try {
      const vs = compile(gl.VERTEX_SHADER, vertex);
      const fs = compile(gl.FRAGMENT_SHADER, fragment);
      program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    } catch (error) {
      console.warn('제목 효과를 초기화하지 못했습니다.', error);
      return;
    }
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 0, 0, 3, -1, 2, 0, -1, 3, 0, 2]), gl.STATIC_DRAW);
    for (const [name, offset] of [['position', 0], ['uv', 8]]) {
      const loc = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 16, offset);
    }
    const uniforms = {};
    for (const name of ['uTextTexture', 'uResolution', 'uTrail[0]', 'uDirection[0]', 'uStrength', 'uRadius', 'uPress', 'uAmount']) {
      uniforms[name] = gl.getUniformLocation(program, name);
    }
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.uniform1i(uniforms.uTextTexture, 0);
    gl.uniform1f(uniforms.uStrength, options.strength);
    gl.uniform1f(uniforms.uRadius, options.radius);

    title.classList.add('hero-warp');
    title.append(canvas);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const raster = document.createElement('canvas');
    const ctx = raster.getContext('2d');
    if (!ctx) return;
    let frame = 0;
    let ready = false, visible = true, lost = false;
    let padding = 0, width = 1, height = 1;
    const hero = title.closest('.hero-cover');
    let held = false, amount = 0, velocity = 0, lastTime = 0;
    let pressX = .5, pressY = .5, activePointer = null, startX = 0, startY = 0, holdTimer = 0;
    const trail = [];
    const trailData = new Float32Array(MAX_TRAIL * 4);
    const directionData = new Float32Array(MAX_TRAIL * 2);

    function render(now = performance.now()) {
      trailData.fill(0);
      directionData.fill(0);
      trail.forEach((point, i) => {
        const age = Math.min(1, (now - point.born) / (options.duration * 1000));
        trailData.set([point.x, point.y, age, point.force], i * 4);
        directionData.set([point.dx, point.dy], i * 2);
      });
      gl.uniform4fv(uniforms['uTrail[0]'], trailData);
      gl.uniform2fv(uniforms['uDirection[0]'], directionData);
      gl.uniform2f(uniforms.uPress, pressX, pressY);
      gl.uniform1f(uniforms.uAmount, amount);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function stop() {
      cancelAnimationFrame(frame);
      frame = 0;
      trail.length = 0;
      clearTimeout(holdTimer); activePointer = null;
      held = false; amount = velocity = lastTime = 0;
      hero.classList.remove('is-pressing');
      title.classList.remove('is-warping');
    }

    function resize() {
      if (lost) return;
      stop();
      const rect = title.getBoundingClientRect();
      const css = getComputedStyle(title);
      const root = parseFloat(getComputedStyle(document.documentElement).fontSize);
      if (!rect.width || !rect.height) return;
      padding = parseFloat(css.fontSize) * 0.25;
      width = rect.width + padding * 2;
      height = rect.height + padding * 2;
      // 고해상도 화면 대응. GPU의 최대 텍스처 크기를 넘지 않게 제한합니다.
      const max = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE), 8192);
      const dpr = Math.min(devicePixelRatio || 1, 2, max / width, max / height);
      canvas.width = raster.width = Math.max(1, Math.round(width * dpr));
      canvas.height = raster.height = Math.max(1, Math.round(height * dpr));
      Object.assign(canvas.style, {
        left: `${-padding / root}rem`, top: `${-padding / root}rem`,
        width: `${width / root}rem`, height: `${height / root}rem`
      });
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      for (const line of lines) {
        const style = getComputedStyle(line);
        const range = document.createRange();
        range.selectNodeContents(line);
        const bounds = range.getBoundingClientRect();
        const text = line.textContent;
        ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        ctx.fillStyle = style.color;
        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'left';
        ctx.fontKerning = style.fontKerning;
        if ('letterSpacing' in ctx) ctx.letterSpacing = style.letterSpacing === 'normal' ? '0px' : style.letterSpacing;
        const metrics = ctx.measureText(text);
        const ascent = metrics.fontBoundingBoxAscent ?? metrics.actualBoundingBoxAscent;
        const descent = metrics.fontBoundingBoxDescent ?? metrics.actualBoundingBoxDescent;
        const y = bounds.top - rect.top + padding + (bounds.height - ascent - descent) / 2 + ascent;
        ctx.fillText(text, bounds.left - rect.left + padding, y);
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, raster);
      gl.uniform2f(uniforms.uResolution, width, height);
      ready = true;
      render();
    }

    function tick(now) {
      frame = 0;
      if (lost || reduced.matches || document.hidden || !visible) { stop(); return; }
      const dt = lastTime ? Math.min((now-lastTime)/16.667,2) : 1;
      lastTime = now;
      velocity = (velocity + ((held ? 1 : 0)-amount)*.075*dt)*Math.pow(.78,dt);
      amount += velocity*dt;
      render(now);
      if (!held && Math.abs(amount)+Math.abs(velocity)<.001) { stop(); return; }
      frame = requestAnimationFrame(tick);
    }
    function begin(x,y) {
      if (!ready || lost || reduced.matches || !visible || document.hidden) return;
      const box=title.getBoundingClientRect();
      pressX=(x-box.left+padding)/width;
      pressY=1-(y-box.top+padding)/height;
      held=true;
      if (!frame) {
        render(); title.classList.add('is-warping'); lastTime=0;
        frame=requestAnimationFrame(tick);
      }
    }
    function release() { clearTimeout(holdTimer); activePointer=null; held=false; hero.classList.remove('is-pressing'); }
    function down(event) {
      if(event.button!==0 || activePointer!==null)return;
      activePointer=event.pointerId; startX=event.clientX; startY=event.clientY;
      const x=event.clientX, y=event.clientY;
      if(event.pointerType==='touch')holdTimer=setTimeout(()=>{hero.classList.add('is-pressing');begin(x,y);},180);
      else {hero.classList.add('is-pressing');begin(x,y);}
    }
    function hover(event) {
      if(event.pointerType!=='mouse')return;
      begin(event.clientX,event.clientY);
    }
    title.addEventListener('pointerenter',hover);
    title.addEventListener('pointermove',hover);
    title.addEventListener('pointerdown',down);
    window.addEventListener('pointermove',event=>{
      if(event.pointerId!==activePointer)return;
      if(event.pointerType==='touch' && Math.hypot(event.clientX-startX,event.clientY-startY)>10)release();
    },{passive:true});
    window.addEventListener('pointerup',event=>{if(event.pointerId===activePointer){release();if(event.pointerType==='mouse' && title.matches(':hover'))hover(event);}});
    window.addEventListener('pointercancel',release);
    window.addEventListener('scroll',release,{passive:true});
    title.addEventListener('pointerleave',event=>{if(event.pointerType==='mouse')release();});
    title.addEventListener('contextmenu',event=>event.preventDefault());
    window.addEventListener('blur', stop);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
    reduced.addEventListener('change', stop);
    canvas.addEventListener('webglcontextlost', () => { lost = true; stop(); });
    new ResizeObserver(resize).observe(title);
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) stop();
    }).observe(title);
    document.fonts.addEventListener('loadingdone', resize);
    resize();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
