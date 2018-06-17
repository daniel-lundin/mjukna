var mjukna=function(){"use strict";function t(e,n,o,i){e.forEach((e,r)=>{Array.isArray(e)?t(e,n[r],o[r],i):o[r]=e+(n[r]-e)*i})}function e(e,n){const o=e.tension||.8,i=e.deceleration||.8,r=e.friction||1;let c=e.initialVelocity||0;const{from:s,to:a}=e,l=function t(e){return e.map(e=>Array.isArray(e)?t(e):e)}(e.from);let u=0;const d=()=>{if(n.isStopped())return;if(c+=(1-u)*o*r,u+=c*=i,Math.abs(u-1)<.001&&Math.abs(c)<.001)return t(s,a,l,1),e.update(a),void(e.done&&e.done());t(s,a,l,u),e.update(l),n(d)};n(d)}function n(t){const n={stopped:!1},o=t=>{n.stopped||window.requestAnimationFrame(t)};return o.isStopped=(()=>n.stopped),e(t,o),()=>{n.stopped=!0}}function o(t,e,n){return n[0]=t[0]*e[0]+t[1]*e[4]+t[2]*e[8]+t[3]*e[12],n[1]=t[0]*e[1]+t[1]*e[5]+t[2]*e[9]+t[3]*e[13],n[2]=t[0]*e[2]+t[1]*e[6]+t[2]*e[10]+t[3]*e[14],n[3]=t[0]*e[3]+t[1]*e[7]+t[2]*e[11]+t[3]*e[15],n[4]=t[4]*e[0]+t[5]*e[4]+t[6]*e[8]+t[7]*e[12],n[5]=t[4]*e[1]+t[5]*e[5]+t[6]*e[9]+t[7]*e[13],n[6]=t[4]*e[2]+t[5]*e[6]+t[6]*e[10]+t[7]*e[14],n[7]=t[4]*e[3]+t[5]*e[7]+t[6]*e[11]+t[7]*e[15],n[8]=t[8]*e[0]+t[9]*e[4]+t[10]*e[8]+t[11]*e[12],n[9]=t[8]*e[1]+t[9]*e[5]+t[10]*e[9]+t[11]*e[13],n[10]=t[8]*e[2]+t[9]*e[6]+t[10]*e[10]+t[11]*e[14],n[11]=t[8]*e[3]+t[9]*e[7]+t[10]*e[11]+t[11]*e[15],n[12]=t[12]*e[0]+t[13]*e[4]+t[14]*e[8]+t[15]*e[12],n[13]=t[12]*e[1]+t[13]*e[5]+t[14]*e[9]+t[15]*e[13],n[14]=t[12]*e[2]+t[13]*e[6]+t[14]*e[10]+t[15]*e[14],n[15]=t[12]*e[3]+t[13]*e[7]+t[14]*e[11]+t[15]*e[15],n}function i(t){t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=1,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=1,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1}function r(t,e){e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[8]=t[8],e[9]=t[9],e[10]=t[10],e[11]=t[11],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15]}const c=new Float32Array(16),s=new Float32Array(16);function a(t){for(var e="matrix3d(",n=0;n<15;++n)e+=t[n].toFixed(10)+",";return e+=t[15].toFixed(10)+")"}function l(t){i(t)}function u(t,e=0,n=0,i=0){r(t,c),function(t,e,n,o){t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=1,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=1,t[11]=0,t[12]=e,t[13]=n,t[14]=o,t[15]=1}(s,e,n,i),o(s,c,t)}function d(t,e,n){r(t,c),function(t,e,n){t[0]=e,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=n,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=1,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1}(s,e,n),o(s,c,t)}let f,p=[];const m=(i(h=new Float32Array(16)),h);var h;const y={childList:!0,subtree:!0,attributes:!0},g=.1,w=.65;let x=[],v=()=>{};function A(){f||(f=new MutationObserver(t=>{f.disconnect();const[e,n]=t.filter(({type:t})=>"childList"===t).reduce(([t,e],n)=>[t.concat(Array.from(n.addedNodes)),e.concat(Array.from(n.removedNodes))],[[],[]]),[o,i]=p.reduce(([t,e],o)=>{const i=o.getElement();return n.find(t=>t===i)?[t,e.concat(o)]:[t.concat(o),e]},[[],[]]),r=e.filter(t=>!p.find(e=>t===e.getElement()));r.forEach(b),i.forEach(P),function(t){const e=function t(e,n=[]){return e.forEach(e=>{n.push(e),t(e.children,n)}),n}(function t(e){return e.map(e=>{const{previousPosition:n}=e,o=e.element.getBoundingClientRect(),i={x:n.width/o.width,y:n.height/o.height};return e.newPosition=e.parent?E(e.parent.newPosition,o):o,e.parentScale=e.parent?function(t,e){return{x:e.x*t.x,y:e.y*t.y}}(e.parent.scale,e.parent.parentScale):{x:1,y:1},e.scale=i,e.previousPosition=e.parent?E(e.parent.previousPosition,n):n,e.children=t(e.children),e})}(t.map(t=>Object.assign(t,{mjuk:t,element:t.getElement()})).reduce((t,e)=>(function t(e,n,o){n.element.style.transform="";const i=e.find(t=>t.element.contains(n.element));if(i)return e.map(e=>e===i?Object.assign(e,{parent:o,children:t(i.children,n,i)}):e);{const t=e.filter(t=>n.element.contains(t.element)),i=e.filter(t=>!n.element.contains(t.element)),r=Object.assign(n,{parent:o,children:t});return function(t,e){t.forEach(t=>{t.parent=e})}(r.children,r),[...i,r]}})(t,e),[]))).map(B);p=[],Promise.all(e).then(v)}(o)})),f.observe(document,y)}function b(t){t.style.opacity=0,t.style.transform="scale(0.4)",n({from:[0,.4],to:[1,1],update:([e,n])=>{t.style.opacity=e,t.style.transform=`scale(${n})`},done(){t.style.opacity=1,t.style.transform=""},tension:g,deceleration:w})}function P(t){const{previousPosition:e}=t,o=t.getElement();document.body.appendChild(o),o.style.position="absolute";const i=o.getBoundingClientRect(),r=i.left-e.left,c=i.top-e.top;o.style.transform=`translate(${-r}px, ${-c}px)`,n({from:[1,1],to:[.3,0],update([t,e]){o.style.transform=`translate(${-r}px, ${-c}px) scale(${t})`,o.style.opacity=e},done(){document.body.removeChild(o)},tension:g,deceleration:w})}const E=(t,e)=>({left:e.left-t.left,top:e.top-t.top,width:e.width,height:e.height});function B(t,e){const{parentScale:o,element:i,previousPosition:r,newPosition:c,config:{tension:s,deceleration:f,staggerBy:p}}=t,h=r.left+r.width/2-(c.left+c.width/2),y=r.top+r.height/2-(c.top+c.height/2),g=t.scale.x,w=t.scale.y,v=c.left+c.width/2,A=c.top+c.height/2;l(m),u(m,-v,-A),d(m,1/o.x,1/o.y),u(m,v,A),u(m,h,y),d(m,g,w),i.style.transform=a(m);const b=[i,void 0,()=>{}];x.push(b);const P=0===p?t=>t():t=>setTimeout(t,e*p);return new Promise(t=>{b[1]=P(()=>{b[2]=n({from:[h,y,g,w,o.x,o.y],to:[0,0,1,1,1,1],update([t,e,n,o,r,c]){l(m),u(m,-v,-A),d(m,1/r,1/c),u(m,v,A),u(m,t,e),d(m,n,o),i.style.transform=a(m)},done(){i.style.transform="",t()},tension:s,deceleration:f})})})}return function(t,{tension:e=g,deceleration:n=w,staggerBy:o=0,enterAnimation:i=!1,exitAnimation:r=!1}={}){return A(),new Promise(c=>{v=c,[].concat(t).forEach(t=>{const c=t.anchor?t.element:()=>t;x=x.filter(([t,e,n])=>(t===c()&&(clearInterval(e),n()),t!==c()));const s={getElement:c,config:{tension:e,deceleration:n,staggerBy:o,enterAnimation:i,exitAnimation:r},previousPosition:t.anchor?t.anchor().getBoundingClientRect():c().getBoundingClientRect(),stop:()=>{}};p.push(s)})})}}();