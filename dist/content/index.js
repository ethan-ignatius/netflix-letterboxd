(function(){"use strict";const h=(...t)=>{},O=async()=>chrome.storage.local.get(["letterboxdExport","lastImportAt","overlayEnabled","tmdbApiKey","tmdbCache","letterboxdIndex","letterboxdStats"]),P=async t=>{await chrome.storage.local.set(t)},E="a[href^='/title/']",I=["[role='dialog']","[aria-modal='true']","[aria-expanded='true']","[data-uia*='preview']","[data-uia*='billboard']","[data-uia*='hero']","[data-uia*='details']"],C=["h1","h2","h3","[data-uia*='title']","[class*='title']","[class*='fallback']","[class*='preview'] [class*='header']"],d=t=>{const e=t.getBoundingClientRect();if(e.width===0||e.height===0)return!1;const n=window.getComputedStyle(t);return n.visibility==="hidden"||n.display==="none"||n.opacity==="0"?!1:e.bottom>=0&&e.right>=0&&e.top<=window.innerHeight&&e.left<=window.innerWidth},L=t=>{if(!t)return;const e=t.replace(/\s+/g," ").trim();return e.length?e:void 0},W=t=>{if(!t)return;const e=t.match(/\/title\/(\d+)/);return e==null?void 0:e[1]},v=t=>{if(!t)return;const e=t.match(/(19\d{2}|20\d{2})/);if(!e)return;const n=Number(e[1]);if(!Number.isNaN(n))return n},N=(t,e)=>{const n=t.getAttribute("href")||void 0,a=W(n),i=L(t.getAttribute("aria-label")||t.textContent);return{netflixTitleId:a,titleText:i,href:n,source:e}},B=t=>{for(const e of C){const n=t.querySelector(e);if(n&&d(n)){const a=L(n.textContent);if(a)return a}}},U=t=>{if(t){const a=q(t);if(a&&d(a))return a;for(const i of C){const r=t.querySelector(i);if(r&&d(r))return r}}const e=Array.from(document.querySelectorAll(E)).find(d);return e||(Array.from(document.querySelectorAll(C.join(","))).find(d)??null)},q=t=>{const e=Array.from(t.querySelectorAll(E)),n=e.filter(d);return n.length>0?n[0]:e[0]},j=()=>{const t=I.join(","),e=Array.from(document.querySelectorAll(t)),n=e.filter(d);return n.length>0?n:e},J=()=>{const t=j();for(const n of t){const a=q(n);if(a){const r=N(a,"container-anchor");if(r.netflixTitleId||r.titleText){const s=r.titleText??B(n);return{candidate:{...r,titleText:s,year:v(s)},container:n}}}const i=B(n);if(i)return{candidate:{titleText:i,year:v(i),source:"container-text"},container:n}}const e=Array.from(document.querySelectorAll(E)).find(d);if(e){const n=N(e,"page-anchor");return{candidate:{...n,year:v(n.titleText)},container:e.closest(I.join(","))??e.parentElement}}return{candidate:null,container:null}},X="nxlb-overlay-panel",k={x:16,y:12},x=new WeakMap,Q=t=>{window.getComputedStyle(t).position==="static"&&(x.has(t)||x.set(t,t instanceof HTMLElement?t.style.position:""),t instanceof HTMLElement&&(t.style.position="relative",t.dataset.nxlbPositioned="true"))},M=t=>{if(!t||!(t instanceof HTMLElement)||!t.dataset.nxlbPositioned)return;const e=x.get(t)??"";t.style.position=e,delete t.dataset.nxlbPositioned,x.delete(t)},Z=t=>{const e=document.createElement("div");e.id=X,e.style.position="absolute",e.style.top="12px",e.style.right="12px",e.style.zIndex="2147483647";const n=e.attachShadow({mode:"open"}),a=document.createElement("style");a.textContent=`
    :host {
      all: initial;
      font-family: "Space Grotesk", sans-serif;
      pointer-events: none;
    }
    .panel {
      min-width: 220px;
      max-width: 280px;
      background: rgba(16, 16, 16, 0.92);
      color: #f5f0ea;
      border-radius: 12px;
      padding: 12px 14px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 14px 30px rgba(0, 0, 0, 0.3);
      display: grid;
      gap: 8px;
    }
    .title {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.01em;
    }
    .meta {
      font-size: 12px;
      opacity: 0.7;
    }
    .badges {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .badge {
      font-size: 11px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 4px 8px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.12);
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
  `;const i=document.createElement("div");i.className="panel";const r=document.createElement("div");r.className="title",r.textContent=t.titleLine;const s=document.createElement("div");s.className="meta",s.dataset.field="communityRating",s.textContent="Community rating: —";const l=document.createElement("div");l.className="meta",l.dataset.field="ratingCount",l.textContent="Rating count: —";const c=document.createElement("div");c.className="meta",c.dataset.field="match",c.textContent="Your match: —";const u=document.createElement("div");u.className="badges";const p=document.createElement("div");p.className="badge",p.dataset.field="watchlistBadge",p.textContent="On Watchlist";const m=document.createElement("div");m.className="badge",m.dataset.field="ratingBadge",m.textContent="You rated ★★★★",u.appendChild(p),u.appendChild(m),i.appendChild(r),i.appendChild(s),i.appendChild(l),i.appendChild(c),i.appendChild(u);const f=document.createElement("div");return f.className="debug",f.dataset.field="debug",i.appendChild(f),n.appendChild(a),n.appendChild(i),e};let y=null,o=null,w=null;const _=(t,e)=>{if(!e)return;const n=e.getBoundingClientRect();t.style.position="fixed",t.style.top=`${Math.max(8,n.top+k.y)}px`,t.style.left=`${Math.max(8,n.right+k.x)}px`,t.style.right="auto"},D=t=>{var c,u,p,m,f,F,Y;const e=(c=o==null?void 0:o.shadowRoot)==null?void 0:c.querySelector(".title");e&&(e.textContent=t.titleLine);const n=(u=o==null?void 0:o.shadowRoot)==null?void 0:u.querySelector("[data-field='communityRating']");n&&(n.textContent=t.communityRating!==void 0?`Community rating: ${t.communityRating}`:"Community rating: —");const a=(p=o==null?void 0:o.shadowRoot)==null?void 0:p.querySelector("[data-field='ratingCount']");a&&(a.textContent=t.ratingCount!==void 0?`Rating count: ${t.ratingCount}`:"Rating count: —");const i=(m=o==null?void 0:o.shadowRoot)==null?void 0:m.querySelector("[data-field='watchlistBadge']");i&&(i.style.display=t.inWatchlist?"inline-flex":"none");const r=(f=o==null?void 0:o.shadowRoot)==null?void 0:f.querySelector("[data-field='ratingBadge']");r&&(t.userRating!==void 0?(r.style.display="inline-flex",r.textContent=`You rated ${H(t.userRating)}`):r.style.display="none");const s=(F=o==null?void 0:o.shadowRoot)==null?void 0:F.querySelector("[data-field='match']");if(s)if(t.matchScore!==void 0){const rt=t.matchExplanation?` · ${t.matchExplanation}`:"";s.textContent=`Your match: ${t.matchScore}${rt}`}else s.textContent="Your match: —";const l=(Y=o==null?void 0:o.shadowRoot)==null?void 0:Y.querySelector("[data-field='debug']");l&&(t.debug?(l.style.display="block",l.textContent=JSON.stringify(t.debug,null,2)):(l.style.display="none",l.textContent=""))},b=(t,e,n=null,a=!1)=>{if(!e||!t&&!n){o&&o.remove(),M(y),y=null,o=null,w=null;return}if(y!==t||w!==n){o&&o.remove(),M(y),y=t,w=n,o=Z(e),t?(Q(t),t.appendChild(o),a&&_(o,n??t)):n&&(document.documentElement.appendChild(o),_(o,n)),D(e);return}D(e)},H=t=>{const e=Math.max(0,Math.min(5,t)),n=Math.floor(e),a=e-n>=.5,i="★".repeat(n);return a?`${i}½`:i||"—"},$="nxlb-debug-badge",T={ctrlKey:!0,shiftKey:!0,key:"l"},tt=250,et=t=>{const e=document.getElementById($);if(!t){e==null||e.remove();return}if(e)return;const n=document.createElement("div");n.id=$,n.style.position="fixed",n.style.bottom="16px",n.style.right="16px",n.style.zIndex="2147483647";const a=n.attachShadow({mode:"open"}),i=document.createElement("style");i.textContent=`
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
  `;const r=document.createElement("div");r.className="badge",r.textContent="N×L active",a.appendChild(i),a.appendChild(r),document.documentElement.appendChild(n)};let z=!0;const K=async t=>{z=t,t||b(null,null),et(t)};let S="",R=null,A,V="";const nt=t=>t?[t.netflixTitleId??"",t.titleText??"",t.year??"",t.href??""].join("|"):"",ot=()=>{if(!z)return;const{candidate:t,container:e}=J(),n=U(e),a=nt(t);if(!t){try{b(null,null)}catch{}S="",R=null;return}if(a===S&&e===R)return;S=a,R=e,h("Active title changed",{...t,at:new Date().toISOString()});const i=`req_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;V=i;const r={type:"RESOLVE_TITLE",requestId:i,payload:{netflixTitleId:t.netflixTitleId,titleText:t.titleText,year:t.year,href:t.href}};chrome.runtime.sendMessage(r).then(l=>{if((l==null?void 0:l.type)==="TITLE_RESOLVED"&&l.requestId===V)try{b(e,{titleLine:s,communityRating:l.payload.tmdbVoteAverage,ratingCount:l.payload.tmdbVoteCount,inWatchlist:l.payload.inWatchlist,userRating:l.payload.userRating,matchScore:l.payload.matchScore,matchExplanation:l.payload.matchExplanation,debug:void 0},n,!e)}catch{}}).catch(l=>{});const s=t.titleText?t.year?`${t.titleText} (${t.year})`:t.titleText:"Unknown title";try{b(e,{titleLine:s,debug:void 0},n,!e)}catch{}},g=()=>{A&&window.clearTimeout(A),A=window.setTimeout(()=>{ot()},tt)},at=()=>{new MutationObserver(()=>{try{g()}catch{}}).observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class","style","aria-expanded","aria-hidden"]}),document.addEventListener("pointerover",()=>{try{g()}catch{}},!0),document.addEventListener("focusin",()=>{try{g()}catch{}},!0),g()},it=async()=>{const e=!((await O()).overlayEnabled??!0);await P({overlayEnabled:e}),await K(e),e&&g()},lt=t=>{t.ctrlKey===T.ctrlKey&&t.shiftKey===T.shiftKey&&t.key.toLowerCase()===T.key&&(t.preventDefault(),it().catch(e=>h("Toggle failed",e)))},G=async()=>{const e=(await O()).overlayEnabled??!0;await K(e),at(),window.addEventListener("keydown",lt)};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{G().catch(t=>h("Init failed",t))},{once:!0}):G().catch(t=>h("Init failed",t))})();
//# sourceMappingURL=index.js.map
