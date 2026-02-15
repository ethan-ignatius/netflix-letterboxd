(function(){"use strict";const L=(...t)=>{},W=async()=>chrome.storage.local.get(["letterboxdExport","lastImportAt","overlayEnabled","tmdbApiKey","tmdbCache","letterboxdIndex","letterboxdStats"]),nt=async t=>{await chrome.storage.local.set(t)},A="a[href^='/title/']",N=["[role='dialog']","[aria-modal='true']","[aria-expanded='true']","[data-uia*='jawbone']","[class*='jawbone']","[data-uia*='preview']","[data-uia*='billboard']","[data-uia*='hero']","[data-uia*='details']"],E=["h1","h2","h3","[data-uia*='title']","[class*='title']","[class*='fallback']","[class*='preview'] [class*='header']"],it=["video","img","[data-uia*='preview'] video","[data-uia*='preview'] img","[class*='preview'] video","[class*='preview'] img","[data-uia*='player'] video","[data-uia*='hero'] img"],k=/(S\d+\s*:?\s*E\d+|Season\s*\d+\s*Episode\s*\d+|Episode\s*\d+|\bE\d+\b)/i,I=/(\b\d+\s*(m|min|minutes)\b|\b\d+\s*of\s*\d+\s*(m|min|minutes)\b)/i,ot=["[data-uia*='maturity-rating']","[data-uia*='season']","[data-uia*='resolution']","[data-uia*='hd']","[class*='maturity']","[class*='season']","[class*='quality']"],at=["[data-uia*='genre']","a[href*='/genre/']","[class*='genre']"],m=t=>{const e=t.getBoundingClientRect();if(e.width===0||e.height===0)return!1;const n=window.getComputedStyle(t);return n.visibility==="hidden"||n.display==="none"||n.opacity==="0"?!1:e.bottom>=0&&e.right>=0&&e.top<=window.innerHeight&&e.left<=window.innerWidth},C=t=>{if(!t)return;const e=t.replace(/\s+/g," ").trim();return e.length?e:void 0},G=(t,e)=>{const n=[];return e.forEach(i=>{t.querySelectorAll(i).forEach(o=>{if(!m(o))return;const a=C(o.textContent);a&&n.push(a)})}),n},rt=t=>{const e=t.toLowerCase();return e.includes("episode")||e.includes("min")||e.includes("of ")?!1:(e.includes("season")||e.includes("hd")||e.includes("tv-"),!0)},lt=t=>{if(!t)return;const e=t.match(/\/title\/(\d+)/);return e==null?void 0:e[1]},O=t=>{if(!t)return;const e=t.match(/(19\d{2}|20\d{2})/);if(!e)return;const n=Number(e[1]);if(!Number.isNaN(n))return n},M=t=>{if(!t)return;let e=t;return e=e.replace(/^\s*S\d+\s*:?\s*E\d+\s*/i,""),e=e.replace(/"[^"]*"/g,n=>{const i=n.replace(/"/g,"");return k.test(i)?"":n}),e=e.replace(/Episode\s*\d+/gi,""),e=e.replace(/\bE\d+\b/gi,""),e=e.replace(I,""),e=e.replace(/\s+of\s+\d+\s*(m|min|minutes)?/gi,""),e=e.replace(/\s+/g," ").trim(),e.length?e:void 0},j=(t,e)=>{const n=t.getAttribute("href")||void 0,i=lt(n),o=C(t.getAttribute("aria-label")||t.textContent);return{netflixTitleId:i,titleText:o,href:n,source:e}},F=t=>{for(const e of E){const n=t.querySelector(e);if(n&&m(n)){const i=C(n.textContent);if(i)return i}}},st=t=>{if(t)for(const e of E){const n=Array.from(t.querySelectorAll(e));for(const i of n){if(!m(i))continue;const o=C(i.textContent);if(!o||k.test(o)||I.test(o))continue;const a=M(o);if(a)return a}}},ct=t=>{if(t){const i=K(t);if(i&&m(i))return i;for(const o of E){const a=t.querySelector(o);if(a&&m(a))return a}}const e=Array.from(document.querySelectorAll(A)).find(m);return e||(Array.from(document.querySelectorAll(E.join(","))).find(m)??null)},dt=t=>{if(!t)return null;const e=[];return it.forEach(n=>{t.querySelectorAll(n).forEach(i=>{m(i)&&e.push(i)})}),e.length?e.reduce((n,i)=>{const o=n.getBoundingClientRect(),a=i.getBoundingClientRect(),u=o.width*o.height;return a.width*a.height>u?i:n}):null},ut=t=>{if(!t)return;const e=G(t,ot).map(i=>i.replace(/\s+/g," ").trim()).filter(i=>i.length>0).filter(rt).filter(i=>!I.test(i)).filter(i=>i.length<=24),n=Array.from(new Set(e));if(n.length)return n.slice(0,3).join(" • ")},ht=t=>{if(!t)return;const e=G(t,at).map(i=>i.replace(/\s+/g," ").trim()).filter(i=>i.length>0).filter(i=>i.length<=24).filter(i=>!/episode|min/i.test(i)),n=Array.from(new Set(e));if(n.length)return n.slice(0,3).join(" • ")},q=(t,e)=>{const n=st(t);if(n)return n;const i=M(e);if(i&&!k.test(i))return i;if(e)return M(e)??e},pt=(t,e)=>{const n=new Set,i=c=>{let s=c,p=0;for(;s&&p<7;)n.add(s),s=s.parentElement,p+=1};i(t),i(e);let o=null,a=0;const u=window.innerWidth*.85,l=window.innerHeight*.6;if(n.forEach(c=>{if(!m(c))return;const s=c.getBoundingClientRect(),p=s.width*s.height;s.width>u||s.height>l||p>a&&s.width>240&&s.height>180&&(o=c,a=p)}),o)return o;const h=c=>{if(!c)return!1;const s=c.getBoundingClientRect();return s.width===0||s.height===0?!1:s.width<=u&&s.height<=l};return h(t)?t??null:h(e)?e??null:null},K=t=>{const e=Array.from(t.querySelectorAll(A)),n=e.filter(m);return n.length>0?n[0]:e[0]},mt=()=>{const t=N.join(","),e=Array.from(document.querySelectorAll(t)),n=e.filter(m),i=window.innerWidth*.85,o=window.innerHeight*.6,a=n.filter(u=>{const l=u.getBoundingClientRect();return!(l.width===0||l.height===0||l.width<240||l.height<180||l.width>i||l.height>o)});return a.length>0?a.sort((u,l)=>{const h=u.getBoundingClientRect(),c=l.getBoundingClientRect();return c.width*c.height-h.width*h.height}):n.length>0?n:e},ft=()=>{const t=mt();for(const n of t){const i=K(n);if(i){const a=j(i,"container-anchor");if(a.netflixTitleId||a.titleText){const u=a.titleText??F(n),l=q(n,u??a.titleText);return{candidate:{...a,titleText:l,year:O(l??u)},container:n}}}const o=F(n);if(o){const a=q(n,o);return{candidate:{titleText:a??o,year:O(a??o),source:"container-text"},container:n}}}const e=Array.from(document.querySelectorAll(A)).find(m);if(e){const n=j(e,"page-anchor"),i=q(e.closest(N.join(","))??e.parentElement,n.titleText);return{candidate:{...n,titleText:i??n.titleText,year:O(i??n.titleText)},container:e.closest(N.join(","))??e.parentElement}}return{candidate:null,container:null}},xt="nxlb-overlay-panel",T=new WeakMap,gt=t=>{window.getComputedStyle(t).position==="static"&&(T.has(t)||T.set(t,t instanceof HTMLElement?t.style.position:""),t instanceof HTMLElement&&(t.style.position="relative",t.dataset.nxlbPositioned="true"))},Y=t=>{if(!t||!(t instanceof HTMLElement)||!t.dataset.nxlbPositioned)return;const e=T.get(t)??"";t.style.position=e,delete t.dataset.nxlbPositioned,T.delete(t)},yt=t=>{const e=document.createElement("div");e.id=xt,e.style.position="absolute",e.style.inset="0",e.style.width="100%",e.style.height="100%",e.style.zIndex="2147483647";const n=e.attachShadow({mode:"open"}),i=document.createElement("style");i.textContent=`
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
  `;const o=document.createElement("div");o.className="nxl-card";const a=document.createElement("div");a.className="nxl-shade top";const u=document.createElement("div");u.className="nxl-shade bottom";const l=document.createElement("div");l.className="nxl-content";const h=document.createElement("div");h.className="nxl-top";const c=document.createElement("div");c.className="nxl-title-section";const s=document.createElement("div");s.className="nxl-title",s.textContent=t.titleLine;const p=document.createElement("div");p.className="nxl-meta",p.dataset.field="metadata",p.textContent=t.metadataLine??"TV-14 • 2 Seasons • HD";const d=document.createElement("div");d.className="nxl-genres",d.dataset.field="genres",d.textContent=t.genresLine??"Genres",c.appendChild(s),c.appendChild(p),c.appendChild(d);const f=document.createElement("div");f.className="nxl-branding",f.innerHTML=`
    Powered by
    <span class="nxl-dots">
      <span class="nxl-dot green"></span>
      <span class="nxl-dot orange"></span>
      <span class="nxl-dot blue"></span>
    </span>
    Letterboxd
  `,h.appendChild(c),h.appendChild(f);const y=document.createElement("div");y.className="nxl-divider";const x=document.createElement("div");x.className="nxl-metadata";const b=document.createElement("div");b.className="nxl-rating",b.dataset.field="communityRating",b.textContent="Community rating: —";const S=document.createElement("div");S.className="nxl-match",S.dataset.field="match",S.textContent="Your match: —";const R=document.createElement("div");R.className="nxl-because",R.dataset.field="because",R.textContent="Because you like —",x.appendChild(b),x.appendChild(S),x.appendChild(R);const z=document.createElement("div");z.className="nxl-preview",z.dataset.field="preview";const D=document.createElement("div");D.className="nxl-controls",D.dataset.field="controls",l.appendChild(h),l.appendChild(y),l.appendChild(x),l.appendChild(z),l.appendChild(D);const V=document.createElement("div");return V.className="debug",V.dataset.field="debug",l.appendChild(V),o.appendChild(a),o.appendChild(u),o.appendChild(l),n.appendChild(i),n.appendChild(o),e};let w=null,r=null,B=null;const bt=t=>t===void 0?"":t>=1e6?`${(t/1e6).toFixed(1)}M`:t>=1e3?`${(t/1e3).toFixed(1)}K`:`${t}`,U=t=>{var h,c,s,p,d,f,y;const e=(h=r==null?void 0:r.shadowRoot)==null?void 0:h.querySelector(".nxl-title");e&&(e.textContent=t.titleLine);const n=(c=r==null?void 0:r.shadowRoot)==null?void 0:c.querySelector("[data-field='communityRating']");if(n)if(t.communityRating!==void 0){const x=bt(t.ratingCount);n.innerHTML=`
        Community rating:
        <span class="nxl-star">★</span>
        ${t.communityRating.toFixed(1)}${x?` <span class="nxl-meta">${x} ratings</span>`:""}
      `}else n.textContent="Community rating: —";const i=(s=r==null?void 0:r.shadowRoot)==null?void 0:s.querySelector("[data-field='match']");i&&(t.matchScore!==void 0?i.innerHTML=`Your match: <span class="nxl-match-value">${t.matchScore}%</span>`:i.textContent="Your match: —");const o=(p=r==null?void 0:r.shadowRoot)==null?void 0:p.querySelector("[data-field='because']");o&&(o.textContent=t.matchExplanation??"Because you like —");const a=(d=r==null?void 0:r.shadowRoot)==null?void 0:d.querySelector("[data-field='metadata']");a&&(t.metadataLine?(a.style.display="block",a.textContent=t.metadataLine):(a.style.display="none",a.textContent=""));const u=(f=r==null?void 0:r.shadowRoot)==null?void 0:f.querySelector("[data-field='genres']");u&&(t.genresLine?(u.style.display="block",u.textContent=t.genresLine):(u.style.display="none",u.textContent=""));const l=(y=r==null?void 0:r.shadowRoot)==null?void 0:y.querySelector("[data-field='debug']");l&&(t.debug?(l.style.display="block",l.textContent=JSON.stringify(t.debug,null,2)):(l.style.display="none",l.textContent=""))},g=(t,e,n=null,i=!1,o)=>{var u,l;if(!e||!t){r&&r.remove(),Y(w),w=null,r=null,B=null;return}if(w!==t||B!==n){r&&r.remove(),Y(w),w=t,B=n,r=yt(e),gt(t),t.appendChild(r);const h=t.getBoundingClientRect();if(r.style.width=`${h.width}px`,r.style.height=`${h.height}px`,o){const s=Math.max(160,o.top-8),p=Math.max(s+Math.max(120,o.previewHeight),o.bottom+8);r.style.setProperty("--preview-top-px",`${s}px`),r.style.setProperty("--preview-bottom-px",`${p}px`),r.style.setProperty("--controls-height",`${o.controlsHeight}px`)}const c=(u=r.shadowRoot)==null?void 0:u.querySelector(".nxl-card");c&&c.classList.toggle("safe",i),U(e);return}if(o&&r){const h=t.getBoundingClientRect();r.style.width=`${h.width}px`,r.style.height=`${h.height}px`;const c=Math.max(160,o.top-8),s=Math.max(c+Math.max(120,o.previewHeight),o.bottom+8);r.style.setProperty("--preview-top-px",`${c}px`),r.style.setProperty("--preview-bottom-px",`${s}px`),r.style.setProperty("--controls-height",`${o.controlsHeight}px`)}const a=(l=r==null?void 0:r.shadowRoot)==null?void 0:l.querySelector(".nxl-card");a&&a.classList.toggle("safe",i),U(e)},J="nxlb-debug-badge",P={ctrlKey:!0,shiftKey:!0,key:"l"},wt=250,vt=.85,Et=.6,Ct=t=>{const e=document.getElementById(J);if(!t){e==null||e.remove();return}if(e)return;const n=document.createElement("div");n.id=J,n.style.position="fixed",n.style.bottom="16px",n.style.right="16px",n.style.zIndex="2147483647";const i=n.attachShadow({mode:"open"}),o=document.createElement("style");o.textContent=`
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
  `;const a=document.createElement("div");a.className="badge",a.textContent="N×L active",i.appendChild(o),i.appendChild(a),document.documentElement.appendChild(n)};let X=!0;const Q=async t=>{X=t,t||g(null,null),Ct(t)};let _="",H=null,$,Z="";const Tt=()=>window.location.pathname.startsWith("/watch"),St=()=>Array.from(document.querySelectorAll("video")).some(e=>{const n=e.getBoundingClientRect();if(n.width===0||n.height===0)return!1;const i=n.width/window.innerWidth,o=n.height/window.innerHeight;return i>.85||o>.6}),Rt=()=>Array.from(document.querySelectorAll("h1, h2, h3, [data-uia*='episode'], [class*='episode']")).some(e=>{if(e instanceof HTMLElement){const n=e.getBoundingClientRect();if(n.width===0||n.height===0)return!1;const i=e.textContent??"";return/episode/i.test(i)}return!1}),tt=t=>{if(!t)return!1;const e=t.getBoundingClientRect();return e.width===0||e.height===0?!1:e.width>window.innerWidth*vt||e.height>window.innerHeight*Et},Lt=t=>t?[t.netflixTitleId??"",t.titleText??"",t.year??"",t.href??""].join("|"):"",At=()=>{if(!X)return;if(Tt()){g(null,null);return}if(St()){g(null,null);return}if(Rt()){g(null,null);return}const{candidate:t,container:e}=ft(),n=dt(e),i=pt(e,n),o=ct(i??e),a=ut(i??e),u=ht(i??e);if(!i||!n){g(null,null);return}if(tt(o)||tt(i)){g(null,null);return}const l=(()=>{const d=i.getBoundingClientRect(),f=n.getBoundingClientRect();if(d.height===0)return;const y=Math.max(0,f.top-d.top),x=Math.max(0,f.bottom-d.top),b=Math.max(0,d.bottom-f.bottom);return{top:y,bottom:x,containerHeight:d.height,previewHeight:Math.max(0,f.height),controlsHeight:b}})(),h=Lt(t);if(!t){try{g(null,null)}catch{}_="",H=null;return}if(h===_&&i===H)return;_=h,H=i;const c=`req_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;Z=c;const s={type:"RESOLVE_TITLE",requestId:c,payload:{netflixTitleId:t.netflixTitleId,titleText:t.titleText,year:t.year,href:t.href}};chrome.runtime.sendMessage(s).then(d=>{if((d==null?void 0:d.type)==="TITLE_RESOLVED"&&d.requestId===Z)try{g(i,{titleLine:p,metadataLine:a,genresLine:u,communityRating:d.payload.tmdbVoteAverage,ratingCount:d.payload.tmdbVoteCount,inWatchlist:d.payload.inWatchlist,userRating:d.payload.userRating,matchScore:d.payload.matchScore,matchExplanation:d.payload.matchExplanation,debug:void 0},o,!1,l)}catch{}}).catch(d=>{});const p=t.titleText?t.year?`${t.titleText} (${t.year})`:t.titleText:"Unknown title";try{g(i,{titleLine:p,metadataLine:a,genresLine:u,debug:void 0},o,!1,l)}catch{}},v=()=>{$&&window.clearTimeout($),$=window.setTimeout(()=>{At()},wt)},Nt=()=>{new MutationObserver(()=>{try{v()}catch{}}).observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class","style","aria-expanded","aria-hidden"]}),document.addEventListener("pointerover",()=>{try{v()}catch{}},!0),document.addEventListener("focusin",()=>{try{v()}catch{}},!0),v()},kt=async()=>{const e=!((await W()).overlayEnabled??!0);await nt({overlayEnabled:e}),await Q(e),e&&v()},It=t=>{t.ctrlKey===P.ctrlKey&&t.shiftKey===P.shiftKey&&t.key.toLowerCase()===P.key&&(t.preventDefault(),kt().catch(e=>L("Toggle failed",e)))},et=async()=>{const e=(await W()).overlayEnabled??!0;await Q(e),Nt(),window.addEventListener("keydown",It)};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{et().catch(t=>L("Init failed",t))},{once:!0}):et().catch(t=>L("Init failed",t))})();
//# sourceMappingURL=index.js.map
