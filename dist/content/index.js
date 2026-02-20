(function(){"use strict";const E={OVERLAY_ENABLED:"overlayEnabled",TMDB_API_KEY:"tmdbApiKey",TMDB_CACHE:"tmdbCache",TMDB_FEATURE_CACHE:"tmdbFeatureCache",MATCH_PROFILE:"matchProfile",LETTERBOXD_INDEX:"lb_index_v1",LETTERBOXD_STATS:"lb_stats_v1",LAST_IMPORT_AT:"lastImportAt"},u=(...e)=>{console.log("[Netflix+Letterboxd]",...e)},Y=e=>e?e.toLowerCase().replace(/&/g," and ").replace(/[^a-z0-9']+/g," ").replace(/\s+/g," ").trim():"",ie=(e,t)=>{const o=Y(e),n=t?String(t):"";return`${o}-${n}`},ae=(e,t)=>ie(e,t),V=async()=>(u("Loading storage state"),chrome.storage.local.get([E.OVERLAY_ENABLED,E.TMDB_API_KEY,E.TMDB_CACHE,E.TMDB_FEATURE_CACHE,E.MATCH_PROFILE,E.LETTERBOXD_INDEX,E.LETTERBOXD_STATS,E.LAST_IMPORT_AT])),re=async e=>{u("Saving storage state",e),await chrome.storage.local.set(e)},se=["[role='dialog']","[aria-modal='true']","[aria-expanded='true']","[data-uia*='jawbone']","[class*='jawbone']","[data-uia*='preview']","[data-uia*='billboard']","[data-uia*='hero']","[data-uia*='details']"],le=["h1","h2","h3","[data-uia*='title']","[class*='title']","[class*='fallback']","[class*='preview'] [class*='header']"],ce=["video","img","[data-uia*='preview'] video","[data-uia*='preview'] img","[class*='preview'] video","[class*='preview'] img","[data-uia*='player'] video","[data-uia*='hero'] img"],q=["[data-uia*='controls']","[class*='controls']","[class*='control']","[role='toolbar']"],z=/(S\d+\s*:?\s*E\d+|Season\s*\d+\s*Episode\s*\d+|Episode\s*\d+|\bE\d+\b)/i,W=/(\b\d+\s*(m|min|minutes)\b|\b\d+\s*of\s*\d+\s*(m|min|minutes)\b)/i,de=/\b(tv-[a-z0-9]+|pg-?13|pg|tv-ma|tv-y|tv-g|nr|nc-17|hd|uhd|4k|seasons?|season|episode|volume|part\s+\d+)\b/i,j=["[data-uia*='maturity-rating']","[data-uia*='season']","[data-uia*='resolution']","[data-uia*='hd']","[class*='maturity']","[class*='season']","[class*='quality']"],F=["[data-uia*='genre']","a[href*='/genre/']","[class*='genre']"],K=[...j,...F,"[data-uia*='metadata']","[class*='metadata']","[class*='meta']","[class*='maturity']","[class*='season']","[class*='genre']","[class*='tag']","[class*='info']"],ue=["header","nav","[data-uia*='header']","[data-uia*='row-title']","[class*='rowHeader']","[class*='row-title']"],L=["h1","h2","h3","h4","[data-uia*='title']","[class*='title']","[class*='headline']","[class*='header']","[class*='name']"],fe=/(browse|home|my list|popular|your next watch|explore all|movies & shows|movies and shows|new & popular)/i,y=e=>{const t=e.getBoundingClientRect();if(t.width===0||t.height===0)return!1;const o=window.getComputedStyle(e);return o.visibility==="hidden"||o.display==="none"||o.opacity==="0"?!1:t.bottom>=0&&t.right>=0&&t.top<=window.innerHeight&&t.left<=window.innerWidth},x=e=>{if(!e)return;const t=e.replace(/\s+/g," ").trim();return t.length?t:void 0},pe=e=>{if(!e)return;const t=e.match(/\/title\/(\d+)/);return t==null?void 0:t[1]},ge=e=>{if(!e)return;const t=e.match(/(19\d{2}|20\d{2})/);if(!t)return;const o=Number(t[1]);if(!Number.isNaN(o))return o},C=e=>{if(!e)return;let t=e;return t=t.replace(/^\s*S\d+\s*:?\s*E\d+\s*/i,""),t=t.replace(/"[^"]*"/g,o=>{const n=o.replace(/"/g,"");return z.test(n)?"":o}),t=t.replace(/Episode\s*\d+/gi,""),t=t.replace(/\bE\d+\b/gi,""),t=t.replace(W,""),t=t.replace(/\s+of\s+\d+\s*(m|min|minutes)?/gi,""),t=t.replace(/\s+/g," ").trim(),t.length?t:void 0},he=e=>{for(const t of le){const o=e.querySelector(t);if(o&&y(o)){const n=x(o.textContent);if(n)return n}}},me=e=>{if(e)return he(e)},U=e=>{if(!e)return null;const t=[];return ce.forEach(o=>{e.querySelectorAll(o).forEach(n=>{y(n)&&t.push(n)})}),t.length?t.reduce((o,n)=>{const i=o.getBoundingClientRect(),l=n.getBoundingClientRect(),r=i.width*i.height;return l.width*l.height>r?n:o}):null},D=e=>{var i;if(!e)return null;const t=[];q.forEach(l=>{e.querySelectorAll(l).forEach(r=>{y(r)&&t.push(r)})});const n=Array.from(new Set(t)).map(l=>{const r=l.querySelectorAll("button, [role='button']").length,s=l.getBoundingClientRect(),a=r*10+s.width;return{el:l,score:a,top:s.top}}).filter(l=>l.score>0);return n.sort((l,r)=>r.score-l.score||r.top-l.top),((i=n[0])==null?void 0:i.el)??null},Ee=e=>{if(!e)return!1;const t=[...j,...F].join(",");return Array.from(e.querySelectorAll(t)).some(n=>y(n))},be=e=>!!e.closest(K.join(",")),ye=e=>!!e.closest(ue.join(",")),v=e=>fe.test(e)||de.test(e)?!0:z.test(e)||W.test(e)||/\b\d+\s*of\s*\d+\s*(m|min|minutes)?\b/i.test(e)||/\b\d+\s*(m|min|minutes)\b/i.test(e),N=(e,t)=>e.closest('[role="progressbar"], [data-uia*="progress"], [class*="progress"]')?!0:t!==void 0?e.getBoundingClientRect().bottom>=t-8:!1,xe=e=>{const t=e.getBoundingClientRect(),o=D(e),n=o?o.getBoundingClientRect().top:void 0,i=Array.from(e.querySelectorAll(L.join(",")));let l,r=0;const s=[];if(i.forEach(c=>{if(!y(c)){r+=1;return}if(N(c,n)){r+=1;return}const d=x(c.textContent);if(!d||d.length<2||d.length>80){r+=1;return}if(v(d)){s.push(c),r+=1;return}const g=c.getBoundingClientRect(),m=window.getComputedStyle(c),h=parseFloat(m.fontSize)||14,p=m.fontWeight==="bold"?700:Number(m.fontWeight),f=Number.isNaN(p)?400:p,O=g.left-t.left,b=g.top-t.top,Ge=Math.hypot(O,b),$e=be(c)||ye(c)?120:0,oe=h*10+f/10+Math.max(0,300-Ge)-$e;(!l||oe>l.score)&&(l={el:c,score:oe,text:d})}),l)return{title:C(l.text)??l.text,chosen:l.el,rejectedCount:r};for(const c of s){let d=c.parentElement,g=0;for(;d&&g<4;){const m=Array.from(d.querySelectorAll(L.join(","))).filter(h=>h!==c);for(const h of m){if(!y(h)||N(h,n))continue;const p=x(h.textContent);if(!(!p||p.length<2||p.length>80)&&!v(p))return{title:C(p)??p,chosen:h,rejectedCount:r}}d=d.parentElement,g+=1}}const a=e.querySelector("a[href^='/title/']");if(a){const c=a.querySelector(L.join(",")),d=x((c==null?void 0:c.textContent)||a.textContent);if(d&&!v(d))return{title:C(d)??d,chosen:c??a,rejectedCount:r};let g=a.parentElement,m=0;for(;g&&m<4;){const h=Array.from(g.querySelectorAll(L.join(",")));for(const p of h){if(!y(p)||N(p,n))continue;const f=x(p.textContent);if(!(!f||f.length<2||f.length>80)&&!v(f))return{title:C(f)??f,chosen:p,rejectedCount:r}}g=g.parentElement,m+=1}}return{title:null,rejectedCount:r}},Te=e=>{const o=Array.from(e.querySelectorAll(K.join(","))).map(a=>x(a.textContent)).filter(Boolean);if(!o.length){const a=D(e),c=a==null?void 0:a.nextElementSibling,d=x(c==null?void 0:c.textContent);d&&o.push(d)}const n=o.join(" "),i=ge(n),l=/\bseasons?\b/i.test(n),r=/\b\d+\s*(m|min|minutes)\b/i.test(n)||/\b\d+\s*h\b/i.test(n);let s;return l?s=!0:r&&(s=!1),{year:i,isSeries:s}},we=e=>{var o,n;const t=[e.getAttribute("aria-label"),e.getAttribute("title"),(o=e.querySelector("img[alt]"))==null?void 0:o.alt,(n=e.querySelector("[aria-label]"))==null?void 0:n.getAttribute("aria-label"),e.textContent];for(const i of t){const l=x(i);if(l&&!v(l))return l}},Ae=()=>{const e=Ce(),t=window.innerWidth*.85,o=window.innerHeight*.6;for(const n of e){const i=n.getBoundingClientRect();if(i.width>t||i.height>o)continue;const l=U(n),r=D(n),s=Ee(n);if(!l||!r)continue;const a=n.querySelector("a[href^='/title/']");if(!a)continue;const c=xe(n);let d=c.title??null;if(!d&&a){const b=we(a);b&&(d=C(b)??b)}if(!d&&!s)continue;if(!d&&s){const b=me(n);b&&!v(b)&&(d=C(b)??b)}if(!d)continue;const g=(a==null?void 0:a.getAttribute("href"))??null,m=pe(g)??null,{year:h,isSeries:p}=Te(n),f=Y(d);if(!f)continue;return{jawboneEl:n,extracted:{rawTitle:d,normalizedTitle:f,year:h??null,isSeries:p,netflixId:m,href:g},rejectedCount:c.rejectedCount,chosenTitleElement:c.chosen}}return{jawboneEl:null,extracted:null}},_e=()=>{const e=se.join(","),t=Array.from(document.querySelectorAll(e)),o=t.filter(y),n=window.innerWidth*.85,i=window.innerHeight*.6,l=o.filter(r=>{const s=r.getBoundingClientRect();return!(s.width===0||s.height===0||s.width<240||s.height<180||s.width>n||s.height>i)});return l.length>0?l.sort((r,s)=>{const a=r.getBoundingClientRect(),c=s.getBoundingClientRect();return c.width*c.height-a.width*a.height}):o.length>0?o:t},Ce=()=>{const e=_e();if(e.length)return e;const t=Array.from(document.querySelectorAll(q.join(","))),o=window.innerWidth*.85,n=window.innerHeight*.6,i=new Set;return t.forEach(l=>{let r=l,s=0;for(;r&&s<6;){if(r instanceof HTMLElement){const a=r.getBoundingClientRect();if(a.width>=240&&a.height>=180&&a.width<=o&&a.height<=n&&U(r)){i.add(r);break}}r=r.parentElement,s+=1}}),Array.from(i)},ve="nxlb-top-section",Re=()=>{const e=document.createElement("div");e.id=ve,e.style.display="block",e.style.width="100%",e.style.pointerEvents="none";const t=e.attachShadow({mode:"open"}),o=document.createElement("style");o.textContent=`
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
  `;const n=document.createElement("div");n.className="nxl-top-section";const i=document.createElement("div");i.className="nxl-header";const l=document.createElement("div");l.className="nxl-branding",l.innerHTML=`
    Powered by
    <span class="nxl-dots">
      <span class="nxl-dot green"></span>
      <span class="nxl-dot orange"></span>
      <span class="nxl-dot blue"></span>
    </span>
    Letterboxd
  `,i.appendChild(l);const r=document.createElement("div");r.className="nxl-body";const s=document.createElement("div");s.className="nxl-rating",s.dataset.field="communityRating",s.textContent="Community rating: —";const a=document.createElement("div");a.className="nxl-match",a.dataset.field="match",a.textContent="Your match: —";const c=document.createElement("div");c.className="nxl-because",c.dataset.field="because",c.textContent="Because you like: —";const d=document.createElement("div");return d.className="nxl-badges",d.dataset.field="badges",r.appendChild(s),r.appendChild(a),r.appendChild(c),r.appendChild(d),n.appendChild(i),n.appendChild(r),t.appendChild(o),t.appendChild(n),e},Se=e=>e==null?"":e>=1e6?`${(e/1e6).toFixed(1)}M`:e>=1e3?`${(e/1e3).toFixed(1)}K`:`${e}`,Le=e=>{const t=Math.max(0,Math.min(5,e)),o=Math.floor(t),n=t%1>=.5;return"★".repeat(o)+(n?"½":"")},X=(e,t)=>{var c,d,g,m,h,p;const o=((c=t.tmdb)==null?void 0:c.voteAverage)??null,n=((d=t.tmdb)==null?void 0:d.voteCount)??null,i=t.letterboxd,l=(g=e.shadowRoot)==null?void 0:g.querySelector("[data-field='communityRating']");if(l)if(o!=null){const f=Se(n),O=o/2;l.innerHTML=`
        Community rating:
        <span class="nxl-star">★</span>
        ${O.toFixed(1)}${f?` <span class="nxl-meta">${f} ratings</span>`:""}
      `}else l.textContent="Community rating: —";const r=(m=e.shadowRoot)==null?void 0:m.querySelector("[data-field='match']");r&&((i==null?void 0:i.matchPercent)!==null&&(i==null?void 0:i.matchPercent)!==void 0?r.innerHTML=`Your match: <span class="nxl-match-value">${i.matchPercent}%</span>`:r.textContent="Your match: —");const s=(h=e.shadowRoot)==null?void 0:h.querySelector("[data-field='because']");if(s){const f=(i==null?void 0:i.becauseYouLike)??[];s.textContent=f.length>0?`Because you like: ${f.join(", ")}`:"Because you like: —"}const a=(p=e.shadowRoot)==null?void 0:p.querySelector("[data-field='badges']");if(a){if(a.innerHTML="",i!=null&&i.inWatchlist){const f=document.createElement("span");f.className="nxl-badge",f.textContent="On your watchlist",a.appendChild(f)}if((i==null?void 0:i.userRating)!==null&&(i==null?void 0:i.userRating)!==void 0){const f=document.createElement("span");f.className="nxl-badge",f.textContent=`You rated ${Le(i.userRating)}`,a.appendChild(f)}if(!(i!=null&&i.inWatchlist)&&(i==null?void 0:i.userRating)===void 0){const f=document.createElement("span");f.className="nxl-badge",f.textContent="Letterboxd: —",a.appendChild(f)}}},Oe=()=>{let e=null,t=null,o=null;const n=()=>{t||(t=Re())};return{mount:a=>{n(),t&&e!==a&&(t.remove(),a.insertBefore(t,a.firstChild),e=a,requestAnimationFrame(()=>{t==null||t.classList.add("nxl-visible")}))},update:a=>{o=a,t&&X(t,a)},unmount:()=>{t&&t.remove(),e=null},renderLast:()=>{t&&o&&X(t,o)},getLastData:()=>o,getCurrentRoot:()=>e,isMounted:()=>!!(t&&t.isConnected)}},G="nxlb-status-badge",De=()=>{const e=document.createElement("div");e.id=G,e.style.position="fixed",e.style.bottom="16px",e.style.right="16px",e.style.zIndex="2147483647",e.style.pointerEvents="none";const t=e.attachShadow({mode:"open"}),o=document.createElement("style");o.textContent=`
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
  `;const n=document.createElement("div");return n.className="badge",n.innerHTML=`
    <span class="dots">
      <span class="dot orange"></span>
      <span class="dot green"></span>
      <span class="dot blue"></span>
    </span>
    <span>Letterboxd</span>
    <span class="status" aria-hidden="true"></span>
    <span class="tooltip">Netflix × Letterboxd overlay enabled</span>
  `,t.appendChild(o),t.appendChild(n),e},R=e=>{const t=document.getElementById(G);if(!e){t&&(t.remove(),u("OVERLAY_BADGE_REMOVED"));return}if(t)return;const o=De();document.documentElement.appendChild(o),u("OVERLAY_BADGE_MOUNTED")},B={ctrlKey:!0,shiftKey:!0,key:"l"},Ne=250,Be=2e3,Ie=.85,Me=.6,T=Oe();let w=!0,$="",J=null,I,M,Q="",S=null,A=!1,Z=null;const ee=()=>window,He=e=>{if(!e)return!1;const t=e.getBoundingClientRect();return t.width===0||t.height===0?!1:t.width>window.innerWidth*Ie||t.height>window.innerHeight*Me},H=e=>{S&&S!==e&&(S.style.outline="",S.style.outlineOffset="",S=null),e&&(e.style.outline="1px solid rgba(255, 80, 80, 0.85)",e.style.outlineOffset="-1px",S=e)},ke=()=>window.location.pathname.includes("/watch/"),te=()=>Array.from(document.querySelectorAll("video")).some(t=>{if(t.paused||t.ended)return!1;const o=t.getBoundingClientRect();if(o.width===0||o.height===0)return!1;const n=o.width/window.innerWidth,i=o.height/window.innerHeight;return n>.85||i>.6}),Pe=()=>!!document.querySelector("[data-uia*='video-player'], [class*='VideoPlayer'], [class*='watch-video'], [data-uia*='player']"),Ye=()=>!!(ke()||te()||Pe()&&te()),k=()=>{const e=Ye();e!==A&&(A=e,A?(R(!1),u("BADGE_HIDDEN_PLAYBACK"),T.unmount()):w&&(R(!0),u("BADGE_SHOWN"),u("BROWSE_MODE_DETECTED")))},Ve=()=>{if(!w){R(!1);return}A||(R(!0),u("BADGE_SHOWN"))},qe=e=>[e.normalizedTitle??"",e.year??"",e.netflixId??"",e.href??""].join("|"),ze=(e,t)=>({title:e,year:t??null,tmdb:{id:null,voteAverage:null,voteCount:null},letterboxd:{inWatchlist:!1,userRating:null,matchPercent:null,becauseYouLike:[]}}),P=e=>{if(!w||(k(),A))return;u("OVERLAY_MOUNT_ATTEMPT",{reason:e});const t=Ae(),o=t.jawboneEl,n=t.extracted;if(!o||!n){u("OVERLAY_MOUNT_FAILED",{reason:"no-jawbone"}),T.unmount(),H(null);return}if(He(o)){u("OVERLAY_MOUNT_FAILED",{reason:"hero-sized"}),T.unmount(),H(null);return}u("ACTIVE_JAWBONE_FOUND",{rawTitle:n.rawTitle,netflixId:n.netflixId,year:n.year,isSeries:n.isSeries,rejectedTitleCandidates:t.rejectedCount,chosenTitleElement:t.chosenTitleElement?t.chosenTitleElement.outerHTML.slice(0,200):void 0}),u("EXTRACTED_TITLE_INFO",n);const i=qe(n);if(i===$&&o===J){u("OVERLAY_MOUNT_SUCCESS",{reused:!0});return}$=i,J=o,H(o),T.mount(o),T.update(ze(n.rawTitle,n.year??void 0));const l=`req_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;Q=l;const r={type:"RESOLVE_OVERLAY_DATA",requestId:l,payload:n};u("OVERLAY_REQUEST",{titleText:n.rawTitle,normalizedTitle:n.normalizedTitle,href:n.href,year:n.year}),chrome.runtime.sendMessage(r).then(s=>{var a,c,d,g,m;if((s==null?void 0:s.type)==="OVERLAY_DATA_RESOLVED"&&s.requestId===Q){Z=s.payload,u("OVERLAY_RESPONSE",{requestId:l,tmdb:s.payload.tmdb,letterboxd:{inWatchlist:((a=s.payload.letterboxd)==null?void 0:a.inWatchlist)??!1,userRating:((c=s.payload.letterboxd)==null?void 0:c.userRating)??null,matchPercent:((d=s.payload.letterboxd)==null?void 0:d.matchPercent)??null,becauseYouLikeCount:((m=(g=s.payload.letterboxd)==null?void 0:g.becauseYouLike)==null?void 0:m.length)??0}}),T.update(s.payload);{const h=s.payload.letterboxd;if(!h||!h.inWatchlist&&h.userRating===null){const p=ae(n.rawTitle,n.year??void 0);chrome.storage.local.get([E.LETTERBOXD_INDEX]).then(f=>{f[E.LETTERBOXD_INDEX]?n.year?u("LB_MATCH_NOT_FOUND",{reason:"no-key",key:p}):u("LB_MATCH_NOT_FOUND",{reason:"missing-year",key:p}):u("LB_MATCH_NOT_FOUND",{reason:"no-index",key:p})})}}}}).catch(s=>{u("Title resolve failed",{requestId:l,err:s})})},_=e=>{I&&window.clearTimeout(I),I=window.setTimeout(()=>{P(e)},Ne)},We=()=>{new MutationObserver(()=>{try{_("mutation")}catch(t){u("Mutation observer failed",{error:t})}}).observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class","style","aria-expanded","aria-hidden"]}),document.addEventListener("pointerover",()=>{try{_("pointer")}catch(t){u("Pointer observer failed",{error:t})}},!0),document.addEventListener("focusin",()=>{try{_("focus")}catch(t){u("Focus observer failed",{error:t})}},!0),M&&window.clearInterval(M),M=window.setInterval(()=>{w&&(k(),!A&&(T.isMounted()||P("watchdog")))},Be),_("init")},je=async()=>{const t=!((await V())[E.OVERLAY_ENABLED]??!0);await re({[E.OVERLAY_ENABLED]:t}),w=t,t?(Ve(),_("toggle")):(T.unmount(),R(!1)),u("Overlay toggled",{enabled:t})},Fe=e=>{e.ctrlKey===B.ctrlKey&&e.shiftKey===B.shiftKey&&e.key.toLowerCase()===B.key&&(e.preventDefault(),je().catch(t=>u("Toggle failed",t)))},Ke=()=>{chrome.runtime.onMessage.addListener(e=>{if((e==null?void 0:e.type)==="LB_INDEX_UPDATED"){u("LB_INDEX_UPDATED"),_("lb-index-updated");return}(e==null?void 0:e.type)==="LB_INDEX_UPDATED_ACK"&&(u("LB_INDEX_UPDATED_ACK",e.payload),_("lb-index-updated"))})},Ue=()=>{const e=ee();e.__nxlDebug={getLbIndex:async()=>chrome.storage.local.get(E.LETTERBOXD_INDEX),lastOverlayData:()=>Z,forceResolve:()=>P("force")}},Xe=async()=>{const e=ee();if(e.__nxlBooted)return;e.__nxlBooted=!0,w=(await V())[E.OVERLAY_ENABLED]??!0,k(),w&&!A&&(R(!0),u("BADGE_SHOWN"),u("BROWSE_MODE_DETECTED")),We(),Ke(),Ue(),window.addEventListener("keydown",Fe)},ne=async()=>{await Xe()};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{ne().catch(e=>u("Init failed",e))},{once:!0}):ne().catch(e=>u("Init failed",e))})();
//# sourceMappingURL=index.js.map
