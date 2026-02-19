(function(){"use strict";const g={OVERLAY_ENABLED:"overlayEnabled",TMDB_API_KEY:"tmdbApiKey",TMDB_CACHE:"tmdbCache",TMDB_FEATURE_CACHE:"tmdbFeatureCache",MATCH_PROFILE:"matchProfile",LETTERBOXD_INDEX:"lb_index_v1",LETTERBOXD_STATS:"lb_stats_v1",LAST_IMPORT_AT:"lastImportAt"},E=(...n)=>{},W=async()=>chrome.storage.local.get([g.OVERLAY_ENABLED,g.TMDB_API_KEY,g.TMDB_CACHE,g.TMDB_FEATURE_CACHE,g.MATCH_PROFILE,g.LETTERBOXD_INDEX,g.LETTERBOXD_STATS,g.LAST_IMPORT_AT]),O="a[href^='/title/']",v=["[role='dialog']","[aria-modal='true']","[aria-expanded='true']","[data-uia*='jawbone']","[class*='jawbone']","[data-uia*='preview']","[data-uia*='billboard']","[data-uia*='hero']","[data-uia*='details']"],j=v.join(","),I=["h1","h2","h3","[data-uia*='title']","[class*='title']","[class*='fallback']","[class*='preview'] [class*='header']"],X=["video","img","[data-uia*='preview'] video","[data-uia*='preview'] img","[class*='preview'] video","[class*='preview'] img","[data-uia*='player'] video","[data-uia*='hero'] img"],$=["[data-uia*='controls']","[class*='controls']","[class*='control']","[role='toolbar']"],T=/(S\d+\s*:?\s*E\d+|Season\s*\d+\s*Episode\s*\d+|Episode\s*\d+|\bE\d+\b)/i,R=/(\b\d+\s*(m|min|minutes)\b|\b\d+\s*of\s*\d+\s*(m|min|minutes)\b)/i,K=["[data-uia*='maturity-rating']","[data-uia*='season']","[data-uia*='resolution']","[data-uia*='hd']","[class*='maturity']","[class*='season']","[class*='quality']"],G=["[data-uia*='genre']","a[href*='/genre/']","[class*='genre']"],w=["h1","h2","h3","h4","[data-uia*='title']","[class*='title']","[class*='headline']","[class*='header']","[class*='name']"],U=/(browse|home|my list|popular)/i,m=n=>{const t=n.getBoundingClientRect();if(t.width===0||t.height===0)return!1;const e=window.getComputedStyle(n);return e.visibility==="hidden"||e.display==="none"||e.opacity==="0"?!1:t.bottom>=0&&t.right>=0&&t.top<=window.innerHeight&&t.left<=window.innerWidth},x=n=>{if(!n)return;const t=n.replace(/\s+/g," ").trim();return t.length?t:void 0},J=n=>{if(!n)return;const t=n.match(/\/title\/(\d+)/);return t==null?void 0:t[1]},S=n=>{if(!n)return;const t=n.match(/(19\d{2}|20\d{2})/);if(!t)return;const e=Number(t[1]);if(!Number.isNaN(e))return e},y=n=>{if(!n)return;let t=n;return t=t.replace(/^\s*S\d+\s*:?\s*E\d+\s*/i,""),t=t.replace(/"[^"]*"/g,e=>{const i=e.replace(/"/g,"");return T.test(i)?"":e}),t=t.replace(/Episode\s*\d+/gi,""),t=t.replace(/\bE\d+\b/gi,""),t=t.replace(R,""),t=t.replace(/\s+of\s+\d+\s*(m|min|minutes)?/gi,""),t=t.replace(/\s+/g," ").trim(),t.length?t:void 0},B=(n,t)=>{const e=n.getAttribute("href")||void 0,i=J(e),r=x(n.getAttribute("aria-label")||n.textContent);return{netflixTitleId:i,titleText:r,href:e,source:t}},M=n=>{for(const t of I){const e=n.querySelector(t);if(e&&m(e)){const i=x(e.textContent);if(i)return i}}},Q=n=>{if(n)for(const t of I){const e=Array.from(n.querySelectorAll(t));for(const i of e){if(!m(i))continue;const r=x(i.textContent);if(!r||T.test(r)||R.test(r))continue;const o=y(r);if(o)return o}}},H=n=>{if(!n)return null;const t=[];return X.forEach(e=>{n.querySelectorAll(e).forEach(i=>{m(i)&&t.push(i)})}),t.length?t.reduce((e,i)=>{const r=e.getBoundingClientRect(),o=i.getBoundingClientRect(),s=r.width*r.height;return o.width*o.height>s?i:e}):null},_=n=>{var r;if(!n)return null;const t=[];$.forEach(o=>{n.querySelectorAll(o).forEach(s=>{m(s)&&t.push(s)})});const i=Array.from(new Set(t)).map(o=>{const s=o.querySelectorAll("button, [role='button']").length,a=o.getBoundingClientRect(),c=s*10+a.width;return{el:o,score:c,top:a.top}}).filter(o=>o.score>0);return i.sort((o,s)=>s.score-o.score||s.top-o.top),((r=i[0])==null?void 0:r.el)??null},P=n=>{if(!n)return!1;const t=[...K,...G].join(",");return Array.from(n.querySelectorAll(t)).some(i=>m(i))},Z=()=>{const n=q(),t=window.innerWidth*.85,e=window.innerHeight*.6;for(const i of n){const r=i.getBoundingClientRect();if(r.width>t||r.height>e)continue;const o=H(i),s=_(i),a=P(i);if(o&&s&&a)return i}return null},C=n=>U.test(n)?!0:T.test(n)||R.test(n)||/\b\d+\s*of\s*\d+\s*(m|min|minutes)?\b/i.test(n)||/\b\d+\s*(m|min|minutes)\b/i.test(n),L=(n,t)=>n.closest('[role="progressbar"], [data-uia*="progress"], [class*="progress"]')?!0:t!==void 0?n.getBoundingClientRect().bottom>=t-8:!1,tt=n=>{const t=n.getBoundingClientRect(),e=_(n),i=e?e.getBoundingClientRect().top:void 0,r=Array.from(n.querySelectorAll(w.join(",")));let o,s=0;const a=[];if(r.forEach(l=>{if(!m(l)){s+=1;return}if(L(l,i)){s+=1;return}const u=x(l.textContent);if(!u||u.length<2||u.length>80){s+=1;return}if(C(u)){a.push(l),s+=1;return}const f=l.getBoundingClientRect(),b=window.getComputedStyle(l),p=parseFloat(b.fontSize)||14,h=b.fontWeight==="bold"?700:Number(b.fontWeight),d=Number.isNaN(h)?400:h,N=f.left-t.left,gt=f.top-t.top,mt=Math.hypot(N,gt),F=p*10+d/10+Math.max(0,300-mt);(!o||F>o.score)&&(o={el:l,score:F,text:u})}),o)return{title:y(o.text)??o.text,chosen:o.el,rejectedCount:s};for(const l of a){let u=l.parentElement,f=0;for(;u&&f<4;){const b=Array.from(u.querySelectorAll(w.join(","))).filter(p=>p!==l);for(const p of b){if(!m(p)||L(p,i))continue;const h=x(p.textContent);if(!(!h||h.length<2||h.length>80)&&!C(h))return{title:y(h)??h,chosen:p,rejectedCount:s}}u=u.parentElement,f+=1}}const c=n.querySelector("a[href^='/title/']");if(c){const l=c.querySelector(w.join(",")),u=x((l==null?void 0:l.textContent)||c.textContent);if(u&&!C(u))return{title:y(u)??u,chosen:l??c,rejectedCount:s};let f=c.parentElement,b=0;for(;f&&b<4;){const p=Array.from(f.querySelectorAll(w.join(",")));for(const h of p){if(!m(h)||L(h,i))continue;const d=x(h.textContent);if(!(!d||d.length<2||d.length>80)&&!C(d))return{title:y(d)??d,chosen:h,rejectedCount:s}}f=f.parentElement,b+=1}}return{title:null,rejectedCount:s}},D=(n,t)=>{const e=Q(n);if(e)return e;const i=y(t);if(i&&!T.test(i))return i;if(t)return y(t)??t},et=n=>{const t=Array.from(n.querySelectorAll(O)),e=t.filter(m);return e.length>0?e[0]:t[0]},q=()=>{const n=v.join(","),t=Array.from(document.querySelectorAll(n)),e=t.filter(m),i=window.innerWidth*.85,r=window.innerHeight*.6,o=e.filter(s=>{const a=s.getBoundingClientRect();return!(a.width===0||a.height===0||a.width<240||a.height<180||a.width>i||a.height>r)});return o.length>0?o.sort((s,a)=>{const c=s.getBoundingClientRect(),l=a.getBoundingClientRect();return l.width*l.height-c.width*c.height}):e.length>0?e:t},nt=()=>{const n=q();for(const e of n){const i=et(e);if(i){const o=B(i,"container-anchor");if(o.netflixTitleId||o.titleText){const s=o.titleText??M(e),a=D(e,s??o.titleText);return{candidate:{...o,titleText:a,year:S(a??s)},container:e}}}const r=M(e);if(r){const o=D(e,r);return{candidate:{titleText:o??r,year:S(o??r),source:"container-text"},container:e}}}const t=Array.from(document.querySelectorAll(O)).find(m);if(t){const e=B(t,"page-anchor"),i=D(t.closest(v.join(","))??t.parentElement,e.titleText);return{candidate:{...e,titleText:i??e.titleText,year:S(i??e.titleText)},container:t.closest(v.join(","))??t.parentElement}}return{candidate:null,container:null}},it="nxlb-top-section",rt=()=>{const n=document.createElement("div");n.id=it,n.style.display="block",n.style.width="100%",n.style.pointerEvents="none";const t=n.attachShadow({mode:"open"}),e=document.createElement("style");e.textContent=`
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
  `;const i=document.createElement("div");i.className="nxl-top-section";const r=document.createElement("div");r.className="nxl-header";const o=document.createElement("div");o.className="nxl-branding",o.innerHTML=`
    Powered by
    <span class="nxl-dots">
      <span class="nxl-dot green"></span>
      <span class="nxl-dot orange"></span>
      <span class="nxl-dot blue"></span>
    </span>
    Letterboxd
  `,r.appendChild(o);const s=document.createElement("div");s.className="nxl-body";const a=document.createElement("div");a.className="nxl-rating",a.dataset.field="communityRating",a.textContent="Community rating: —";const c=document.createElement("div");c.className="nxl-match",c.dataset.field="match",c.textContent="Your match: —";const l=document.createElement("div");l.className="nxl-because",l.dataset.field="because",l.textContent="Because you like: —";const u=document.createElement("div");return u.className="nxl-badges",u.dataset.field="badges",s.appendChild(a),s.appendChild(c),s.appendChild(l),s.appendChild(u),i.appendChild(r),i.appendChild(s),t.appendChild(e),t.appendChild(i),n},ot=n=>n==null?"":n>=1e6?`${(n/1e6).toFixed(1)}M`:n>=1e3?`${(n/1e3).toFixed(1)}K`:`${n}`,st=n=>{const t=Math.max(0,Math.min(5,n)),e=Math.floor(t),i=t%1>=.5;return"★".repeat(e)+(i?"½":"")},k=(n,t)=>{var l,u,f,b,p,h;const e=((l=t.tmdb)==null?void 0:l.voteAverage)??null,i=((u=t.tmdb)==null?void 0:u.voteCount)??null,r=t.letterboxd,o=(f=n.shadowRoot)==null?void 0:f.querySelector("[data-field='communityRating']");if(o)if(e!=null){const d=ot(i),N=e/2;o.innerHTML=`
        Community rating:
        <span class="nxl-star">★</span>
        ${N.toFixed(1)}${d?` <span class="nxl-meta">${d} ratings</span>`:""}
      `}else o.textContent="Community rating: —";const s=(b=n.shadowRoot)==null?void 0:b.querySelector("[data-field='match']");s&&((r==null?void 0:r.matchPercent)!==null&&(r==null?void 0:r.matchPercent)!==void 0?s.innerHTML=`Your match: <span class="nxl-match-value">${r.matchPercent}%</span>`:s.textContent="Your match: —");const a=(p=n.shadowRoot)==null?void 0:p.querySelector("[data-field='because']");if(a){const d=(r==null?void 0:r.becauseYouLike)??[];d.length>0?(a.style.display="block",a.textContent=`Because you like: ${d.join(", ")}`):(a.style.display="none",a.textContent="")}const c=(h=n.shadowRoot)==null?void 0:h.querySelector("[data-field='badges']");if(c){if(c.innerHTML="",r!=null&&r.inWatchlist){const d=document.createElement("span");d.className="nxl-badge",d.textContent="On your watchlist",c.appendChild(d)}if((r==null?void 0:r.userRating)!==null&&(r==null?void 0:r.userRating)!==void 0){const d=document.createElement("span");d.className="nxl-badge",d.textContent=`You rated ${st(r.userRating)}`,c.appendChild(d)}if(!(r!=null&&r.inWatchlist)&&(r==null?void 0:r.userRating)===void 0){const d=document.createElement("span");d.className="nxl-badge",d.textContent="Letterboxd: —",c.appendChild(d)}}},at=()=>{let n=null,t=null,e=null;const i=()=>{t||(t=rt())};return{mount:c=>{i(),t&&n!==c&&(t.remove(),c.insertBefore(t,c.firstChild),n=c,requestAnimationFrame(()=>{t==null||t.classList.add("nxl-visible")}))},update:c=>{e=c,t&&k(t,c)},unmount:()=>{t&&t.remove(),n=null},renderLast:()=>{t&&e&&k(t,e)},getLastData:()=>e,getCurrentRoot:()=>n,isMounted:()=>!!(t&&t.isConnected)}},Y="nxlb-status-badge",ct=()=>{const n=document.createElement("div");n.id=Y,n.style.position="fixed",n.style.bottom="16px",n.style.right="16px",n.style.zIndex="2147483647",n.style.pointerEvents="none";const t=n.attachShadow({mode:"open"}),e=document.createElement("style");e.textContent=`
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
  `;const i=document.createElement("div");return i.className="badge",i.innerHTML=`
    <span class="dots">
      <span class="dot orange"></span>
      <span class="dot green"></span>
      <span class="dot blue"></span>
    </span>
    <span>Letterboxd</span>
    <span class="status" aria-hidden="true"></span>
    <span class="tooltip">Netflix × Letterboxd overlay enabled</span>
  `,t.appendChild(e),t.appendChild(i),n},A=n=>{const t=document.getElementById(Y);if(!n){t&&t.remove();return}if(t)return;const e=ct();document.documentElement.appendChild(e)},lt=200,dt=2e3,ut=.85,ht=.6,V=()=>window;class ft{constructor(){this.overlayManager=at(),this.currentCard=null,this.currentExtracted=null,this.currentRequestId="",this.overlayEnabled=!0,this.playbackActive=!1,this.lastData=null}init(){const t=V();t.__nxlBooted||(t.__nxlBooted=!0,this.loadSettings(),this.bindRuntimeMessages(),this.bindStorageListener(),this.bindPlaybackListeners(),this.bindPointerFallback(),this.startObserver(),this.startWatchdog(),this.setDebugHook())}onActiveCardChange(t,e){const i=this.currentExtracted;this.currentCard===t&&i&&i.titleText===e.titleText&&i.netflixTitleId===e.netflixTitleId||(i&&E("ACTIVE_CARD_CHANGED",{from:{title:i.titleText,id:i.netflixTitleId},to:{title:e.titleText,id:e.netflixTitleId}}),this.currentCard=t,this.currentExtracted=e,this.overlayManager.mount(t),this.overlayManager.update(this.buildBlankOverlayData(e)),this.sendOverlayRequest(e))}onSettingsChange(t){if(this.overlayEnabled=t.overlayEnabled,!this.overlayEnabled){this.overlayManager.unmount(),A(!1);return}this.updatePlaybackState(),this.playbackActive||(A(!0),this.currentExtracted&&this.currentCard&&(this.overlayManager.mount(this.currentCard),this.sendOverlayRequest(this.currentExtracted)))}onDataResolved(t){this.lastData=t,this.overlayManager.update(t)}forceRefresh(){!this.currentExtracted||!this.currentCard||this.sendOverlayRequest(this.currentExtracted)}async loadSettings(){const e=(await W())[g.OVERLAY_ENABLED]??!0;this.onSettingsChange({overlayEnabled:e})}sendOverlayRequest(t){if(!this.overlayEnabled||(this.updatePlaybackState(),this.playbackActive))return;const e=`req_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;this.currentRequestId=e;const i={type:"RESOLVE_OVERLAY_DATA",requestId:e,extracted:t};E("OVERLAY_REQUEST_SENT",{titleText:t.titleText,id:t.netflixTitleId}),chrome.runtime.sendMessage(i).then(r=>{if(!(!r||r.type!=="OVERLAY_DATA_RESOLVED")){if(r.requestId!==this.currentRequestId){E("OVERLAY_RESPONSE_IGNORED_STALE",{requestId:r.requestId});return}E("OVERLAY_RESPONSE_RECEIVED",{tmdb:r.payload.tmdb,letterboxd:r.payload.letterboxd}),this.onDataResolved(r.payload),r.error}}).catch(r=>{})}buildBlankOverlayData(t){return{title:t.titleText,year:t.year??null,tmdb:{id:null,voteAverage:null,voteCount:null},letterboxd:{inWatchlist:!1,userRating:null,matchPercent:null,becauseYouLike:[]}}}startObserver(){this.observer&&this.observer.disconnect(),this.observer=new MutationObserver(()=>{this.debounceDetect("mutation")}),this.observer.observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class","style","aria-expanded","aria-hidden"]}),this.debounceDetect("init")}debounceDetect(t){this.debounceTimer&&window.clearTimeout(this.debounceTimer),this.debounceTimer=window.setTimeout(()=>{this.detectActiveCard(t)},lt)}detectActiveCard(t){if(!this.overlayEnabled||(this.updatePlaybackState(),this.playbackActive))return;const e=this.findActiveJawbone();e&&this.onActiveCardChange(e.cardEl,e.extracted)}startWatchdog(){this.watchdogTimer&&window.clearInterval(this.watchdogTimer),this.watchdogTimer=window.setInterval(()=>{this.overlayEnabled&&(this.updatePlaybackState(),!this.playbackActive&&(this.overlayManager.isMounted()||this.detectActiveCard("watchdog")))},dt)}bindPointerFallback(){document.addEventListener("pointerover",()=>{this.debounceDetect("pointer")},!0),document.addEventListener("focusin",()=>{this.debounceDetect("focus")},!0)}bindRuntimeMessages(){chrome.runtime.onMessage.addListener(t=>{if((t==null?void 0:t.type)==="LB_INDEX_UPDATED"){this.forceRefresh();return}(t==null?void 0:t.type)==="LB_INDEX_UPDATED_ACK"&&(E("LB_INDEX_UPDATED_ACK",t.payload),this.forceRefresh())})}bindStorageListener(){chrome.storage.onChanged.addListener(t=>{if(t[g.OVERLAY_ENABLED]){const e=t[g.OVERLAY_ENABLED].newValue;this.onSettingsChange({overlayEnabled:e??!0})}})}bindPlaybackListeners(){window.addEventListener("visibilitychange",()=>this.updatePlaybackState()),window.addEventListener("popstate",()=>this.updatePlaybackState()),window.addEventListener("hashchange",()=>this.updatePlaybackState())}updatePlaybackState(){const t=this.detectPlaybackActive();t!==this.playbackActive&&(this.playbackActive=t,this.playbackActive?(A(!1),this.overlayManager.unmount()):this.overlayEnabled&&A(!0))}detectPlaybackActive(){if(window.location.pathname.includes("/watch/"))return!0;const t=Array.from(document.querySelectorAll("video"));return t.some(r=>{if(r.paused||r.ended)return!1;const o=r.getBoundingClientRect();if(o.width===0||o.height===0)return!1;const s=o.width/window.innerWidth,a=o.height/window.innerHeight;return s>.85||a>.6})?!0:!!(document.querySelector("[data-uia*='video-player'], [class*='VideoPlayer'], [class*='watch-video'], [data-uia*='player']")&&t.length>0)}findActiveJawbone(){const t=[],e=Z();e&&t.push({root:e,strategy:"expanded-root"});const i=nt();i.container instanceof HTMLElement&&t.push({root:i.container,strategy:"detect-active"});const r=this.findHoveredJawbone();r&&t.push({root:r,strategy:"hovered"});for(const o of t){if(!this.isJawbone(o.root))continue;const s=this.extractTitleInfo(o.root,i.candidate??null);if(s)return{cardEl:o.root,extracted:s,strategy:o.strategy}}return null}extractTitleInfo(t,e){const r=tt(t).title??(e==null?void 0:e.titleText);if(!r)return null;const o=t.querySelector("a[href^='/title/']"),s=(o==null?void 0:o.getAttribute("href"))??(e==null?void 0:e.href),a=s==null?void 0:s.match(/\/title\/(\d+)/),c=(a==null?void 0:a[1])??(e==null?void 0:e.netflixTitleId),l=y(r)??r,u=this.parseYearFromText(l)??(e==null?void 0:e.year);return{titleText:l,netflixTitleId:c,year:u,href:s}}parseYearFromText(t){if(!t)return;const e=t.match(/(19\d{2}|20\d{2})/);if(!e)return;const i=Number(e[1]);return Number.isNaN(i)?void 0:i}isJawbone(t){return!(this.isHeroSized(t)||!H(t)||!_(t)||!P(t))}isHeroSized(t){const e=t.getBoundingClientRect();return e.width===0||e.height===0?!1:e.width>window.innerWidth*ut||e.height>window.innerHeight*ht}findHoveredJawbone(){const t=Array.from(document.querySelectorAll(":hover"));if(!t.length)return null;const e=t.map(o=>o.closest(j)??o).filter(Boolean);let i=null,r=0;return e.forEach(o=>{const s=o.getBoundingClientRect();if(s.width===0||s.height===0)return;const a=s.width*s.height;a>r&&(r=a,i=o)}),i}setDebugHook(){const t=V();t.__nxlDebug={getLbIndex:async()=>chrome.storage.local.get("lb_index_v1"),lastOverlayData:()=>this.lastData,forceResolve:()=>this.forceRefresh()}}}const pt=new ft,z=async()=>{pt.init()};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{z().catch(n=>E("Init failed",n))},{once:!0}):z().catch(n=>E("Init failed",n))})();
//# sourceMappingURL=index.js.map
