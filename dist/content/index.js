(function(){"use strict";const w=(...t)=>{},F=async()=>chrome.storage.local.get(["letterboxdExport","lastImportAt","overlayEnabled","tmdbApiKey","tmdbCache","letterboxdIndex","letterboxdStats"]),tt=async t=>{await chrome.storage.local.set(t)},R="a[href^='/title/']",k=["[role='dialog']","[aria-modal='true']","[aria-expanded='true']","[data-uia*='preview']","[data-uia*='billboard']","[data-uia*='hero']","[data-uia*='details']"],C=["h1","h2","h3","[data-uia*='title']","[class*='title']","[class*='fallback']","[class*='preview'] [class*='header']"],et=["video","img","[data-uia*='preview'] video","[data-uia*='preview'] img","[class*='preview'] video","[class*='preview'] img","[data-uia*='player'] video","[data-uia*='hero'] img"],N=/(S\\d+\\s*:?\\s*E\\d+|Episode\\s*\\d+|\\bE\\d+\\b)/i,nt=["[data-uia*='maturity-rating']","[data-uia*='season']","[data-uia*='resolution']","[data-uia*='hd']","[class*='maturity']","[class*='season']","[class*='quality']"],ot=["[data-uia*='genre']","a[href*='/genre/']","[class*='genre']"],p=t=>{const e=t.getBoundingClientRect();if(e.width===0||e.height===0)return!1;const n=window.getComputedStyle(t);return n.visibility==="hidden"||n.display==="none"||n.opacity==="0"?!1:e.bottom>=0&&e.right>=0&&e.top<=window.innerHeight&&e.left<=window.innerWidth},T=t=>{if(!t)return;const e=t.replace(/\s+/g," ").trim();return e.length?e:void 0},V=(t,e)=>{const n=[];return e.forEach(o=>{t.querySelectorAll(o).forEach(i=>{if(!p(i))return;const l=T(i.textContent);l&&n.push(l)})}),n},it=t=>{const e=t.toLowerCase();return e.includes("episode")||e.includes("min")?!1:(e.includes("season")||e.includes("hd")||e.includes("tv-"),!0)},at=t=>{if(!t)return;const e=t.match(/\/title\/(\d+)/);return e==null?void 0:e[1]},I=t=>{if(!t)return;const e=t.match(/(19\d{2}|20\d{2})/);if(!e)return;const n=Number(e[1]);if(!Number.isNaN(n))return n},G=(t,e)=>{const n=t.getAttribute("href")||void 0,o=at(n),i=T(t.getAttribute("aria-label")||t.textContent);return{netflixTitleId:o,titleText:i,href:n,source:e}},K=t=>{for(const e of C){const n=t.querySelector(e);if(n&&p(n)){const o=T(n.textContent);if(o)return o}}},lt=t=>{if(t)for(const e of C){const n=Array.from(t.querySelectorAll(e));for(const o of n){if(!p(o))continue;const i=T(o.textContent);if(i&&!N.test(i))return i}}},rt=t=>{if(t){const o=j(t);if(o&&p(o))return o;for(const i of C){const l=t.querySelector(i);if(l&&p(l))return l}}const e=Array.from(document.querySelectorAll(R)).find(p);return e||(Array.from(document.querySelectorAll(C.join(","))).find(p)??null)},st=t=>{if(!t)return null;const e=[];return et.forEach(n=>{t.querySelectorAll(n).forEach(o=>{p(o)&&e.push(o)})}),e.length?e.reduce((n,o)=>{const i=n.getBoundingClientRect(),l=o.getBoundingClientRect(),c=i.width*i.height;return l.width*l.height>c?o:n}):null},ct=t=>{if(!t)return;const e=V(t,nt).map(o=>o.replace(/\s+/g," ").trim()).filter(o=>o.length>0).filter(it).filter(o=>o.length<=24),n=Array.from(new Set(e));if(n.length)return n.slice(0,3).join(" • ")},dt=t=>{if(!t)return;const e=V(t,ot).map(o=>o.replace(/\s+/g," ").trim()).filter(o=>o.length>0).filter(o=>o.length<=24).filter(o=>!/episode|min/i.test(o)),n=Array.from(new Set(e));if(n.length)return n.slice(0,3).join(" • ")},M=(t,e)=>{const n=e?e.replace(N,"").trim():void 0;if(n&&!N.test(n))return n;const o=lt(t);if(o)return o;if(e)return e},ut=(t,e)=>{const n=new Set,o=c=>{let r=c,d=0;for(;r&&d<7;)n.add(r),r=r.parentElement,d+=1};o(t),o(e);let i=null,l=0;return n.forEach(c=>{if(!p(c))return;const r=c.getBoundingClientRect(),d=r.width*r.height;d>l&&r.width>240&&r.height>180&&(i=c,l=d)}),i??t??e??null},j=t=>{const e=Array.from(t.querySelectorAll(R)),n=e.filter(p);return n.length>0?n[0]:e[0]},pt=()=>{const t=k.join(","),e=Array.from(document.querySelectorAll(t)),n=e.filter(p);return n.length>0?n:e},mt=()=>{const t=pt();for(const n of t){const o=j(n);if(o){const l=G(o,"container-anchor");if(l.netflixTitleId||l.titleText){const c=l.titleText??K(n),r=M(n,c??l.titleText);return{candidate:{...l,titleText:r,year:I(r??c)},container:n}}}const i=K(n);if(i){const l=M(n,i);return{candidate:{titleText:l??i,year:I(l??i),source:"container-text"},container:n}}}const e=Array.from(document.querySelectorAll(R)).find(p);if(e){const n=G(e,"page-anchor"),o=M(e.closest(k.join(","))??e.parentElement,n.titleText);return{candidate:{...n,titleText:o??n.titleText,year:I(o??n.titleText)},container:e.closest(k.join(","))??e.parentElement}}return{candidate:null,container:null}},xt="nxlb-overlay-panel",ft={y:12},S=new WeakMap,ht=t=>{window.getComputedStyle(t).position==="static"&&(S.has(t)||S.set(t,t instanceof HTMLElement?t.style.position:""),t instanceof HTMLElement&&(t.style.position="relative",t.dataset.nxlbPositioned="true"))},Y=t=>{if(!t||!(t instanceof HTMLElement)||!t.dataset.nxlbPositioned)return;const e=S.get(t)??"";t.style.position=e,delete t.dataset.nxlbPositioned,S.delete(t)},gt=t=>{const e=document.createElement("div");e.id=xt,e.style.position="absolute",e.style.inset="0",e.style.zIndex="2147483647";const n=e.attachShadow({mode:"open"}),o=document.createElement("style");o.textContent=`
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
      flex: 1;
      min-width: 0;
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
  `;const i=document.createElement("div");i.className="nxl-card";const l=document.createElement("div");l.className="nxl-shade top";const c=document.createElement("div");c.className="nxl-shade bottom";const r=document.createElement("div");r.className="nxl-content";const d=document.createElement("div");d.className="nxl-top";const u=document.createElement("div");u.className="nxl-title-section";const m=document.createElement("div");m.className="nxl-title",m.textContent=t.titleLine;const g=document.createElement("div");g.className="nxl-meta",g.dataset.field="metadata",g.textContent=t.metadataLine??"TV-14 • 2 Seasons • HD";const f=document.createElement("div");f.className="nxl-genres",f.dataset.field="genres",f.textContent=t.genresLine??"Genres",u.appendChild(m),u.appendChild(g),u.appendChild(f);const s=document.createElement("div");s.className="nxl-branding",s.innerHTML=`
    Powered by
    <span class="nxl-dots">
      <span class="nxl-dot green"></span>
      <span class="nxl-dot orange"></span>
      <span class="nxl-dot blue"></span>
    </span>
    Letterboxd
  `,d.appendChild(u),d.appendChild(s);const x=document.createElement("div");x.className="nxl-divider";const h=document.createElement("div");h.className="nxl-metadata";const y=document.createElement("div");y.className="nxl-rating",y.dataset.field="communityRating",y.textContent="Community rating: —";const b=document.createElement("div");b.className="nxl-match",b.dataset.field="match",b.textContent="Your match: —";const A=document.createElement("div");A.className="nxl-because",A.dataset.field="because",A.textContent="Because you like —",h.appendChild(y),h.appendChild(b),h.appendChild(A);const _=document.createElement("div");_.className="nxl-preview",_.dataset.field="preview";const z=document.createElement("div");z.className="nxl-controls",z.dataset.field="controls",r.appendChild(d),r.appendChild(x),r.appendChild(h),r.appendChild(_),r.appendChild(z);const D=document.createElement("div");return D.className="debug",D.dataset.field="debug",r.appendChild(D),i.appendChild(l),i.appendChild(c),i.appendChild(r),n.appendChild(o),n.appendChild(i),e};let v=null,a=null,O=null;const U=(t,e)=>{if(!e)return;const n=e.getBoundingClientRect();t.style.position="fixed",t.style.top=`${Math.max(8,n.top-ft.y)}px`,t.style.left=`${Math.max(8,n.left)}px`,t.style.right="auto",t.style.width=`${Math.max(280,n.width)}px`,t.style.height=`${Math.max(220,n.height)}px`},yt=t=>t===void 0?"":t>=1e6?`${(t/1e6).toFixed(1)}M`:t>=1e3?`${(t/1e3).toFixed(1)}K`:`${t}`,W=t=>{var d,u,m,g,f,s,x;const e=(d=a==null?void 0:a.shadowRoot)==null?void 0:d.querySelector(".nxl-title");e&&(e.textContent=t.titleLine);const n=(u=a==null?void 0:a.shadowRoot)==null?void 0:u.querySelector("[data-field='communityRating']");if(n)if(t.communityRating!==void 0){const h=yt(t.ratingCount);n.innerHTML=`
        Community rating:
        <span class="nxl-star">★</span>
        ${t.communityRating.toFixed(1)}${h?` <span class="nxl-meta">${h} ratings</span>`:""}
      `}else n.textContent="Community rating: —";const o=(m=a==null?void 0:a.shadowRoot)==null?void 0:m.querySelector("[data-field='match']");o&&(t.matchScore!==void 0?o.innerHTML=`Your match: <span class="nxl-match-value">${t.matchScore}%</span>`:o.textContent="Your match: —");const i=(g=a==null?void 0:a.shadowRoot)==null?void 0:g.querySelector("[data-field='because']");i&&(i.textContent=t.matchExplanation??"Because you like —");const l=(f=a==null?void 0:a.shadowRoot)==null?void 0:f.querySelector("[data-field='metadata']");l&&(t.metadataLine?(l.style.display="block",l.textContent=t.metadataLine):(l.style.display="none",l.textContent=""));const c=(s=a==null?void 0:a.shadowRoot)==null?void 0:s.querySelector("[data-field='genres']");c&&(t.genresLine?(c.style.display="block",c.textContent=t.genresLine):(c.style.display="none",c.textContent=""));const r=(x=a==null?void 0:a.shadowRoot)==null?void 0:x.querySelector("[data-field='debug']");r&&(t.debug?(r.style.display="block",r.textContent=JSON.stringify(t.debug,null,2)):(r.style.display="none",r.textContent=""))},L=(t,e,n=null,o=!1,i)=>{var c,r;if(!e||!t&&!n){a&&a.remove(),Y(v),v=null,a=null,O=null;return}if(v!==t||O!==n){if(a&&a.remove(),Y(v),v=t,O=n,a=gt(e),t){if(ht(t),t.appendChild(a),i){const u=Math.max(160,i.top-8),m=Math.max(u+Math.max(120,i.previewHeight),i.bottom+8);a.style.setProperty("--preview-top-px",`${u}px`),a.style.setProperty("--preview-bottom-px",`${m}px`),a.style.setProperty("--controls-height",`${i.controlsHeight}px`)}o&&U(a,n??t)}else n&&(document.documentElement.appendChild(a),U(a,n));const d=(c=a.shadowRoot)==null?void 0:c.querySelector(".nxl-card");d&&d.classList.toggle("safe",o),W(e);return}if(i&&a){const d=Math.max(160,i.top-8),u=Math.max(d+Math.max(120,i.previewHeight),i.bottom+8);a.style.setProperty("--preview-top-px",`${d}px`),a.style.setProperty("--preview-bottom-px",`${u}px`),a.style.setProperty("--controls-height",`${i.controlsHeight}px`)}const l=(r=a==null?void 0:a.shadowRoot)==null?void 0:r.querySelector(".nxl-card");l&&l.classList.toggle("safe",o),W(e)},H="nxlb-debug-badge",q={ctrlKey:!0,shiftKey:!0,key:"l"},bt=250,vt=t=>{const e=document.getElementById(H);if(!t){e==null||e.remove();return}if(e)return;const n=document.createElement("div");n.id=H,n.style.position="fixed",n.style.bottom="16px",n.style.right="16px",n.style.zIndex="2147483647";const o=n.attachShadow({mode:"open"}),i=document.createElement("style");i.textContent=`
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
  `;const l=document.createElement("div");l.className="badge",l.textContent="N×L active",o.appendChild(i),o.appendChild(l),document.documentElement.appendChild(n)};let J=!0;const X=async t=>{J=t,t||L(null,null),vt(t)};let P="",$=null,B,Q="";const Et=t=>t?[t.netflixTitleId??"",t.titleText??"",t.year??"",t.href??""].join("|"):"",wt=()=>{if(!J)return;const{candidate:t,container:e}=mt(),n=st(e),o=ut(e,n),i=rt(o??e),l=ct(o??e),c=dt(o??e),r=(()=>{if(!o||!n)return;const s=o.getBoundingClientRect(),x=n.getBoundingClientRect();if(s.height===0)return;const h=Math.max(0,x.top-s.top),y=Math.max(0,x.bottom-s.top),b=Math.max(0,s.bottom-x.bottom);return{top:h,bottom:y,containerHeight:s.height,previewHeight:Math.max(0,x.height),controlsHeight:b}})(),d=!o||!n,u=Et(t);if(!t){try{L(null,null)}catch{}P="",$=null;return}if(u===P&&o===$)return;P=u,$=o,w("Active title changed",{...t,at:new Date().toISOString()});const m=`req_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;Q=m;const g={type:"RESOLVE_TITLE",requestId:m,payload:{netflixTitleId:t.netflixTitleId,titleText:t.titleText,year:t.year,href:t.href}};chrome.runtime.sendMessage(g).then(s=>{if((s==null?void 0:s.type)==="TITLE_RESOLVED"&&s.requestId===Q)try{L(o,{titleLine:f,metadataLine:l,genresLine:c,communityRating:s.payload.tmdbVoteAverage,ratingCount:s.payload.tmdbVoteCount,inWatchlist:s.payload.inWatchlist,userRating:s.payload.userRating,matchScore:s.payload.matchScore,matchExplanation:s.payload.matchExplanation,debug:void 0},i,d,r)}catch{}}).catch(s=>{});const f=t.titleText?t.year?`${t.titleText} (${t.year})`:t.titleText:"Unknown title";try{L(o,{titleLine:f,metadataLine:l,genresLine:c,debug:void 0},i,d,r)}catch{}},E=()=>{B&&window.clearTimeout(B),B=window.setTimeout(()=>{wt()},bt)},Ct=()=>{new MutationObserver(()=>{try{E()}catch{}}).observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class","style","aria-expanded","aria-hidden"]}),document.addEventListener("pointerover",()=>{try{E()}catch{}},!0),document.addEventListener("focusin",()=>{try{E()}catch{}},!0),E()},Tt=async()=>{const e=!((await F()).overlayEnabled??!0);await tt({overlayEnabled:e}),await X(e),e&&E()},St=t=>{t.ctrlKey===q.ctrlKey&&t.shiftKey===q.shiftKey&&t.key.toLowerCase()===q.key&&(t.preventDefault(),Tt().catch(e=>w("Toggle failed",e)))},Z=async()=>{const e=(await F()).overlayEnabled??!0;await X(e),Ct(),window.addEventListener("keydown",St)};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{Z().catch(t=>w("Init failed",t))},{once:!0}):Z().catch(t=>w("Init failed",t))})();
//# sourceMappingURL=index.js.map
