(function(){"use strict";const m={OVERLAY_ENABLED:"overlayEnabled",TMDB_API_KEY:"tmdbApiKey",TMDB_CACHE:"tmdbCache",TMDB_FEATURE_CACHE:"tmdbFeatureCache",MATCH_PROFILE:"matchProfile",LETTERBOXD_INDEX:"lb_index_v1",LETTERBOXD_STATS:"lb_stats_v1",LAST_IMPORT_AT:"lastImportAt"},N=(...e)=>{},F=async()=>chrome.storage.local.get([m.OVERLAY_ENABLED,m.TMDB_API_KEY,m.TMDB_CACHE,m.TMDB_FEATURE_CACHE,m.MATCH_PROFILE,m.LETTERBOXD_INDEX,m.LETTERBOXD_STATS,m.LAST_IMPORT_AT]),ut=async e=>{await chrome.storage.local.set(e)},K="a[href^='/title/']",B=["[role='dialog']","[aria-modal='true']","[aria-expanded='true']","[data-uia*='jawbone']","[class*='jawbone']","[data-uia*='preview']","[data-uia*='billboard']","[data-uia*='hero']","[data-uia*='details']"],ft=B.join(","),j=["h1","h2","h3","[data-uia*='title']","[class*='title']","[class*='fallback']","[class*='preview'] [class*='header']"],pt=["video","img","[data-uia*='preview'] video","[data-uia*='preview'] img","[class*='preview'] video","[class*='preview'] img","[data-uia*='player'] video","[data-uia*='hero'] img"],ht=["[data-uia*='controls']","[class*='controls']","[class*='control']","[role='toolbar']"],O=/(S\d+\s*:?\s*E\d+|Season\s*\d+\s*Episode\s*\d+|Episode\s*\d+|\bE\d+\b)/i,M=/(\b\d+\s*(m|min|minutes)\b|\b\d+\s*of\s*\d+\s*(m|min|minutes)\b)/i,mt=["[data-uia*='maturity-rating']","[data-uia*='season']","[data-uia*='resolution']","[data-uia*='hd']","[class*='maturity']","[class*='season']","[class*='quality']"],gt=["[data-uia*='genre']","a[href*='/genre/']","[class*='genre']"],D=["h1","h2","h3","h4","[data-uia*='title']","[class*='title']","[class*='headline']","[class*='header']","[class*='name']"],xt=/(browse|home|my list|popular)/i,x=e=>{const t=e.getBoundingClientRect();if(t.width===0||t.height===0)return!1;const n=window.getComputedStyle(e);return n.visibility==="hidden"||n.display==="none"||n.opacity==="0"?!1:t.bottom>=0&&t.right>=0&&t.top<=window.innerHeight&&t.left<=window.innerWidth},T=e=>{if(!e)return;const t=e.replace(/\s+/g," ").trim();return t.length?t:void 0},bt=e=>{if(!e)return;const t=e.match(/\/title\/(\d+)/);return t==null?void 0:t[1]},k=e=>{if(!e)return;const t=e.match(/(19\d{2}|20\d{2})/);if(!t)return;const n=Number(t[1]);if(!Number.isNaN(n))return n},y=e=>{if(!e)return;let t=e;return t=t.replace(/^\s*S\d+\s*:?\s*E\d+\s*/i,""),t=t.replace(/"[^"]*"/g,n=>{const o=n.replace(/"/g,"");return O.test(o)?"":n}),t=t.replace(/Episode\s*\d+/gi,""),t=t.replace(/\bE\d+\b/gi,""),t=t.replace(M,""),t=t.replace(/\s+of\s+\d+\s*(m|min|minutes)?/gi,""),t=t.replace(/\s+/g," ").trim(),t.length?t:void 0},X=(e,t)=>{const n=e.getAttribute("href")||void 0,o=bt(n),a=T(e.getAttribute("aria-label")||e.textContent);return{netflixTitleId:o,titleText:a,href:n,source:t}},$=e=>{for(const t of j){const n=e.querySelector(t);if(n&&x(n)){const o=T(n.textContent);if(o)return o}}},yt=e=>{if(e)for(const t of j){const n=Array.from(e.querySelectorAll(t));for(const o of n){if(!x(o))continue;const a=T(o.textContent);if(!a||O.test(a)||M.test(a))continue;const i=y(a);if(i)return i}}},G=e=>{if(!e)return null;const t=[];return pt.forEach(n=>{e.querySelectorAll(n).forEach(o=>{x(o)&&t.push(o)})}),t.length?t.reduce((n,o)=>{const a=n.getBoundingClientRect(),i=o.getBoundingClientRect(),r=a.width*a.height;return i.width*i.height>r?o:n}):null},U=e=>{var a;if(!e)return null;const t=[];ht.forEach(i=>{e.querySelectorAll(i).forEach(r=>{x(r)&&t.push(r)})});const o=Array.from(new Set(t)).map(i=>{const r=i.querySelectorAll("button, [role='button']").length,l=i.getBoundingClientRect(),d=r*10+l.width;return{el:i,score:d,top:l.top}}).filter(i=>i.score>0);return o.sort((i,r)=>r.score-i.score||r.top-i.top),((a=o[0])==null?void 0:a.el)??null},Et=e=>{if(!e)return!1;const t=[...mt,...gt].join(",");return Array.from(e.querySelectorAll(t)).some(o=>x(o))},J=()=>{const e=Q(),t=window.innerWidth*.85,n=window.innerHeight*.6;for(const o of e){const a=o.getBoundingClientRect();if(a.width>t||a.height>n)continue;const i=G(o),r=U(o),l=Et(o);if(i&&r&&l)return o}return null},I=e=>xt.test(e)?!0:O.test(e)||M.test(e)||/\b\d+\s*of\s*\d+\s*(m|min|minutes)?\b/i.test(e)||/\b\d+\s*(m|min|minutes)\b/i.test(e),q=(e,t)=>e.closest('[role="progressbar"], [data-uia*="progress"], [class*="progress"]')?!0:t!==void 0?e.getBoundingClientRect().bottom>=t-8:!1,Tt=e=>{const t=e.getBoundingClientRect(),n=U(e),o=n?n.getBoundingClientRect().top:void 0,a=Array.from(e.querySelectorAll(D.join(",")));let i,r=0;const l=[];if(a.forEach(s=>{if(!x(s)){r+=1;return}if(q(s,o)){r+=1;return}const c=T(s.textContent);if(!c||c.length<2||c.length>80){r+=1;return}if(I(c)){l.push(s),r+=1;return}const f=s.getBoundingClientRect(),p=window.getComputedStyle(s),h=parseFloat(p.fontSize)||14,u=p.fontWeight==="bold"?700:Number(p.fontWeight),b=Number.isNaN(u)?400:u,S=f.left-t.left,_=f.top-t.top,H=Math.hypot(S,_),L=h*10+b/10+Math.max(0,300-H);(!i||L>i.score)&&(i={el:s,score:L,text:c})}),i)return{title:y(i.text)??i.text,chosen:i.el,rejectedCount:r};for(const s of l){let c=s.parentElement,f=0;for(;c&&f<4;){const p=Array.from(c.querySelectorAll(D.join(","))).filter(h=>h!==s);for(const h of p){if(!x(h)||q(h,o))continue;const u=T(h.textContent);if(!(!u||u.length<2||u.length>80)&&!I(u))return{title:y(u)??u,chosen:h,rejectedCount:r}}c=c.parentElement,f+=1}}const d=e.querySelector("a[href^='/title/']");if(d){const s=d.querySelector(D.join(",")),c=T((s==null?void 0:s.textContent)||d.textContent);if(c&&!I(c))return{title:y(c)??c,chosen:s??d,rejectedCount:r};let f=d.parentElement,p=0;for(;f&&p<4;){const h=Array.from(f.querySelectorAll(D.join(",")));for(const u of h){if(!x(u)||q(u,o))continue;const b=T(u.textContent);if(!(!b||b.length<2||b.length>80)&&!I(b))return{title:y(b)??b,chosen:u,rejectedCount:r}}f=f.parentElement,p+=1}}return{title:null,rejectedCount:r}},P=(e,t)=>{const n=yt(e);if(n)return n;const o=y(t);if(o&&!O.test(o))return o;if(t)return y(t)??t},wt=e=>{const t=Array.from(e.querySelectorAll(K)),n=t.filter(x);return n.length>0?n[0]:t[0]},Q=()=>{const e=B.join(","),t=Array.from(document.querySelectorAll(e)),n=t.filter(x),o=window.innerWidth*.85,a=window.innerHeight*.6,i=n.filter(r=>{const l=r.getBoundingClientRect();return!(l.width===0||l.height===0||l.width<240||l.height<180||l.width>o||l.height>a)});return i.length>0?i.sort((r,l)=>{const d=r.getBoundingClientRect(),s=l.getBoundingClientRect();return s.width*s.height-d.width*d.height}):n.length>0?n:t},vt=()=>{const e=Q();for(const n of e){const o=wt(n);if(o){const i=X(o,"container-anchor");if(i.netflixTitleId||i.titleText){const r=i.titleText??$(n),l=P(n,r??i.titleText);return{candidate:{...i,titleText:l,year:k(l??r)},container:n}}}const a=$(n);if(a){const i=P(n,a);return{candidate:{titleText:i??a,year:k(i??a),source:"container-text"},container:n}}}const t=Array.from(document.querySelectorAll(K)).find(x);if(t){const n=X(t,"page-anchor"),o=P(t.closest(B.join(","))??t.parentElement,n.titleText);return{candidate:{...n,titleText:o??n.titleText,year:k(o??n.titleText)},container:t.closest(B.join(","))??t.parentElement}}return{candidate:null,container:null}},Ct="nxlb-top-section",Rt=()=>{const e=document.createElement("div");e.id=Ct,e.style.display="block",e.style.width="100%",e.style.pointerEvents="none";const t=e.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=`
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
    .nxl-badges {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.85);
    }
    .nxl-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.18);
      background: rgba(255, 255, 255, 0.06);
    }
  `;const o=document.createElement("div");o.className="nxl-top-section";const a=document.createElement("div");a.className="nxl-header";const i=document.createElement("div");i.className="nxl-branding",i.innerHTML=`
    Powered by
    <span class="nxl-dots">
      <span class="nxl-dot green"></span>
      <span class="nxl-dot orange"></span>
      <span class="nxl-dot blue"></span>
    </span>
    Letterboxd
  `,a.appendChild(i);const r=document.createElement("div");r.className="nxl-body";const l=document.createElement("div");l.className="nxl-rating",l.dataset.field="communityRating",l.textContent="Community rating: —";const d=document.createElement("div");d.className="nxl-match",d.dataset.field="match",d.textContent="Your match: —";const s=document.createElement("div");s.className="nxl-because",s.dataset.field="because",s.textContent="Because you like: —";const c=document.createElement("div");return c.className="nxl-badges",c.dataset.field="badges",r.appendChild(l),r.appendChild(d),r.appendChild(s),r.appendChild(c),o.appendChild(a),o.appendChild(r),t.appendChild(n),t.appendChild(o),e},At=e=>e===void 0?"":e>=1e6?`${(e/1e6).toFixed(1)}M`:e>=1e3?`${(e/1e3).toFixed(1)}K`:`${e}`,St=e=>{const t=Math.max(0,Math.min(5,e)),n=Math.floor(t),o=t%1>=.5;return"★".repeat(n)+(o?"½":"")},Z=(e,t)=>{var r,l,d,s;const n=(r=e.shadowRoot)==null?void 0:r.querySelector("[data-field='communityRating']");if(n)if(t.communityRating!==void 0){const c=At(t.ratingCount);n.innerHTML=`
        Community rating:
        <span class="nxl-star">★</span>
        ${t.communityRating.toFixed(1)}${c?` <span class="nxl-meta">${c} ratings</span>`:""}
      `}else n.textContent="Community rating: —";const o=(l=e.shadowRoot)==null?void 0:l.querySelector("[data-field='match']");o&&(t.matchScore!==void 0?o.innerHTML=`Your match: <span class="nxl-match-value">${t.matchScore}%</span>`:o.textContent="Your match: —");const a=(d=e.shadowRoot)==null?void 0:d.querySelector("[data-field='because']");a&&(a.textContent=t.matchExplanation?`Because you like: ${t.matchExplanation.replace(/^Because you like\s*/i,"")}`:"Because you like: —");const i=(s=e.shadowRoot)==null?void 0:s.querySelector("[data-field='badges']");if(i){if(i.innerHTML="",t.inWatchlist){const c=document.createElement("span");c.className="nxl-badge",c.textContent="On watchlist",i.appendChild(c)}if(t.userRating!==void 0){const c=document.createElement("span");c.className="nxl-badge",c.textContent=`You rated ${St(t.userRating)}`,i.appendChild(c)}if(!t.inWatchlist&&t.userRating===void 0){const c=document.createElement("span");c.className="nxl-badge",c.textContent="Letterboxd: —",i.appendChild(c)}}},_t=()=>{let e=null,t=null,n={};const o=()=>{t||(t=Rt())};return{mount:d=>{o(),t&&e!==d&&(t.remove(),d.insertBefore(t,d.firstChild),e=d,requestAnimationFrame(()=>{t==null||t.classList.add("nxl-visible")}))},update:d=>{n={...n,...d},t&&Z(t,n)},unmount:()=>{t&&t.remove(),e=null},renderLast:()=>{t&&Z(t,n)},getLastData:()=>n,getCurrentRoot:()=>e,isMounted:()=>!!(t&&t.isConnected)}},tt="nxlb-status-badge",Lt=()=>{const e=document.createElement("div");e.id=tt,e.style.position="fixed",e.style.bottom="16px",e.style.right="16px",e.style.zIndex="2147483647",e.style.pointerEvents="none";const t=e.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=`
    :host {
      all: initial;
      font-family: "Netflix Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 999px;
      padding: 8px 12px;
      color: #f5f5f5;
      font-size: 12px;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.35);
      pointer-events: auto;
      position: relative;
    }
    .dots {
      display: inline-flex;
      gap: 4px;
      align-items: center;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
    .dot.orange { background: #f2b34c; }
    .dot.green { background: #00c46a; }
    .dot.blue { background: #4aa8ff; }
    .status {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #46d369;
      box-shadow: 0 0 6px rgba(70, 211, 105, 0.6);
    }
    .tooltip {
      position: absolute;
      bottom: calc(100% + 8px);
      right: 0;
      background: rgba(0, 0, 0, 0.9);
      color: #f5f5f5;
      font-size: 11px;
      padding: 6px 8px;
      border-radius: 8px;
      opacity: 0;
      transform: translateY(4px);
      transition: opacity 120ms ease, transform 120ms ease;
      white-space: nowrap;
      pointer-events: none;
    }
    .badge:hover .tooltip {
      opacity: 1;
      transform: translateY(0);
    }
  `;const o=document.createElement("div");return o.className="badge",o.innerHTML=`
    <span class="dots">
      <span class="dot orange"></span>
      <span class="dot green"></span>
      <span class="dot blue"></span>
    </span>
    <span>Letterboxd</span>
    <span class="status" aria-hidden="true"></span>
    <span class="tooltip">Netflix × Letterboxd overlay enabled</span>
  `,t.appendChild(n),t.appendChild(o),e},C=e=>{const t=document.getElementById(tt);if(!e){t&&t.remove();return}if(t)return;const n=Lt();document.documentElement.appendChild(n)},z={ctrlKey:!0,shiftKey:!0,key:"l"},Nt=250,Bt=2e3,Ot=.85,Dt=.6,E=_t();let w=!0,et="",nt=null,V,W,ot="",A=null,v=!1,it=null;const rt=()=>window,It=e=>{if(!e)return!1;const t=e.getBoundingClientRect();return t.width===0||t.height===0?!1:t.width>window.innerWidth*Ot||t.height>window.innerHeight*Dt},at=e=>{A&&A!==e&&(A.style.outline="",A.style.outlineOffset="",A=null)},Ht=()=>window.location.pathname.includes("/watch/"),st=()=>Array.from(document.querySelectorAll("video")).some(t=>{if(t.paused||t.ended)return!1;const n=t.getBoundingClientRect();if(n.width===0||n.height===0)return!1;const o=n.width/window.innerWidth,a=n.height/window.innerHeight;return o>.85||a>.6}),Mt=()=>!!document.querySelector("[data-uia*='video-player'], [class*='VideoPlayer'], [class*='watch-video'], [data-uia*='player']"),kt=()=>!!(Ht()||st()||Mt()&&st()),Y=()=>{const e=kt();e!==v&&(v=e,v?(C(!1),E.unmount()):w&&C(!0))},qt=()=>{if(!w){C(!1);return}v||C(!0)},Pt=(e,t,n)=>[e??"",t??"",n??""].join("|"),zt=e=>{if(!e)return;const t=e.match(/(19\d{2}|20\d{2})/);if(!t)return;const n=Number(t[1]);return Number.isNaN(n)?void 0:n},Vt=()=>{const e=Array.from(document.querySelectorAll(":hover"));if(!e.length)return null;const t=e.map(a=>a.closest(ft)??a).filter(Boolean);let n=null,o=0;return t.forEach(a=>{const i=a.getBoundingClientRect();if(i.width===0||i.height===0)return;const r=i.width*i.height;r>o&&(o=r,n=a)}),n},ct=e=>{var r,l;if(!w||(Y(),v))return;const t=[],n=vt(),o=J()??n.container;t.push({name:"detect-active",root:o,candidate:n.candidate});const a=J();t.push({name:"expanded-root",root:a,candidate:null});const i=Vt();t.push({name:"hovered",root:i,candidate:null});for(const d of t){const s=d.root;if(!s||It(s)||!G(s))continue;const f=s.querySelector("a[href^='/title/']"),p=(f==null?void 0:f.getAttribute("href"))??void 0,h=p==null?void 0:p.match(/\/title\/(\d+)/),u=(h==null?void 0:h[1])??((r=d.candidate)==null?void 0:r.netflixTitleId),S=Tt(s).title??((l=d.candidate)==null?void 0:l.titleText);if(!S)continue;const _=y(S)??S,H=zt(_),L=Pt(_,H,p);if(L===et&&s===nt)return;et=L,nt=s,at(s),E.mount(s),E.update({});const dt=`req_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;ot=dt;const $t={type:"RESOLVE_TITLE",requestId:dt,payload:{netflixTitleId:u,titleText:_,year:H,href:p}};chrome.runtime.sendMessage($t).then(g=>{(g==null?void 0:g.type)==="TITLE_RESOLVED"&&g.requestId===ot&&(it=g.payload,E.update({communityRating:g.payload.tmdbVoteAverage,ratingCount:g.payload.tmdbVoteCount,matchScore:g.payload.matchScore,matchExplanation:g.payload.matchExplanation,inWatchlist:g.payload.inWatchlist,userRating:g.payload.userRating}))}).catch(g=>{});return}E.unmount(),at(null)},R=e=>{V&&window.clearTimeout(V),V=window.setTimeout(()=>{ct()},Nt)},Wt=()=>{new MutationObserver(()=>{try{R("mutation")}catch{}}).observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class","style","aria-expanded","aria-hidden"]}),document.addEventListener("pointerover",()=>{try{R("pointer")}catch{}},!0),document.addEventListener("focusin",()=>{try{R("focus")}catch{}},!0),W&&window.clearInterval(W),W=window.setInterval(()=>{w&&(Y(),!v&&(E.isMounted()||ct()))},Bt),R()},Yt=async()=>{const t=!((await F())[m.OVERLAY_ENABLED]??!0);await ut({[m.OVERLAY_ENABLED]:t}),w=t,t?(qt(),R()):(E.unmount(),C(!1))},Ft=e=>{e.ctrlKey===z.ctrlKey&&e.shiftKey===z.shiftKey&&e.key.toLowerCase()===z.key&&(e.preventDefault(),Yt().catch(t=>N("Toggle failed",t)))},Kt=()=>{chrome.runtime.onMessage.addListener(e=>{(e==null?void 0:e.type)==="LB_INDEX_UPDATED_ACK"&&(N("LB_INDEX_UPDATED_ACK",e.payload),R())})},jt=()=>{const e=rt();e.__nxlDebug={getIndex:async()=>chrome.storage.local.get(m.LETTERBOXD_INDEX),forceRerender:()=>E.renderLast(),lastResolved:()=>it}},Xt=async()=>{const e=rt();if(e.__nxlBooted)return;e.__nxlBooted=!0,w=(await F())[m.OVERLAY_ENABLED]??!0,Y(),w&&!v&&C(!0),Wt(),Kt(),jt(),window.addEventListener("keydown",Ft)},lt=async()=>{await Xt()};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{lt().catch(e=>N("Init failed",e))},{once:!0}):lt().catch(e=>N("Init failed",e))})();
//# sourceMappingURL=index.js.map
