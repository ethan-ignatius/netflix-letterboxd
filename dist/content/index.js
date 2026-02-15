import{l as x,D as I}from"../assets/log-BKemMERr.js";import{g as V,s as j}from"../assets/storage-1ncC6wrF.js";const A="a[href^='/title/']",K=["[role='dialog']","[aria-modal='true']","[aria-expanded='true']","[data-uia*='preview']","[data-uia*='billboard']","[data-uia*='hero']","[data-uia*='details']"],R=["h1","h2","h3","[data-uia*='title']","[class*='title']","[class*='fallback']","[class*='preview'] [class*='header']"],c=t=>{const e=t.getBoundingClientRect();if(e.width===0||e.height===0)return!1;const n=window.getComputedStyle(t);return n.visibility==="hidden"||n.display==="none"||n.opacity==="0"?!1:e.bottom>=0&&e.right>=0&&e.top<=window.innerHeight&&e.left<=window.innerWidth},F=t=>{if(!t)return;const e=t.replace(/\s+/g," ").trim();return e.length?e:void 0},U=t=>{if(!t)return;const e=t.match(/\/title\/(\d+)/);return e==null?void 0:e[1]},C=t=>{if(!t)return;const e=t.match(/(19\d{2}|20\d{2})/);if(!e)return;const n=Number(e[1]);if(!Number.isNaN(n))return n},N=(t,e)=>{const n=t.getAttribute("href")||void 0,o=U(n),a=F(t.getAttribute("aria-label")||t.textContent);return{netflixTitleId:o,titleText:a,href:n,source:e}},q=t=>{for(const e of R){const n=t.querySelector(e);if(n&&c(n)){const o=F(n.textContent);if(o)return o}}},J=t=>{if(t){const o=Y(t);if(o&&c(o))return o;for(const a of R){const r=t.querySelector(a);if(r&&c(r))return r}}const e=Array.from(document.querySelectorAll(A)).find(c);return e||(Array.from(document.querySelectorAll(R.join(","))).find(c)??null)},Y=t=>{const e=Array.from(t.querySelectorAll(A)),n=e.filter(c);return n.length>0?n[0]:e[0]},X=()=>{const t=K.join(","),e=Array.from(document.querySelectorAll(t)),n=e.filter(c);return n.length>0?n:e},Q=()=>{const t=X();for(const n of t){const o=Y(n);if(o){const r=N(o,"container-anchor");if(r.netflixTitleId||r.titleText){const s=r.titleText??q(n);return{candidate:{...r,titleText:s,year:C(s)},container:n}}}const a=q(n);if(a)return{candidate:{titleText:a,year:C(a),source:"container-text"},container:n}}const e=Array.from(document.querySelectorAll(A)).find(c);if(e){const n=N(e,"page-anchor");return{candidate:{...n,year:C(n.titleText)},container:e.closest(K.join(","))??e.parentElement}}return{candidate:null,container:null}},Z="nxlb-overlay-panel",B={x:16,y:12},b=new WeakMap,H=t=>{window.getComputedStyle(t).position==="static"&&(b.has(t)||b.set(t,t instanceof HTMLElement?t.style.position:""),t instanceof HTMLElement&&(t.style.position="relative",t.dataset.nxlbPositioned="true"))},k=t=>{if(!t||!(t instanceof HTMLElement)||!t.dataset.nxlbPositioned)return;const e=b.get(t)??"";t.style.position=e,delete t.dataset.nxlbPositioned,b.delete(t)},tt=t=>{const e=document.createElement("div");e.id=Z,e.style.position="absolute",e.style.top="12px",e.style.right="12px",e.style.zIndex="2147483647";const n=e.attachShadow({mode:"open"}),o=document.createElement("style");o.textContent=`
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
  `;const a=document.createElement("div");a.className="panel";const r=document.createElement("div");r.className="title",r.textContent=t.titleLine;const s=document.createElement("div");s.className="meta",s.dataset.field="communityRating",s.textContent="Community rating: —";const l=document.createElement("div");l.className="meta",l.dataset.field="ratingCount",l.textContent="Rating count: —";const d=document.createElement("div");d.className="meta",d.dataset.field="match",d.textContent="Your match: —";const u=document.createElement("div");u.className="badges";const p=document.createElement("div");p.className="badge",p.dataset.field="watchlistBadge",p.textContent="On Watchlist";const m=document.createElement("div");m.className="badge",m.dataset.field="ratingBadge",m.textContent="You rated ★★★★",u.appendChild(p),u.appendChild(m),a.appendChild(r),a.appendChild(s),a.appendChild(l),a.appendChild(d),a.appendChild(u);const f=document.createElement("div");return f.className="debug",f.dataset.field="debug",a.appendChild(f),n.appendChild(o),n.appendChild(a),e};let y=null,i=null,E=null;const M=(t,e)=>{if(!e)return;const n=e.getBoundingClientRect();t.style.position="fixed",t.style.top=`${Math.max(8,n.top+B.y)}px`,t.style.left=`${Math.max(8,n.right+B.x)}px`,t.style.right="auto"},_=t=>{var d,u,p,m,f,O,L;const e=(d=i==null?void 0:i.shadowRoot)==null?void 0:d.querySelector(".title");e&&(e.textContent=t.titleLine);const n=(u=i==null?void 0:i.shadowRoot)==null?void 0:u.querySelector("[data-field='communityRating']");n&&(n.textContent=t.communityRating!==void 0?`Community rating: ${t.communityRating}`:"Community rating: —");const o=(p=i==null?void 0:i.shadowRoot)==null?void 0:p.querySelector("[data-field='ratingCount']");o&&(o.textContent=t.ratingCount!==void 0?`Rating count: ${t.ratingCount}`:"Rating count: —");const a=(m=i==null?void 0:i.shadowRoot)==null?void 0:m.querySelector("[data-field='watchlistBadge']");a&&(a.style.display=t.inWatchlist?"inline-flex":"none");const r=(f=i==null?void 0:i.shadowRoot)==null?void 0:f.querySelector("[data-field='ratingBadge']");r&&(t.userRating!==void 0?(r.style.display="inline-flex",r.textContent=`You rated ${et(t.userRating)}`):r.style.display="none");const s=(O=i==null?void 0:i.shadowRoot)==null?void 0:O.querySelector("[data-field='match']");if(s)if(t.matchScore!==void 0){const W=t.matchExplanation?` · ${t.matchExplanation}`:"";s.textContent=`Your match: ${t.matchScore}${W}`}else s.textContent="Your match: —";const l=(L=i==null?void 0:i.shadowRoot)==null?void 0:L.querySelector("[data-field='debug']");l&&(t.debug?(l.style.display="block",l.textContent=JSON.stringify(t.debug,null,2)):(l.style.display="none",l.textContent=""))},h=(t,e,n=null,o=!1)=>{if(!e||!t&&!n){i&&i.remove(),k(y),y=null,i=null,E=null;return}if(y!==t||E!==n){i&&i.remove(),k(y),y=t,E=n,i=tt(e),t?(H(t),t.appendChild(i),o&&M(i,n??t)):n&&(document.documentElement.appendChild(i),M(i,n)),_(e);return}_(e)},et=t=>{const e=Math.max(0,Math.min(5,t)),n=Math.floor(e),o=e-n>=.5,a="★".repeat(n);return o?`${a}½`:a||"—"},$="nxlb-debug-badge",v={ctrlKey:!0,shiftKey:!0,key:"l"},nt=250,it=t=>{const e=document.getElementById($);if(!t){e==null||e.remove();return}if(e)return;const n=document.createElement("div");n.id=$,n.style.position="fixed",n.style.bottom="16px",n.style.right="16px",n.style.zIndex="2147483647";const o=n.attachShadow({mode:"open"}),a=document.createElement("style");a.textContent=`
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
  `;const r=document.createElement("div");r.className="badge",r.textContent="N×L active",o.appendChild(a),o.appendChild(r),document.documentElement.appendChild(n)};let G=!0;const P=async t=>{G=t,t||h(null,null),it(t)};let w="",T=null,S,D="";const ot=t=>t?[t.netflixTitleId??"",t.titleText??"",t.year??"",t.href??""].join("|"):"",at=()=>{if(!G)return;const{candidate:t,container:e}=Q(),n=J(e),o=ot(t);if(!t){try{h(null,null)}catch{}w="",T=null;return}if(o===w&&e===T)return;w=o,T=e,x("Active title changed",{...t,at:new Date().toISOString()});const a=`req_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;D=a;const r={type:"RESOLVE_TITLE",requestId:a,payload:{netflixTitleId:t.netflixTitleId,titleText:t.titleText,year:t.year,href:t.href}};chrome.runtime.sendMessage(r).then(l=>{if((l==null?void 0:l.type)==="TITLE_RESOLVED"&&l.requestId===D)try{h(e,{titleLine:s,communityRating:l.payload.tmdbVoteAverage,ratingCount:l.payload.tmdbVoteCount,inWatchlist:l.payload.inWatchlist,userRating:l.payload.userRating,matchScore:l.payload.matchScore,matchExplanation:l.payload.matchExplanation,debug:I?{...t,...l.payload}:void 0},n,!e)}catch{}}).catch(l=>{});const s=t.titleText?t.year?`${t.titleText} (${t.year})`:t.titleText:"Unknown title";try{h(e,{titleLine:s,debug:I?{...t}:void 0},n,!e)}catch{}},g=()=>{S&&window.clearTimeout(S),S=window.setTimeout(()=>{at()},nt)},lt=()=>{new MutationObserver(()=>{try{g()}catch{}}).observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class","style","aria-expanded","aria-hidden"]}),document.addEventListener("pointerover",()=>{try{g()}catch{}},!0),document.addEventListener("focusin",()=>{try{g()}catch{}},!0),g()},rt=async()=>{const e=!((await V()).overlayEnabled??!0);await j({overlayEnabled:e}),await P(e),e&&g()},st=t=>{t.ctrlKey===v.ctrlKey&&t.shiftKey===v.shiftKey&&t.key.toLowerCase()===v.key&&(t.preventDefault(),rt().catch(e=>x("Toggle failed",e)))},z=async()=>{const e=(await V()).overlayEnabled??!0;await P(e),lt(),window.addEventListener("keydown",st)};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{z().catch(t=>x("Init failed",t))},{once:!0}):z().catch(t=>x("Init failed",t));
//# sourceMappingURL=index.js.map
