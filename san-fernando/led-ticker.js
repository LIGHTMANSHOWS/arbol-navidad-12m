/* Presentation layer for the large LED marquee; physical patch stays in engine.js. */
window.LedTickerLayer={create(group){
let tape,texture;
const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,uniforms:{map:{value:null},width:{value:1},scroll:{value:0},level:{value:1}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:`
precision highp float;
uniform sampler2D map;uniform float width;uniform float scroll;uniform float level;varying vec2 vUv;
void main(){
 float height=vUv.y*10.9;
 float row=(4.5-height)/2.4*56.0;
 if(row<0.0||row>=56.0)discard;
 float angle=fract(vUv.x+0.5)-0.5;
 float column=angle*384.0+scroll+80.0;
 vec2 cell=vec2(column,row);
 vec2 sampleUv=vec2((mod(floor(column),width)+0.5)/width,(floor(row)+0.5)/56.0);
 float ink=texture2D(map,sampleUv).r;
 if(ink<0.5)discard;
 vec2 d=abs(fract(cell)-0.5);
 float led=1.0-smoothstep(0.30,0.49,max(d.x,d.y));
 gl_FragColor=vec4(vec3(1.0)*level,led*0.98);
}`});
const mesh=new THREE.Mesh(new THREE.CylinderGeometry(.065,3.815,10.9,256,1,true),material);mesh.position.y=5.45;mesh.visible=false;mesh.name='large-led-marquee';mesh.renderOrder=2;group.add(mesh);
return {update(state,brightness){
mesh.visible=!!state.active&&!!state.marquee;
if(!mesh.visible)return;
const next=LedBrand.ticker();if(next!==tape){if(texture)texture.dispose();tape=next;const data=new Uint8Array(tape.width*56*4);for(let y=0;y<56;y++)for(let x=0;x<tape.width;x++){const k=(y*tape.width+x)*4;data[k]=data[k+1]=data[k+2]=tape.rows[y][x]?255:0;data[k+3]=255;}
texture=new THREE.DataTexture(data,tape.width,56,THREE.RGBAFormat);texture.minFilter=texture.magFilter=THREE.NearestFilter;texture.needsUpdate=true;material.uniforms.map.value=texture;material.uniforms.width.value=tape.width;}
material.uniforms.scroll.value=state.beat*12;material.uniforms.level.value=state.pulse*brightness;
},dispose(){if(texture)texture.dispose();}};
}};
