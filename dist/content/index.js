(function(){"use strict";const E=(...t)=>{},P=async()=>chrome.storage.local.get(["letterboxdExport","lastImportAt","overlayEnabled","tmdbApiKey","tmdbCache","letterboxdIndex","letterboxdStats"]),W=async t=>{await chrome.storage.local.set(t)},T="a[href^='/title/']",$=["[role='dialog']","[aria-modal='true']","[aria-expanded='true']","[data-uia*='preview']","[data-uia*='billboard']","[data-uia*='hero']","[data-uia*='details']"],S=["h1","h2","h3","[data-uia*='title']","[class*='title']","[class*='fallback']","[class*='preview'] [class*='header']"],J=["video","img","[data-uia*='preview'] video","[data-uia*='preview'] img","[class*='preview'] video","[class*='preview'] img","[data-uia*='player'] video","[data-uia*='hero'] img"],X=["[data-uia*='maturity-rating']","[data-uia*='season']","[data-uia*='resolution']","[data-uia*='hd']","[class*='maturity']","[class*='season']","[class*='quality']"],Q=["[data-uia*='genre']","a[href*='/genre/']","[class*='genre']"],u=t=>{const e=t.getBoundingClientRect();if(e.width===0||e.height===0)return!1;const n=window.getComputedStyle(t);return n.visibility==="hidden"||n.display==="none"||n.opacity==="0"?!1:e.bottom>=0&&e.right>=0&&e.top<=window.innerHeight&&e.left<=window.innerWidth},L=t=>{if(!t)return;const e=t.replace(/\s+/g," ").trim();return e.length?e:void 0},_=(t,e)=>{const n=[];return e.forEach(o=>{t.querySelectorAll(o).forEach(a=>{if(!u(a))return;const r=L(a.textContent);r&&n.push(r)})}),n},Z=t=>{const e=t.toLowerCase();return e.includes("episode")||e.includes("min")?!1:(e.includes("season")||e.includes("hd")||e.includes("tv-"),!0)},tt=t=>{if(!t)return;const e=t.match(/\/title\/(\d+)/);return e==null?void 0:e[1]},A=t=>{if(!t)return;const e=t.match(/(19\d{2}|20\d{2})/);if(!e)return;const n=Number(e[1]);if(!Number.isNaN(n))return n},B=(t,e)=>{const n=t.getAttribute("href")||void 0,o=tt(n),a=L(t.getAttribute("aria-label")||t.textContent);return{netflixTitleId:o,titleText:a,href:n,source:e}},D=t=>{for(const e of S){const n=t.querySelector(e);if(n&&u(n)){const o=L(n.textContent);if(o)return o}}},et=t=>{if(t){const o=z(t);if(o&&u(o))return o;for(const a of S){const r=t.querySelector(a);if(r&&u(r))return r}}const e=Array.from(document.querySelectorAll(T)).find(u);return e||(Array.from(document.querySelectorAll(S.join(","))).find(u)??null)},nt=t=>{if(!t)return null;for(const e of J){const n=t.querySelector(e);if(n&&u(n))return n}return null},at=t=>{if(!t)return;const e=_(t,X).map(o=>o.replace(/\s+/g," ").trim()).filter(o=>o.length>0).filter(Z),n=Array.from(new Set(e));if(n.length)return n.slice(0,3).join(" • ")},ot=t=>{if(!t)return;const e=_(t,Q).map(o=>o.replace(/\s+/g," ").trim()).filter(o=>o.length>0).filter(o=>!/episode|min/i.test(o)),n=Array.from(new Set(e));if(n.length)return n.slice(0,3).join(" • ")},z=t=>{const e=Array.from(t.querySelectorAll(T)),n=e.filter(u);return n.length>0?n[0]:e[0]},it=()=>{const t=$.join(","),e=Array.from(document.querySelectorAll(t)),n=e.filter(u);return n.length>0?n:e},rt=()=>{const t=it();for(const n of t){const o=z(n);if(o){const r=B(o,"container-anchor");if(r.netflixTitleId||r.titleText){const s=r.titleText??D(n);return{candidate:{...r,titleText:s,year:A(s)},container:n}}}const a=D(n);if(a)return{candidate:{titleText:a,year:A(a),source:"container-text"},container:n}}const e=Array.from(document.querySelectorAll(T)).find(u);if(e){const n=B(e,"page-anchor");return{candidate:{...n,year:A(n.titleText)},container:e.closest($.join(","))??e.parentElement}}return{candidate:null,container:null}},lt="nxlb-overlay-panel",st={y:12},w=new WeakMap,ct=t=>{window.getComputedStyle(t).position==="static"&&(w.has(t)||w.set(t,t instanceof HTMLElement?t.style.position:""),t instanceof HTMLElement&&(t.style.position="relative",t.dataset.nxlbPositioned="true"))},V=t=>{if(!t||!(t instanceof HTMLElement)||!t.dataset.nxlbPositioned)return;const e=w.get(t)??"";t.style.position=e,delete t.dataset.nxlbPositioned,w.delete(t)},dt=t=>{const e=document.createElement("div");e.id=lt,e.style.position="absolute",e.style.inset="0",e.style.zIndex="2147483647";const n=e.attachShadow({mode:"open"}),o=document.createElement("style");o.textContent=`
    :host {
      all: initial;
      font-family: "Netflix Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
      pointer-events: none;
      --preview-top: 45%;
      --preview-bottom: 70%;
      --preview-height: 180px;
      --controls-height: 64px;
    }
    .nxl-card {
      position: absolute;
      inset: 0;
      display: grid;
      grid-template-rows: auto auto auto auto 1fr auto;
      gap: 12px;
      padding: 20px;
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.88) 0%,
        rgba(0, 0, 0, 0.88) var(--preview-top),
        rgba(0, 0, 0, 0) var(--preview-top),
        rgba(0, 0, 0, 0) var(--preview-bottom),
        rgba(0, 0, 0, 0.88) var(--preview-bottom),
        rgba(0, 0, 0, 0.88) 100%
      );
      backdrop-filter: blur(8px);
      border-radius: 12px;
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.08);
      animation: nxlFadeIn 150ms ease-out;
    }
    .nxl-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }
    .nxl-title {
      font-size: 30px;
      font-weight: 700;
      letter-spacing: 0.01em;
    }
    .nxl-meta {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.75);
      margin-top: 6px;
    }
    .nxl-genres {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      margin-top: 4px;
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
      min-height: var(--preview-height);
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
    @keyframes nxlFadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes nxlPop {
      0% { transform: scale(0.96); }
      100% { transform: scale(1); }
    }
  `;const a=document.createElement("div");a.className="nxl-card";const r=document.createElement("div");r.className="nxl-top";const s=document.createElement("div");s.className="nxl-title-section";const d=document.createElement("div");d.className="nxl-title",d.textContent=t.titleLine;const p=document.createElement("div");p.className="nxl-meta",p.dataset.field="metadata",p.textContent=t.metadataLine??"TV-14 • 2 Seasons • HD";const m=document.createElement("div");m.className="nxl-genres",m.dataset.field="genres",m.textContent=t.genresLine??"Genres",s.appendChild(d),s.appendChild(p),s.appendChild(m);const h=document.createElement("div");h.className="nxl-branding",h.innerHTML=`
    Powered by
    <span class="nxl-dots">
      <span class="nxl-dot green"></span>
      <span class="nxl-dot orange"></span>
      <span class="nxl-dot blue"></span>
    </span>
    Letterboxd
  `,r.appendChild(s),r.appendChild(h);const g=document.createElement("div");g.className="nxl-divider";const l=document.createElement("div");l.className="nxl-metadata";const c=document.createElement("div");c.className="nxl-rating",c.dataset.field="communityRating",c.textContent="Community rating: —";const f=document.createElement("div");f.className="nxl-match",f.dataset.field="match",f.textContent="Your match: —";const x=document.createElement("div");x.className="nxl-because",x.dataset.field="because",x.textContent="Because you like —",l.appendChild(c),l.appendChild(f),l.appendChild(x);const v=document.createElement("div");v.className="nxl-preview",v.dataset.field="preview";const k=document.createElement("div");k.className="nxl-controls",k.dataset.field="controls",a.appendChild(r),a.appendChild(g),a.appendChild(l),a.appendChild(v),a.appendChild(k);const q=document.createElement("div");return q.className="debug",q.dataset.field="debug",a.appendChild(q),n.appendChild(o),n.appendChild(a),e};let y=null,i=null,M=null;const F=(t,e)=>{if(!e)return;const n=e.getBoundingClientRect();t.style.position="fixed",t.style.top=`${Math.max(8,n.top-st.y)}px`,t.style.left=`${Math.max(8,n.left)}px`,t.style.right="auto",t.style.width=`${Math.max(280,n.width)}px`,t.style.height=`${Math.max(220,n.height)}px`},ut=t=>t===void 0?"":t>=1e6?`${(t/1e6).toFixed(1)}M`:t>=1e3?`${(t/1e3).toFixed(1)}K`:`${t}`,G=t=>{var p,m,h,g,l,c,f;const e=(p=i==null?void 0:i.shadowRoot)==null?void 0:p.querySelector(".nxl-title");e&&(e.textContent=t.titleLine);const n=(m=i==null?void 0:i.shadowRoot)==null?void 0:m.querySelector("[data-field='communityRating']");if(n)if(t.communityRating!==void 0){const x=ut(t.ratingCount);n.innerHTML=`
        Community rating:
        <span class="nxl-star">★</span>
        ${t.communityRating.toFixed(1)}${x?` <span class="nxl-meta">${x} ratings</span>`:""}
      `}else n.textContent="Community rating: —";const o=(h=i==null?void 0:i.shadowRoot)==null?void 0:h.querySelector("[data-field='match']");o&&(t.matchScore!==void 0?o.innerHTML=`Your match: <span class="nxl-match-value">${t.matchScore}%</span>`:o.textContent="Your match: —");const a=(g=i==null?void 0:i.shadowRoot)==null?void 0:g.querySelector("[data-field='because']");a&&(a.textContent=t.matchExplanation??"Because you like —");const r=(l=i==null?void 0:i.shadowRoot)==null?void 0:l.querySelector("[data-field='metadata']");r&&(r.textContent=t.metadataLine??"TV-14 • 2 Seasons • HD");const s=(c=i==null?void 0:i.shadowRoot)==null?void 0:c.querySelector("[data-field='genres']");s&&(s.textContent=t.genresLine??"Genres");const d=(f=i==null?void 0:i.shadowRoot)==null?void 0:f.querySelector("[data-field='debug']");d&&(t.debug?(d.style.display="block",d.textContent=JSON.stringify(t.debug,null,2)):(d.style.display="none",d.textContent=""))},C=(t,e,n=null,o=!1,a)=>{if(!e||!t&&!n){i&&i.remove(),V(y),y=null,i=null,M=null;return}if(y!==t||M!==n){if(i&&i.remove(),V(y),y=t,M=n,i=dt(e),t){if(ct(t),t.appendChild(i),a){const r=Math.max(0,Math.min(100,a.top/a.containerHeight*100)),s=Math.max(0,Math.min(100,a.bottom/a.containerHeight*100));i.style.setProperty("--preview-top",`${r}%`),i.style.setProperty("--preview-bottom",`${s}%`),i.style.setProperty("--preview-height",`${a.previewHeight}px`),i.style.setProperty("--controls-height",`${a.controlsHeight}px`)}o&&F(i,n??t)}else n&&(document.documentElement.appendChild(i),F(i,n));G(e);return}if(a){const r=Math.max(0,Math.min(100,a.top/a.containerHeight*100)),s=Math.max(0,Math.min(100,a.bottom/a.containerHeight*100));i.style.setProperty("--preview-top",`${r}%`),i.style.setProperty("--preview-bottom",`${s}%`),i.style.setProperty("--preview-height",`${a.previewHeight}px`),i.style.setProperty("--controls-height",`${a.controlsHeight}px`)}G(e)},H="nxlb-debug-badge",N={ctrlKey:!0,shiftKey:!0,key:"l"},pt=250,mt=t=>{const e=document.getElementById(H);if(!t){e==null||e.remove();return}if(e)return;const n=document.createElement("div");n.id=H,n.style.position="fixed",n.style.bottom="16px",n.style.right="16px",n.style.zIndex="2147483647";const o=n.attachShadow({mode:"open"}),a=document.createElement("style");a.textContent=`
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
  `;const r=document.createElement("div");r.className="badge",r.textContent="N×L active",o.appendChild(a),o.appendChild(r),document.documentElement.appendChild(n)};let K=!0;const j=async t=>{K=t,t||C(null,null),mt(t)};let I="",O=null,R,Y="";const ft=t=>t?[t.netflixTitleId??"",t.titleText??"",t.year??"",t.href??""].join("|"):"",xt=()=>{if(!K)return;const{candidate:t,container:e}=rt(),n=et(e),o=nt(e),a=at(e),r=ot(e),s=(()=>{if(!e||!o)return;const l=e.getBoundingClientRect(),c=o.getBoundingClientRect();if(l.height===0)return;const f=Math.max(0,c.top-l.top),x=Math.max(0,c.bottom-l.top),v=Math.max(0,l.bottom-c.bottom);return{top:f,bottom:x,containerHeight:l.height,previewHeight:Math.max(0,c.height),controlsHeight:v}})(),d=!e||!o,p=ft(t);if(!t){try{C(null,null)}catch{}I="",O=null;return}if(p===I&&e===O)return;I=p,O=e,E("Active title changed",{...t,at:new Date().toISOString()});const m=`req_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;Y=m;const h={type:"RESOLVE_TITLE",requestId:m,payload:{netflixTitleId:t.netflixTitleId,titleText:t.titleText,year:t.year,href:t.href}};chrome.runtime.sendMessage(h).then(l=>{if((l==null?void 0:l.type)==="TITLE_RESOLVED"&&l.requestId===Y)try{C(e,{titleLine:g,metadataLine:a,genresLine:r,communityRating:l.payload.tmdbVoteAverage,ratingCount:l.payload.tmdbVoteCount,inWatchlist:l.payload.inWatchlist,userRating:l.payload.userRating,matchScore:l.payload.matchScore,matchExplanation:l.payload.matchExplanation,debug:void 0},n,d,s)}catch{}}).catch(l=>{});const g=t.titleText?t.year?`${t.titleText} (${t.year})`:t.titleText:"Unknown title";try{C(e,{titleLine:g,metadataLine:a,genresLine:r,debug:void 0},n,d,s)}catch{}},b=()=>{R&&window.clearTimeout(R),R=window.setTimeout(()=>{xt()},pt)},ht=()=>{new MutationObserver(()=>{try{b()}catch{}}).observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class","style","aria-expanded","aria-hidden"]}),document.addEventListener("pointerover",()=>{try{b()}catch{}},!0),document.addEventListener("focusin",()=>{try{b()}catch{}},!0),b()},gt=async()=>{const e=!((await P()).overlayEnabled??!0);await W({overlayEnabled:e}),await j(e),e&&b()},yt=t=>{t.ctrlKey===N.ctrlKey&&t.shiftKey===N.shiftKey&&t.key.toLowerCase()===N.key&&(t.preventDefault(),gt().catch(e=>E("Toggle failed",e)))},U=async()=>{const e=(await P()).overlayEnabled??!0;await j(e),ht(),window.addEventListener("keydown",yt)};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{U().catch(t=>E("Init failed",t))},{once:!0}):U().catch(t=>E("Init failed",t))})();
//# sourceMappingURL=index.js.map
