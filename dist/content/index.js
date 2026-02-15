(function(){"use strict";const E=(...e)=>{},B=async()=>chrome.storage.local.get(["letterboxdExport","lastImportAt","overlayEnabled","tmdbApiKey","tmdbCache","letterboxdIndex","letterboxdStats"]),Q=async e=>{await chrome.storage.local.set(e)},L="a[href^='/title/']",z=["[role='dialog']","[aria-modal='true']","[aria-expanded='true']","[data-uia*='preview']","[data-uia*='billboard']","[data-uia*='hero']","[data-uia*='details']"],A=["h1","h2","h3","[data-uia*='title']","[class*='title']","[class*='fallback']","[class*='preview'] [class*='header']"],Z=["video","img","[data-uia*='preview'] video","[data-uia*='preview'] img","[class*='preview'] video","[class*='preview'] img","[data-uia*='player'] video","[data-uia*='hero'] img"],ee=["[data-uia*='maturity-rating']","[data-uia*='season']","[data-uia*='resolution']","[data-uia*='hd']","[class*='maturity']","[class*='season']","[class*='quality']"],te=["[data-uia*='genre']","a[href*='/genre/']","[class*='genre']"],m=e=>{const t=e.getBoundingClientRect();if(t.width===0||t.height===0)return!1;const n=window.getComputedStyle(e);return n.visibility==="hidden"||n.display==="none"||n.opacity==="0"?!1:t.bottom>=0&&t.right>=0&&t.top<=window.innerHeight&&t.left<=window.innerWidth},k=e=>{if(!e)return;const t=e.replace(/\s+/g," ").trim();return t.length?t:void 0},D=(e,t)=>{const n=[];return t.forEach(o=>{e.querySelectorAll(o).forEach(i=>{if(!m(i))return;const l=k(i.textContent);l&&n.push(l)})}),n},ne=e=>{const t=e.toLowerCase();return t.includes("episode")||t.includes("min")?!1:(t.includes("season")||t.includes("hd")||t.includes("tv-"),!0)},oe=e=>{if(!e)return;const t=e.match(/\/title\/(\d+)/);return t==null?void 0:t[1]},R=e=>{if(!e)return;const t=e.match(/(19\d{2}|20\d{2})/);if(!t)return;const n=Number(t[1]);if(!Number.isNaN(n))return n},V=(e,t)=>{const n=e.getAttribute("href")||void 0,o=oe(n),i=k(e.getAttribute("aria-label")||e.textContent);return{netflixTitleId:o,titleText:i,href:n,source:t}},F=e=>{for(const t of A){const n=e.querySelector(t);if(n&&m(n)){const o=k(n.textContent);if(o)return o}}},ae=e=>{if(e){const o=G(e);if(o&&m(o))return o;for(const i of A){const l=e.querySelector(i);if(l&&m(l))return l}}const t=Array.from(document.querySelectorAll(L)).find(m);return t||(Array.from(document.querySelectorAll(A.join(","))).find(m)??null)},ie=e=>{if(!e)return null;for(const t of Z){const n=e.querySelector(t);if(n&&m(n))return n}return null},le=e=>{if(!e)return;const t=D(e,ee).map(o=>o.replace(/\s+/g," ").trim()).filter(o=>o.length>0).filter(ne).filter(o=>o.length<=24),n=Array.from(new Set(t));if(n.length)return n.slice(0,3).join(" • ")},re=e=>{if(!e)return;const t=D(e,te).map(o=>o.replace(/\s+/g," ").trim()).filter(o=>o.length>0).filter(o=>o.length<=24).filter(o=>!/episode|min/i.test(o)),n=Array.from(new Set(t));if(n.length)return n.slice(0,3).join(" • ")},G=e=>{const t=Array.from(e.querySelectorAll(L)),n=t.filter(m);return n.length>0?n[0]:t[0]},se=()=>{const e=z.join(","),t=Array.from(document.querySelectorAll(e)),n=t.filter(m);return n.length>0?n:t},ce=()=>{const e=se();for(const n of e){const o=G(n);if(o){const l=V(o,"container-anchor");if(l.netflixTitleId||l.titleText){const p=l.titleText??F(n);return{candidate:{...l,titleText:p,year:R(p)},container:n}}}const i=F(n);if(i)return{candidate:{titleText:i,year:R(i),source:"container-text"},container:n}}const t=Array.from(document.querySelectorAll(L)).find(m);if(t){const n=V(t,"page-anchor");return{candidate:{...n,year:R(n.titleText)},container:t.closest(z.join(","))??t.parentElement}}return{candidate:null,container:null}},de="nxlb-overlay-panel",pe={y:12},w=new WeakMap,ue=e=>{window.getComputedStyle(e).position==="static"&&(w.has(e)||w.set(e,e instanceof HTMLElement?e.style.position:""),e instanceof HTMLElement&&(e.style.position="relative",e.dataset.nxlbPositioned="true"))},K=e=>{if(!e||!(e instanceof HTMLElement)||!e.dataset.nxlbPositioned)return;const t=w.get(e)??"";e.style.position=t,delete e.dataset.nxlbPositioned,w.delete(e)},me=e=>{const t=document.createElement("div");t.id=de,t.style.position="absolute",t.style.inset="0",t.style.zIndex="2147483647";const n=t.attachShadow({mode:"open"}),o=document.createElement("style");o.textContent=`
    :host {
      all: initial;
      font-family: "Netflix Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
      pointer-events: none;
      --preview-top-px: 240px;
      --preview-bottom-px: 420px;
      --controls-height: 64px;
    }
    .nxl-card {
      position: absolute;
      inset: 0;
      color: #f5f5f5;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.4);
      overflow: hidden;
      animation: nxlFadeIn 150ms ease-out;
    }
    .nxl-shade {
      position: absolute;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.88);
      backdrop-filter: blur(8px);
    }
    .nxl-shade.top {
      top: 0;
      height: var(--preview-top-px);
    }
    .nxl-shade.bottom {
      top: var(--preview-bottom-px);
      bottom: 0;
    }
    .nxl-content {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-rows: auto auto auto auto 1fr auto;
      gap: 12px;
      padding: 20px;
      height: 100%;
      box-sizing: border-box;
    }
    .nxl-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }
    .nxl-title-section {
      max-width: 70%;
    }
    .nxl-title {
      font-size: 30px;
      font-weight: 700;
      letter-spacing: 0.01em;
      line-height: 1.1;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .nxl-meta {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.75);
      margin-top: 6px;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .nxl-genres {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      margin-top: 4px;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .nxl-branding {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
      white-space: nowrap;
    }
    .nxl-dots {
      display: inline-flex;
      gap: 4px;
      align-items: center;
    }
    .nxl-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
    .nxl-dot.green { background: #00c46a; }
    .nxl-dot.orange { background: #f2b34c; }
    .nxl-dot.blue { background: #4aa8ff; }
    .nxl-divider {
      height: 1px;
      width: 100%;
      background: rgba(255, 255, 255, 0.1);
    }
    .nxl-metadata {
      display: grid;
      gap: 8px;
      font-size: 16px;
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
      animation: nxlPop 200ms ease-out;
    }
    .nxl-because {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
    }
    .nxl-preview {
      min-height: 180px;
    }
    .nxl-controls {
      min-height: var(--controls-height);
    }
    .debug {
      margin-top: 4px;
      padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 11px;
      opacity: 0.7;
      display: none;
      white-space: pre-wrap;
    }
    .safe .nxl-shade {
      backdrop-filter: blur(4px);
    }
    @keyframes nxlFadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes nxlPop {
      0% { transform: scale(0.96); }
      100% { transform: scale(1); }
    }
  `;const i=document.createElement("div");i.className="nxl-card";const l=document.createElement("div");l.className="nxl-shade top";const p=document.createElement("div");p.className="nxl-shade bottom";const s=document.createElement("div");s.className="nxl-content";const c=document.createElement("div");c.className="nxl-top";const d=document.createElement("div");d.className="nxl-title-section";const x=document.createElement("div");x.className="nxl-title",x.textContent=e.titleLine;const f=document.createElement("div");f.className="nxl-meta",f.dataset.field="metadata",f.textContent=e.metadataLine??"TV-14 • 2 Seasons • HD";const r=document.createElement("div");r.className="nxl-genres",r.dataset.field="genres",r.textContent=e.genresLine??"Genres",d.appendChild(x),d.appendChild(f),d.appendChild(r);const u=document.createElement("div");u.className="nxl-branding",u.innerHTML=`
    Powered by
    <span class="nxl-dots">
      <span class="nxl-dot green"></span>
      <span class="nxl-dot orange"></span>
      <span class="nxl-dot blue"></span>
    </span>
    Letterboxd
  `,c.appendChild(d),c.appendChild(u);const g=document.createElement("div");g.className="nxl-divider";const h=document.createElement("div");h.className="nxl-metadata";const y=document.createElement("div");y.className="nxl-rating",y.dataset.field="communityRating",y.textContent="Community rating: —";const T=document.createElement("div");T.className="nxl-match",T.dataset.field="match",T.textContent="Your match: —";const S=document.createElement("div");S.className="nxl-because",S.dataset.field="because",S.textContent="Because you like —",h.appendChild(y),h.appendChild(T),h.appendChild(S);const P=document.createElement("div");P.className="nxl-preview",P.dataset.field="preview";const $=document.createElement("div");$.className="nxl-controls",$.dataset.field="controls",s.appendChild(c),s.appendChild(g),s.appendChild(h),s.appendChild(P),s.appendChild($);const _=document.createElement("div");return _.className="debug",_.dataset.field="debug",s.appendChild(_),i.appendChild(l),i.appendChild(p),i.appendChild(s),n.appendChild(o),n.appendChild(i),t};let b=null,a=null,N=null;const j=(e,t)=>{if(!t)return;const n=t.getBoundingClientRect();e.style.position="fixed",e.style.top=`${Math.max(8,n.top-pe.y)}px`,e.style.left=`${Math.max(8,n.left)}px`,e.style.right="auto",e.style.width=`${Math.max(280,n.width)}px`,e.style.height=`${Math.max(220,n.height)}px`},xe=e=>e===void 0?"":e>=1e6?`${(e/1e6).toFixed(1)}M`:e>=1e3?`${(e/1e3).toFixed(1)}K`:`${e}`,Y=e=>{var c,d,x,f,r,u,g;const t=(c=a==null?void 0:a.shadowRoot)==null?void 0:c.querySelector(".nxl-title");t&&(t.textContent=e.titleLine);const n=(d=a==null?void 0:a.shadowRoot)==null?void 0:d.querySelector("[data-field='communityRating']");if(n)if(e.communityRating!==void 0){const h=xe(e.ratingCount);n.innerHTML=`
        Community rating:
        <span class="nxl-star">★</span>
        ${e.communityRating.toFixed(1)}${h?` <span class="nxl-meta">${h} ratings</span>`:""}
      `}else n.textContent="Community rating: —";const o=(x=a==null?void 0:a.shadowRoot)==null?void 0:x.querySelector("[data-field='match']");o&&(e.matchScore!==void 0?o.innerHTML=`Your match: <span class="nxl-match-value">${e.matchScore}%</span>`:o.textContent="Your match: —");const i=(f=a==null?void 0:a.shadowRoot)==null?void 0:f.querySelector("[data-field='because']");i&&(i.textContent=e.matchExplanation??"Because you like —");const l=(r=a==null?void 0:a.shadowRoot)==null?void 0:r.querySelector("[data-field='metadata']");l&&(l.textContent=e.metadataLine??"TV-14 • 2 Seasons • HD");const p=(u=a==null?void 0:a.shadowRoot)==null?void 0:u.querySelector("[data-field='genres']");p&&(p.textContent=e.genresLine??"Genres");const s=(g=a==null?void 0:a.shadowRoot)==null?void 0:g.querySelector("[data-field='debug']");s&&(e.debug?(s.style.display="block",s.textContent=JSON.stringify(e.debug,null,2)):(s.style.display="none",s.textContent=""))},C=(e,t,n=null,o=!1,i)=>{var p,s;if(!t||!e&&!n){a&&a.remove(),K(b),b=null,a=null,N=null;return}if(b!==e||N!==n){if(a&&a.remove(),K(b),b=e,N=n,a=me(t),e){if(ue(e),e.appendChild(a),i){const d=Math.max(120,i.top),x=Math.max(d+80,i.bottom);a.style.setProperty("--preview-top-px",`${d}px`),a.style.setProperty("--preview-bottom-px",`${x}px`),a.style.setProperty("--controls-height",`${i.controlsHeight}px`)}o&&j(a,n??e)}else n&&(document.documentElement.appendChild(a),j(a,n));const c=(p=a.shadowRoot)==null?void 0:p.querySelector(".nxl-card");c&&c.classList.toggle("safe",o),Y(t);return}if(i&&a){const c=Math.max(120,i.top),d=Math.max(c+80,i.bottom);a.style.setProperty("--preview-top-px",`${c}px`),a.style.setProperty("--preview-bottom-px",`${d}px`),a.style.setProperty("--controls-height",`${i.controlsHeight}px`)}const l=(s=a==null?void 0:a.shadowRoot)==null?void 0:s.querySelector(".nxl-card");l&&l.classList.toggle("safe",o),Y(t)},U="nxlb-debug-badge",I={ctrlKey:!0,shiftKey:!0,key:"l"},fe=250,he=e=>{const t=document.getElementById(U);if(!e){t==null||t.remove();return}if(t)return;const n=document.createElement("div");n.id=U,n.style.position="fixed",n.style.bottom="16px",n.style.right="16px",n.style.zIndex="2147483647";const o=n.attachShadow({mode:"open"}),i=document.createElement("style");i.textContent=`
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
  `;const l=document.createElement("div");l.className="badge",l.textContent="N×L active",o.appendChild(i),o.appendChild(l),document.documentElement.appendChild(n)};let W=!0;const H=async e=>{W=e,e||C(null,null),he(e)};let M="",O=null,q,J="";const ge=e=>e?[e.netflixTitleId??"",e.titleText??"",e.year??"",e.href??""].join("|"):"",ye=()=>{if(!W)return;const{candidate:e,container:t}=ce(),n=ae(t),o=ie(t),i=le(t),l=re(t),p=(()=>{if(!t||!o)return;const r=t.getBoundingClientRect(),u=o.getBoundingClientRect();if(r.height===0)return;const g=Math.max(0,u.top-r.top),h=Math.max(0,u.bottom-r.top),y=Math.max(0,r.bottom-u.bottom);return{top:g,bottom:h,containerHeight:r.height,previewHeight:Math.max(0,u.height),controlsHeight:y}})(),s=!t||!o,c=ge(e);if(!e){try{C(null,null)}catch{}M="",O=null;return}if(c===M&&t===O)return;M=c,O=t,E("Active title changed",{...e,at:new Date().toISOString()});const d=`req_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;J=d;const x={type:"RESOLVE_TITLE",requestId:d,payload:{netflixTitleId:e.netflixTitleId,titleText:e.titleText,year:e.year,href:e.href}};chrome.runtime.sendMessage(x).then(r=>{if((r==null?void 0:r.type)==="TITLE_RESOLVED"&&r.requestId===J)try{C(t,{titleLine:f,metadataLine:i,genresLine:l,communityRating:r.payload.tmdbVoteAverage,ratingCount:r.payload.tmdbVoteCount,inWatchlist:r.payload.inWatchlist,userRating:r.payload.userRating,matchScore:r.payload.matchScore,matchExplanation:r.payload.matchExplanation,debug:void 0},n,s,p)}catch{}}).catch(r=>{});const f=e.titleText?e.year?`${e.titleText} (${e.year})`:e.titleText:"Unknown title";try{C(t,{titleLine:f,metadataLine:i,genresLine:l,debug:void 0},n,s,p)}catch{}},v=()=>{q&&window.clearTimeout(q),q=window.setTimeout(()=>{ye()},fe)},be=()=>{new MutationObserver(()=>{try{v()}catch{}}).observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class","style","aria-expanded","aria-hidden"]}),document.addEventListener("pointerover",()=>{try{v()}catch{}},!0),document.addEventListener("focusin",()=>{try{v()}catch{}},!0),v()},ve=async()=>{const t=!((await B()).overlayEnabled??!0);await Q({overlayEnabled:t}),await H(t),t&&v()},Ee=e=>{e.ctrlKey===I.ctrlKey&&e.shiftKey===I.shiftKey&&e.key.toLowerCase()===I.key&&(e.preventDefault(),ve().catch(t=>E("Toggle failed",t)))},X=async()=>{const t=(await B()).overlayEnabled??!0;await H(t),be(),window.addEventListener("keydown",Ee)};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{X().catch(e=>E("Init failed",e))},{once:!0}):X().catch(e=>E("Init failed",e))})();
//# sourceMappingURL=index.js.map
