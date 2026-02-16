(function(){"use strict";const I=(...t)=>{},M=async()=>chrome.storage.local.get(["letterboxdExport","lastImportAt","overlayEnabled","tmdbApiKey","tmdbCache","letterboxdIndex","letterboxdStats","lb_index_v1","lb_stats_v1"]),et=async t=>{await chrome.storage.local.set(t)},N="a[href^='/title/']",O=["[role='dialog']","[aria-modal='true']","[aria-expanded='true']","[data-uia*='jawbone']","[class*='jawbone']","[data-uia*='preview']","[data-uia*='billboard']","[data-uia*='hero']","[data-uia*='details']"],C=["h1","h2","h3","[data-uia*='title']","[class*='title']","[class*='fallback']","[class*='preview'] [class*='header']"],nt=["video","img","[data-uia*='preview'] video","[data-uia*='preview'] img","[class*='preview'] video","[class*='preview'] img","[data-uia*='player'] video","[data-uia*='hero'] img"],ot=["[data-uia*='controls']","[class*='controls']","[class*='control']","[role='toolbar']"],S=/(S\d+\s*:?\s*E\d+|Season\s*\d+\s*Episode\s*\d+|Episode\s*\d+|\bE\d+\b)/i,L=/(\b\d+\s*(m|min|minutes)\b|\b\d+\s*of\s*\d+\s*(m|min|minutes)\b)/i,it=["[data-uia*='maturity-rating']","[data-uia*='season']","[data-uia*='resolution']","[data-uia*='hd']","[class*='maturity']","[class*='season']","[class*='quality']"],rt=["[data-uia*='genre']","a[href*='/genre/']","[class*='genre']"],A=["h1","h2","h3","h4","[data-uia*='title']","[class*='title']","[class*='headline']","[class*='header']","[class*='name']"],st=/(browse|home|my list|popular)/i,h=t=>{const e=t.getBoundingClientRect();if(e.width===0||e.height===0)return!1;const n=window.getComputedStyle(t);return n.visibility==="hidden"||n.display==="none"||n.opacity==="0"?!1:e.bottom>=0&&e.right>=0&&e.top<=window.innerHeight&&e.left<=window.innerWidth},x=t=>{if(!t)return;const e=t.replace(/\s+/g," ").trim();return e.length?e:void 0},at=t=>{if(!t)return;const e=t.match(/\/title\/(\d+)/);return e==null?void 0:e[1]},_=t=>{if(!t)return;const e=t.match(/(19\d{2}|20\d{2})/);if(!e)return;const n=Number(e[1]);if(!Number.isNaN(n))return n},b=t=>{if(!t)return;let e=t;return e=e.replace(/^\s*S\d+\s*:?\s*E\d+\s*/i,""),e=e.replace(/"[^"]*"/g,n=>{const o=n.replace(/"/g,"");return S.test(o)?"":n}),e=e.replace(/Episode\s*\d+/gi,""),e=e.replace(/\bE\d+\b/gi,""),e=e.replace(L,""),e=e.replace(/\s+of\s+\d+\s*(m|min|minutes)?/gi,""),e=e.replace(/\s+/g," ").trim(),e.length?e:void 0},W=(t,e)=>{const n=t.getAttribute("href")||void 0,o=at(n),r=x(t.getAttribute("aria-label")||t.textContent);return{netflixTitleId:o,titleText:r,href:n,source:e}},P=t=>{for(const e of C){const n=t.querySelector(e);if(n&&h(n)){const o=x(n.textContent);if(o)return o}}},ct=t=>{if(t)for(const e of C){const n=Array.from(t.querySelectorAll(e));for(const o of n){if(!h(o))continue;const r=x(o.textContent);if(!r||S.test(r)||L.test(r))continue;const i=b(r);if(i)return i}}},lt=t=>{if(t){const o=$(t);if(o&&h(o))return o;for(const r of C){const i=t.querySelector(r);if(i&&h(i))return i}}const e=Array.from(document.querySelectorAll(N)).find(h);return e||(Array.from(document.querySelectorAll(C.join(","))).find(h)??null)},V=t=>{if(!t)return null;const e=[];return nt.forEach(n=>{t.querySelectorAll(n).forEach(o=>{h(o)&&e.push(o)})}),e.length?e.reduce((n,o)=>{const r=n.getBoundingClientRect(),i=o.getBoundingClientRect(),s=r.width*r.height;return i.width*i.height>s?o:n}):null},K=t=>{var r;if(!t)return null;const e=[];ot.forEach(i=>{t.querySelectorAll(i).forEach(s=>{h(s)&&e.push(s)})});const o=Array.from(new Set(e)).map(i=>{const s=i.querySelectorAll("button, [role='button']").length,a=i.getBoundingClientRect(),u=s*10+a.width;return{el:i,score:u,top:a.top}}).filter(i=>i.score>0);return o.sort((i,s)=>s.score-i.score||s.top-i.top),((r=o[0])==null?void 0:r.el)??null},dt=t=>{if(!t)return!1;const e=[...it,...rt].join(",");return Array.from(t.querySelectorAll(e)).some(o=>h(o))},ut=t=>{const e=F(),n=window.innerWidth*.85,o=window.innerHeight*.6;for(const r of e){const i=r.getBoundingClientRect();if(i.width>n||i.height>o)continue;const s=V(r),a=K(r),u=dt(r);if(s&&a&&u)return r}return null},R=t=>st.test(t)?!0:S.test(t)||L.test(t)||/\b\d+\s*of\s*\d+\s*(m|min|minutes)?\b/i.test(t)||/\b\d+\s*(m|min|minutes)\b/i.test(t),B=(t,e)=>t.closest('[role="progressbar"], [data-uia*="progress"], [class*="progress"]')?!0:e!==void 0?t.getBoundingClientRect().bottom>=e-8:!1,ft=t=>{const e=t.getBoundingClientRect(),n=K(t),o=n?n.getBoundingClientRect().top:void 0,r=Array.from(t.querySelectorAll(A.join(",")));let i=null,s=0;const a=[];if(r.forEach(l=>{if(!h(l)){s+=1;return}if(B(l,o)){s+=1;return}const d=x(l.textContent);if(!d||d.length<2||d.length>80){s+=1;return}if(R(d)){a.push(l),s+=1;return}const c=l.getBoundingClientRect(),p=window.getComputedStyle(l),g=parseFloat(p.fontSize)||14,m=p.fontWeight==="bold"?700:Number(p.fontWeight),y=Number.isNaN(m)?400:m,Ot=c.left-e.left,Lt=c.top-e.top,_t=Math.hypot(Ot,Lt),tt=g*10+y/10+Math.max(0,300-_t);(!i||tt>i.score)&&(i={el:l,score:tt,text:d})}),i)return{title:b(i.text)??i.text,chosen:i.el,rejectedCount:s};for(const l of a){let d=l.parentElement,c=0;for(;d&&c<4;){const p=Array.from(d.querySelectorAll(A.join(","))).filter(g=>g!==l);for(const g of p){if(!h(g)||B(g,o))continue;const m=x(g.textContent);if(!(!m||m.length<2||m.length>80)&&!R(m))return{title:b(m)??m,chosen:g,rejectedCount:s}}d=d.parentElement,c+=1}}const u=t.querySelector("a[href^='/title/']");if(u){const l=u.querySelector(A.join(",")),d=x((l==null?void 0:l.textContent)||u.textContent);if(d&&!R(d))return{title:b(d)??d,chosen:l??u,rejectedCount:s};let c=u.parentElement,p=0;for(;c&&p<4;){const g=Array.from(c.querySelectorAll(A.join(",")));for(const m of g){if(!h(m)||B(m,o))continue;const y=x(m.textContent);if(!(!y||y.length<2||y.length>80)&&!R(y))return{title:b(y)??y,chosen:m,rejectedCount:s}}c=c.parentElement,p+=1}}return{title:null,rejectedCount:s}},q=(t,e)=>{const n=ct(t);if(n)return n;const o=b(e);if(o&&!S.test(o))return o;if(e)return b(e)??e},$=t=>{const e=Array.from(t.querySelectorAll(N)),n=e.filter(h);return n.length>0?n[0]:e[0]},F=()=>{const t=O.join(","),e=Array.from(document.querySelectorAll(t)),n=e.filter(h),o=window.innerWidth*.85,r=window.innerHeight*.6,i=n.filter(s=>{const a=s.getBoundingClientRect();return!(a.width===0||a.height===0||a.width<240||a.height<180||a.width>o||a.height>r)});return i.length>0?i.sort((s,a)=>{const u=s.getBoundingClientRect(),l=a.getBoundingClientRect();return l.width*l.height-u.width*u.height}):n.length>0?n:e},ht=()=>{const t=F();for(const n of t){const o=$(n);if(o){const i=W(o,"container-anchor");if(i.netflixTitleId||i.titleText){const s=i.titleText??P(n),a=q(n,s??i.titleText);return{candidate:{...i,titleText:a,year:_(a??s)},container:n}}}const r=P(n);if(r){const i=q(n,r);return{candidate:{titleText:i??r,year:_(i??r),source:"container-text"},container:n}}}const e=Array.from(document.querySelectorAll(N)).find(h);if(e){const n=W(e,"page-anchor"),o=q(e.closest(O.join(","))??e.parentElement,n.titleText);return{candidate:{...n,titleText:o??n.titleText,year:_(o??n.titleText)},container:e.closest(O.join(","))??e.parentElement}}return{candidate:null,container:null}},mt="nxlb-top-section",pt=t=>{const e=document.createElement("div");e.id=mt,e.style.display="block",e.style.width="100%",e.style.pointerEvents="none";const n=e.attachShadow({mode:"open"}),o=document.createElement("style");o.textContent=`
    :host {
      all: initial;
      font-family: "Netflix Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
      pointer-events: none;
      display: block;
      width: 100%;
      box-sizing: border-box;
      opacity: 0;
      transform: translateY(-8px);
      transition: opacity 180ms cubic-bezier(0.2, 0, 0, 1),
        transform 180ms cubic-bezier(0.2, 0, 0, 1);
      will-change: opacity, transform;
    }
    :host(.nxl-visible) {
      opacity: 1;
      transform: translateY(0);
    }
    .nxl-top-section {
      background: rgba(0, 0, 0, 0.82);
      color: #f5f5f5;
      padding: 16px 20px;
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: grid;
      gap: 8px;
      box-sizing: border-box;
    }
    .nxl-header {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 16px;
    }
    .nxl-branding {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.85);
      white-space: nowrap;
      flex-shrink: 0;
    }
    .nxl-dots {
      display: inline-flex;
      gap: 4px;
      align-items: center;
    }
    .nxl-dot {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      display: inline-block;
    }
    .nxl-dot.green { background: #00c46a; }
    .nxl-dot.orange { background: #f2b34c; }
    .nxl-dot.blue { background: #4aa8ff; }
    .nxl-body {
      display: grid;
      gap: 6px;
      font-size: 15px;
      color: rgba(255, 255, 255, 0.9);
    }
    .nxl-rating {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .nxl-star {
      color: #e3b341;
      font-size: 16px;
    }
    .nxl-match {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    .nxl-match-value {
      color: #46d369;
      font-weight: 700;
      font-size: 20px;
    }
    .nxl-because {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
    }
  `;const r=document.createElement("div");r.className="nxl-top-section";const i=document.createElement("div");i.className="nxl-header";const s=document.createElement("div");s.className="nxl-branding",s.innerHTML=`
    Powered by
    <span class="nxl-dots">
      <span class="nxl-dot green"></span>
      <span class="nxl-dot orange"></span>
      <span class="nxl-dot blue"></span>
    </span>
    Letterboxd
  `,i.appendChild(s);const a=document.createElement("div");a.className="nxl-body";const u=document.createElement("div");u.className="nxl-rating",u.dataset.field="communityRating",u.textContent="Community rating: —";const l=document.createElement("div");l.className="nxl-match",l.dataset.field="match",l.textContent="Your match: —";const d=document.createElement("div");return d.className="nxl-because",d.dataset.field="because",d.textContent="Because you like: —",a.appendChild(u),a.appendChild(l),a.appendChild(d),r.appendChild(i),r.appendChild(a),n.appendChild(o),n.appendChild(r),e};let D=null,f=null;const gt=t=>t===void 0?"":t>=1e6?`${(t/1e6).toFixed(1)}M`:t>=1e3?`${(t/1e3).toFixed(1)}K`:`${t}`,yt=t=>{var r,i,s;const e=(r=f==null?void 0:f.shadowRoot)==null?void 0:r.querySelector("[data-field='communityRating']");if(e)if(t.communityRating!==void 0){const a=gt(t.ratingCount);e.innerHTML=`
        Community rating:
        <span class="nxl-star">★</span>
        ${t.communityRating.toFixed(1)}${a?` <span class="nxl-meta">${a} ratings</span>`:""}
      `}else e.textContent="Community rating: —";const n=(i=f==null?void 0:f.shadowRoot)==null?void 0:i.querySelector("[data-field='match']");n&&(t.matchScore!==void 0?n.innerHTML=`Your match: <span class="nxl-match-value">${t.matchScore}%</span>`:n.textContent="Your match: —");const o=(s=f==null?void 0:f.shadowRoot)==null?void 0:s.querySelector("[data-field='because']");o&&(o.textContent=t.matchExplanation?`Because you like: ${t.matchExplanation.replace(/^Because you like\\s*/i,"")}`:"Because you like: —")},G=(t,e)=>{const n=D!==t;return n&&(f&&f.remove(),D=t,f=pt(),t.insertBefore(f,t.firstChild),requestAnimationFrame(()=>{f==null||f.classList.add("nxl-visible")})),yt(e),n},E=()=>{f&&f.remove(),D=null,f=null},U="nxlb-debug-badge",j={ctrlKey:!0,shiftKey:!0,key:"l"},xt=250,bt=.85,Et=.6,Tt=t=>{const e=document.getElementById(U);if(!t){e==null||e.remove();return}if(e)return;const n=document.createElement("div");n.id=U,n.style.position="fixed",n.style.bottom="16px",n.style.right="16px",n.style.zIndex="2147483647";const o=n.attachShadow({mode:"open"}),r=document.createElement("style");r.textContent=`
    :host {
      all: initial;
      font-family: "Space Grotesk", sans-serif;
    }
    .badge {
      background: #111;
      color: #f5f5f5;
      border-radius: 999px;
      padding: 6px 10px;
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      border: 1px solid rgba(255, 255, 255, 0.14);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.35);
    }
  `;const i=document.createElement("div");i.className="badge",i.textContent="N×L active",o.appendChild(r),o.appendChild(i),document.documentElement.appendChild(n)};let Y=!0;const X=async t=>{Y=t,t||updateOverlay(null,null),Tt(t)};let z="",k=null,H,J="",T=null;const qt=t=>{var r;if(!t)return"none";const e=[t.tagName.toLowerCase()],n=t.className;n&&e.push("."+n.toString().split(/\s+/).filter(Boolean).slice(0,3).join("."));const o=(r=t.getAttribute)==null?void 0:r.call(t,"data-uia");return o&&e.push(`[data-uia="${o}"]`),e.join("")},wt=()=>window.location.pathname.startsWith("/watch"),vt=()=>Array.from(document.querySelectorAll("video")).some(e=>{const n=e.getBoundingClientRect();if(n.width===0||n.height===0)return!1;const o=n.width/window.innerWidth,r=n.height/window.innerHeight;return o>.85||r>.6}),Ct=()=>Array.from(document.querySelectorAll("h1, h2, h3, [data-uia*='episode'], [class*='episode']")).some(e=>{if(e instanceof HTMLElement){const n=e.getBoundingClientRect();if(n.width===0||n.height===0)return!1;const o=e.textContent??"";return/episode/i.test(o)}return!1}),Q=t=>{if(!t)return!1;const e=t.getBoundingClientRect();return e.width===0||e.height===0?!1:e.width>window.innerWidth*bt||e.height>window.innerHeight*Et},w=t=>{T&&T!==t&&(T.style.outline="",T.style.outlineOffset="",T=null)},St=t=>t?[t.netflixTitleId??"",t.titleText??"",t.year??"",t.href??""].join("|"):"",At=()=>{if(!Y)return;if(wt()){E();return}if(vt()){E();return}if(Ct()){E();return}const{candidate:t,container:e}=ht(),n=V(e),o=ut()??e,r=lt(o??e),i=o==null?void 0:o.querySelector("a[href^='/title/']");if(i){const c=i.getAttribute("href")??void 0,p=c==null?void 0:c.match(/\/title\/(\d+)/);p&&t&&(t.netflixTitleId=p[1]),c&&t&&(t.href=c)}if(!o||!n){E(),w(null);return}if(Q(r)||Q(o)){E(),w(null);return}if(w(o),!t){try{E()}catch{}w(null),z="",k=null;return}const s=ft(o);if(!s.title){E(),w(null);return}const a=s.title,u=St({...t,titleText:a});if(u===z&&o===k)return;z=u,k=o;const l=`req_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;J=l;const d={type:"RESOLVE_TITLE",requestId:l,payload:{netflixTitleId:t.netflixTitleId,titleText:a,year:t.year,href:t.href}};chrome.runtime.sendMessage(d).then(c=>{if((c==null?void 0:c.type)==="TITLE_RESOLVED"&&c.requestId===J)try{const p=G(o,{communityRating:c.payload.tmdbVoteAverage,ratingCount:c.payload.tmdbVoteCount,matchScore:c.payload.matchScore,matchExplanation:c.payload.matchExplanation})}catch{}}).catch(c=>{});try{const c=G(o,{})}catch{}},v=()=>{H&&window.clearTimeout(H),H=window.setTimeout(()=>{At()},xt)},Rt=()=>{new MutationObserver(()=>{try{v()}catch{}}).observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class","style","aria-expanded","aria-hidden"]}),document.addEventListener("pointerover",()=>{try{v()}catch{}},!0),document.addEventListener("focusin",()=>{try{v()}catch{}},!0),v()},It=async()=>{const e=!((await M()).overlayEnabled??!0);await et({overlayEnabled:e}),await X(e),e&&v()},Nt=t=>{t.ctrlKey===j.ctrlKey&&t.shiftKey===j.shiftKey&&t.key.toLowerCase()===j.key&&(t.preventDefault(),It().catch(e=>I("Toggle failed",e)))},Z=async()=>{const e=(await M()).overlayEnabled??!0;await X(e),Rt(),window.addEventListener("keydown",Nt)};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{Z().catch(t=>I("Init failed",t))},{once:!0}):Z().catch(t=>I("Init failed",t))})();
//# sourceMappingURL=index.js.map
