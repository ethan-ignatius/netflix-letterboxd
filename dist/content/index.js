(function(){"use strict";const E={OVERLAY_ENABLED:"overlayEnabled",TMDB_API_KEY:"tmdbApiKey",TMDB_CACHE:"tmdbCache",TMDB_FEATURE_CACHE:"tmdbFeatureCache",MATCH_PROFILE:"matchProfile",LETTERBOXD_INDEX:"lb_index_v1",LETTERBOXD_STATS:"lb_stats_v1",LAST_IMPORT_AT:"lastImportAt"},u=(...t)=>{console.log("[Netflix+Letterboxd]",...t)},V=t=>t?t.toLowerCase().replace(/&/g," and ").replace(/[^a-z0-9']+/g," ").replace(/\s+/g," ").trim():"",st=(t,e)=>{const o=V(t),n=e?String(e):"";return`${o}-${n}`},lt=(t,e)=>st(t,e),q=async()=>(u("Loading storage state"),chrome.storage.local.get([E.OVERLAY_ENABLED,E.TMDB_API_KEY,E.TMDB_CACHE,E.TMDB_FEATURE_CACHE,E.MATCH_PROFILE,E.LETTERBOXD_INDEX,E.LETTERBOXD_STATS,E.LAST_IMPORT_AT])),ct=async t=>{u("Saving storage state",t),await chrome.storage.local.set(t)},dt=["[role='dialog']","[aria-modal='true']","[aria-expanded='true']","[data-uia*='jawbone']","[class*='jawbone']","[data-uia*='preview']","[data-uia*='billboard']","[data-uia*='hero']","[data-uia*='details']"],ut=["h1","h2","h3","[data-uia*='title']","[class*='title']","[class*='fallback']","[class*='preview'] [class*='header']"],ft=["video","img","[data-uia*='preview'] video","[data-uia*='preview'] img","[class*='preview'] video","[class*='preview'] img","[data-uia*='player'] video","[data-uia*='hero'] img"],z=["[data-uia*='controls']","[class*='controls']","[class*='control']","[role='toolbar']"],W=/(S\d+\s*:?\s*E\d+|Season\s*\d+\s*Episode\s*\d+|Episode\s*\d+|\bE\d+\b)/i,j=/(\b\d+\s*(m|min|minutes)\b|\b\d+\s*of\s*\d+\s*(m|min|minutes)\b)/i,ht=/\b(tv-[a-z0-9]+|pg-?13|pg|tv-ma|tv-y|tv-g|nr|nc-17|hd|uhd|4k|seasons?|season|episode|volume|part\s+\d+)\b/i,gt=/^(play|resume|continue|more info|details|watch|watch now|watch again|add|added|my list|remove|rate|like|dislike|thumbs up|thumbs down)$/i,pt=/because you watched/i,F=["[data-uia*='maturity-rating']","[data-uia*='season']","[data-uia*='resolution']","[data-uia*='hd']","[class*='maturity']","[class*='season']","[class*='quality']"],X=["[data-uia*='genre']","a[href*='/genre/']","[class*='genre']"],K=[...F,...X,"[data-uia*='metadata']","[class*='metadata']","[class*='meta']","[class*='maturity']","[class*='season']","[class*='genre']","[class*='tag']","[class*='info']"],mt=["header","nav","[data-uia*='header']","[data-uia*='row-title']","[class*='rowHeader']","[class*='row-title']"],O=["h1","h2","h3","h4","[data-uia*='title']","[class*='title']","[class*='headline']","[class*='header']","[class*='name']"],Et=/(browse|home|my list|popular|your next watch|explore all|movies & shows|movies and shows|new & popular)/i,y=t=>{const e=t.getBoundingClientRect();if(e.width===0||e.height===0)return!1;const o=window.getComputedStyle(t);return o.visibility==="hidden"||o.display==="none"||o.opacity==="0"?!1:e.bottom>=0&&e.right>=0&&e.top<=window.innerHeight&&e.left<=window.innerWidth},x=t=>{if(!t)return;const e=t.replace(/\s+/g," ").trim();return e.length?e:void 0},bt=t=>{if(!t)return;const e=t.match(/\/title\/(\d+)/);return e==null?void 0:e[1]},yt=t=>{if(!t)return;const e=t.match(/(19\d{2}|20\d{2})/);if(!e)return;const o=Number(e[1]);if(!Number.isNaN(o))return o},C=t=>{if(!t)return;let e=t;return e=e.replace(/^\s*S\d+\s*:?\s*E\d+\s*/i,""),e=e.replace(/"[^"]*"/g,o=>{const n=o.replace(/"/g,"");return W.test(n)?"":o}),e=e.replace(/Episode\s*\d+/gi,""),e=e.replace(/\bE\d+\b/gi,""),e=e.replace(j,""),e=e.replace(/\s+of\s+\d+\s*(m|min|minutes)?/gi,""),e=e.replace(/\s+/g," ").trim(),e.length?e:void 0},xt=t=>{for(const e of ut){const o=t.querySelector(e);if(o&&y(o)){const n=x(o.textContent);if(n)return n}}},Tt=t=>{if(t)return xt(t)},U=t=>{if(!t)return null;const e=[];return ft.forEach(o=>{t.querySelectorAll(o).forEach(n=>{y(n)&&e.push(n)})}),e.length?e.reduce((o,n)=>{const i=o.getBoundingClientRect(),l=n.getBoundingClientRect(),r=i.width*i.height;return l.width*l.height>r?n:o}):null},N=t=>{var i;if(!t)return null;const e=[];z.forEach(l=>{t.querySelectorAll(l).forEach(r=>{y(r)&&e.push(r)})});const n=Array.from(new Set(e)).map(l=>{const r=l.querySelectorAll("button, [role='button']").length,a=l.getBoundingClientRect(),s=r*10+a.width;return{el:l,score:s,top:a.top}}).filter(l=>l.score>0);return n.sort((l,r)=>r.score-l.score||r.top-l.top),((i=n[0])==null?void 0:i.el)??null},wt=t=>{if(!t)return!1;const e=[...F,...X].join(",");return Array.from(t.querySelectorAll(e)).some(n=>y(n))},At=t=>!!t.closest(K.join(",")),G=t=>!!t.closest(mt.join(",")),R=t=>Et.test(t)||gt.test(t.trim())||pt.test(t)||ht.test(t)?!0:W.test(t)||j.test(t)||/\b\d+\s*of\s*\d+\s*(m|min|minutes)?\b/i.test(t)||/\b\d+\s*(m|min|minutes)\b/i.test(t),B=(t,e)=>t.closest('[role="progressbar"], [data-uia*="progress"], [class*="progress"]')?!0:e!==void 0?t.getBoundingClientRect().bottom>=e-8:!1,L=(t,e)=>t?e&&(e.contains(t)||t.closest("button, [role='button']"))?!0:!!t.closest("button, [role='button'], [data-uia*='play'], [data-uia*='button']"):!1,_t=t=>{const e=t.getBoundingClientRect(),o=N(t),n=o?o.getBoundingClientRect().top:void 0,i=Array.from(t.querySelectorAll(O.join(",")));let l,r=0;const a=[];if(i.forEach(c=>{if(!y(c)){r+=1;return}if(L(c,o)){r+=1;return}if(B(c,n)){r+=1;return}const d=x(c.textContent);if(!d||d.length<2||d.length>80){r+=1;return}if(R(d)){a.push(c),r+=1;return}const p=c.getBoundingClientRect(),m=window.getComputedStyle(c),g=parseFloat(m.fontSize)||14,h=m.fontWeight==="bold"?700:Number(m.fontWeight),f=Number.isNaN(h)?400:h,D=p.left-e.left,b=p.top-e.top,Zt=Math.hypot(D,b),te=At(c)||G(c)?120:0,rt=g*10+f/10+Math.max(0,300-Zt)-te;(!l||rt>l.score)&&(l={el:c,score:rt,text:d})}),l)return{title:C(l.text)??l.text,chosen:l.el,rejectedCount:r};for(const c of a){let d=c.parentElement,p=0;for(;d&&p<4;){const m=Array.from(d.querySelectorAll(O.join(","))).filter(g=>g!==c);for(const g of m){if(!y(g)||L(g,o)||B(g,n))continue;const h=x(g.textContent);if(!(!h||h.length<2||h.length>80)&&!R(h))return{title:C(h)??h,chosen:g,rejectedCount:r}}d=d.parentElement,p+=1}}const s=t.querySelector("a[href^='/title/']");if(s){const c=s.querySelector(O.join(",")),d=x((c==null?void 0:c.textContent)||s.textContent);if(d&&!R(d))return{title:C(d)??d,chosen:c??s,rejectedCount:r};let p=s.parentElement,m=0;for(;p&&m<4;){const g=Array.from(p.querySelectorAll(O.join(",")));for(const h of g){if(!y(h)||L(h,o)||B(h,n))continue;const f=x(h.textContent);if(!(!f||f.length<2||f.length>80)&&!R(f))return{title:C(f)??f,chosen:h,rejectedCount:r}}p=p.parentElement,m+=1}}return{title:null,rejectedCount:r}},Ct=t=>{const o=Array.from(t.querySelectorAll(K.join(","))).map(s=>x(s.textContent)).filter(Boolean);if(!o.length){const s=N(t),c=s==null?void 0:s.nextElementSibling,d=x(c==null?void 0:c.textContent);d&&o.push(d)}const n=o.join(" "),i=yt(n),l=/\bseasons?\b/i.test(n),r=/\b\d+\s*(m|min|minutes)\b/i.test(n)||/\b\d+\s*h\b/i.test(n);let a;return l?a=!0:r&&(a=!1),{year:i,isSeries:a}},$=t=>{var o,n;const e=[t.getAttribute("aria-label"),t.getAttribute("title"),(o=t.querySelector("img[alt]"))==null?void 0:o.alt,(n=t.querySelector("[aria-label]"))==null?void 0:n.getAttribute("aria-label"),t.textContent];for(const i of e){const l=x(i);if(l&&!R(l))return l}},Rt=(t,e,o)=>{const i=Array.from(t.querySelectorAll("a[href^='/title/']")).filter(a=>y(a));if(!i.length)return null;const l=e==null?void 0:e.getBoundingClientRect();let r=null;return i.forEach(a=>{if(G(a)||L(a,o))return;const s=a.getBoundingClientRect(),c=s.width*s.height;let d=0;if(e&&(a.contains(e)||e.contains(a))&&(d+=1e3),l){const m=s.left+s.width/2-(l.left+l.width/2),g=s.top+s.height/2-(l.top+l.height/2),h=Math.hypot(m,g);d+=Math.max(0,500-h)}d+=Math.min(c/100,200),$(a)&&(d+=50),(!r||d>r.score)&&(r={anchor:a,score:d})}),(r==null?void 0:r.anchor)??null},vt=()=>{const t=Ot(),e=window.innerWidth*.85,o=window.innerHeight*.6;for(const n of t){const i=n.getBoundingClientRect();if(i.width>e||i.height>o)continue;const l=U(n),r=N(n),a=wt(n);if(!l||!r)continue;const s=Rt(n,l,r),c=_t(n);let d=c.title??null;if(s){const b=$(s);b&&(d=C(b)??b)}if(!d&&!a)continue;if(!d&&a){const b=Tt(n);b&&!R(b)&&(d=C(b)??b)}if(!d)continue;const p=(s==null?void 0:s.getAttribute("href"))??null,m=bt(p)??null,{year:g,isSeries:h}=Ct(n),f=V(d);if(!f)continue;return{jawboneEl:n,extracted:{rawTitle:d,normalizedTitle:f,year:g??null,isSeries:h,netflixId:m,href:p},rejectedCount:c.rejectedCount,chosenTitleElement:c.chosen}}return{jawboneEl:null,extracted:null}},St=()=>{const t=dt.join(","),e=Array.from(document.querySelectorAll(t)),o=e.filter(y),n=window.innerWidth*.85,i=window.innerHeight*.6,l=o.filter(r=>{const a=r.getBoundingClientRect();return!(a.width===0||a.height===0||a.width<240||a.height<180||a.width>n||a.height>i)});return l.length>0?l.sort((r,a)=>{const s=r.getBoundingClientRect(),c=a.getBoundingClientRect();return c.width*c.height-s.width*s.height}):o.length>0?o:e},Ot=()=>{const t=St();if(t.length)return t;const e=Array.from(document.querySelectorAll(z.join(","))),o=window.innerWidth*.85,n=window.innerHeight*.6,i=new Set;return e.forEach(l=>{let r=l,a=0;for(;r&&a<6;){if(r instanceof HTMLElement){const s=r.getBoundingClientRect();if(s.width>=240&&s.height>=180&&s.width<=o&&s.height<=n&&U(r)){i.add(r);break}}r=r.parentElement,a+=1}}),Array.from(i)},Lt="nxlb-top-section",Dt=()=>{const t=document.createElement("div");t.id=Lt,t.style.display="block",t.style.width="100%",t.style.pointerEvents="none";const e=t.attachShadow({mode:"open"}),o=document.createElement("style");o.textContent=`
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
  `,i.appendChild(l);const r=document.createElement("div");r.className="nxl-body";const a=document.createElement("div");a.className="nxl-rating",a.dataset.field="communityRating",a.textContent="Community rating: —";const s=document.createElement("div");s.className="nxl-match",s.dataset.field="match",s.textContent="Your match: —";const c=document.createElement("div");c.className="nxl-because",c.dataset.field="because",c.textContent="Because you like: —";const d=document.createElement("div");return d.className="nxl-badges",d.dataset.field="badges",r.appendChild(a),r.appendChild(s),r.appendChild(c),r.appendChild(d),n.appendChild(i),n.appendChild(r),e.appendChild(o),e.appendChild(n),t},Nt=t=>t==null?"":t>=1e6?`${(t/1e6).toFixed(1)}M`:t>=1e3?`${(t/1e3).toFixed(1)}K`:`${t}`,Bt=t=>{const e=Math.max(0,Math.min(5,t)),o=Math.floor(e),n=e%1>=.5;return"★".repeat(o)+(n?"½":"")},J=(t,e)=>{var c,d,p,m,g,h;const o=((c=e.tmdb)==null?void 0:c.voteAverage)??null,n=((d=e.tmdb)==null?void 0:d.voteCount)??null,i=e.letterboxd,l=(p=t.shadowRoot)==null?void 0:p.querySelector("[data-field='communityRating']");if(l)if(o!=null){const f=Nt(n),D=o/2;l.innerHTML=`
        Community rating:
        <span class="nxl-star">★</span>
        ${D.toFixed(1)}${f?` <span class="nxl-meta">${f} ratings</span>`:""}
      `}else l.textContent="Community rating: —";const r=(m=t.shadowRoot)==null?void 0:m.querySelector("[data-field='match']");r&&((i==null?void 0:i.matchPercent)!==null&&(i==null?void 0:i.matchPercent)!==void 0?r.innerHTML=`Your match: <span class="nxl-match-value">${i.matchPercent}%</span>`:r.textContent="Your match: —");const a=(g=t.shadowRoot)==null?void 0:g.querySelector("[data-field='because']");if(a){const f=(i==null?void 0:i.becauseYouLike)??[];a.textContent=f.length>0?`Because you like: ${f.join(", ")}`:"Because you like: —"}const s=(h=t.shadowRoot)==null?void 0:h.querySelector("[data-field='badges']");if(s){if(s.innerHTML="",i!=null&&i.inWatchlist){const f=document.createElement("span");f.className="nxl-badge",f.textContent="On your watchlist",s.appendChild(f)}if((i==null?void 0:i.userRating)!==null&&(i==null?void 0:i.userRating)!==void 0){const f=document.createElement("span");f.className="nxl-badge",f.textContent=`You rated ${Bt(i.userRating)}`,s.appendChild(f)}if(!(i!=null&&i.inWatchlist)&&(i==null?void 0:i.userRating)===void 0){const f=document.createElement("span");f.className="nxl-badge",f.textContent="Letterboxd: —",s.appendChild(f)}}},It=()=>{let t=null,e=null,o=null;const n=()=>{e||(e=Dt())};return{mount:s=>{n(),e&&t!==s&&(e.remove(),s.insertBefore(e,s.firstChild),t=s,requestAnimationFrame(()=>{e==null||e.classList.add("nxl-visible")}))},update:s=>{o=s,e&&J(e,s)},unmount:()=>{e&&e.remove(),t=null},renderLast:()=>{e&&o&&J(e,o)},getLastData:()=>o,getCurrentRoot:()=>t,isMounted:()=>!!(e&&e.isConnected)}},Q="nxlb-status-badge",Mt=()=>{const t=document.createElement("div");t.id=Q,t.style.position="fixed",t.style.bottom="16px",t.style.right="16px",t.style.zIndex="2147483647",t.style.pointerEvents="none";const e=t.attachShadow({mode:"open"}),o=document.createElement("style");o.textContent=`
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
  `,e.appendChild(o),e.appendChild(n),t},v=t=>{const e=document.getElementById(Q);if(!t){e&&(e.remove(),u("OVERLAY_BADGE_REMOVED"));return}if(e)return;const o=Mt();document.documentElement.appendChild(o),u("OVERLAY_BADGE_MOUNTED")},I={ctrlKey:!0,shiftKey:!0,key:"l"},Ht=250,kt=2e3,Pt=.85,Yt=.6,T=It();let w=!0,Z="",tt=null,M,H,et="",S=null,A=!1,nt=null;const ot=()=>window,Vt=t=>{if(!t)return!1;const e=t.getBoundingClientRect();return e.width===0||e.height===0?!1:e.width>window.innerWidth*Pt||e.height>window.innerHeight*Yt},k=t=>{S&&S!==t&&(S.style.outline="",S.style.outlineOffset="",S=null),t&&(t.style.outline="1px solid rgba(255, 80, 80, 0.85)",t.style.outlineOffset="-1px",S=t)},qt=()=>window.location.pathname.includes("/watch/"),it=()=>Array.from(document.querySelectorAll("video")).some(e=>{if(e.paused||e.ended)return!1;const o=e.getBoundingClientRect();if(o.width===0||o.height===0)return!1;const n=o.width/window.innerWidth,i=o.height/window.innerHeight;return n>.85||i>.6}),zt=()=>!!document.querySelector("[data-uia*='video-player'], [class*='VideoPlayer'], [class*='watch-video'], [data-uia*='player']"),Wt=()=>!!(qt()||it()||zt()&&it()),P=()=>{const t=Wt();t!==A&&(A=t,A?(v(!1),u("BADGE_HIDDEN_PLAYBACK"),T.unmount()):w&&(v(!0),u("BADGE_SHOWN"),u("BROWSE_MODE_DETECTED")))},jt=()=>{if(!w){v(!1);return}A||(v(!0),u("BADGE_SHOWN"))},Ft=t=>[t.normalizedTitle??"",t.year??"",t.netflixId??"",t.href??""].join("|"),Xt=(t,e)=>({title:t,year:e??null,tmdb:{id:null,voteAverage:null,voteCount:null},letterboxd:{inWatchlist:!1,userRating:null,matchPercent:null,becauseYouLike:[]}}),Y=t=>{if(!w||(P(),A))return;u("OVERLAY_MOUNT_ATTEMPT",{reason:t});const e=vt(),o=e.jawboneEl,n=e.extracted;if(!o||!n){u("OVERLAY_MOUNT_FAILED",{reason:"no-jawbone"}),T.unmount(),k(null);return}if(Vt(o)){u("OVERLAY_MOUNT_FAILED",{reason:"hero-sized"}),T.unmount(),k(null);return}u("ACTIVE_JAWBONE_FOUND",{rawTitle:n.rawTitle,netflixId:n.netflixId,year:n.year,isSeries:n.isSeries,rejectedTitleCandidates:e.rejectedCount,chosenTitleElement:e.chosenTitleElement?e.chosenTitleElement.outerHTML.slice(0,200):void 0}),u("EXTRACTED_TITLE_INFO",n);const i=Ft(n);if(i===Z&&o===tt){u("OVERLAY_MOUNT_SUCCESS",{reused:!0});return}Z=i,tt=o,k(o),T.mount(o),T.update(Xt(n.rawTitle,n.year??void 0));const l=`req_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;et=l;const r={type:"RESOLVE_OVERLAY_DATA",requestId:l,payload:n};u("OVERLAY_REQUEST",{titleText:n.rawTitle,normalizedTitle:n.normalizedTitle,href:n.href,year:n.year}),chrome.runtime.sendMessage(r).then(a=>{var s,c,d,p,m;if((a==null?void 0:a.type)==="OVERLAY_DATA_RESOLVED"&&a.requestId===et){nt=a.payload,u("OVERLAY_RESPONSE",{requestId:l,tmdb:a.payload.tmdb,letterboxd:{inWatchlist:((s=a.payload.letterboxd)==null?void 0:s.inWatchlist)??!1,userRating:((c=a.payload.letterboxd)==null?void 0:c.userRating)??null,matchPercent:((d=a.payload.letterboxd)==null?void 0:d.matchPercent)??null,becauseYouLikeCount:((m=(p=a.payload.letterboxd)==null?void 0:p.becauseYouLike)==null?void 0:m.length)??0}}),T.update(a.payload);{const g=a.payload.letterboxd;if(!g||!g.inWatchlist&&g.userRating===null){const h=lt(n.rawTitle,n.year??void 0);chrome.storage.local.get([E.LETTERBOXD_INDEX]).then(f=>{f[E.LETTERBOXD_INDEX]?n.year?u("LB_MATCH_NOT_FOUND",{reason:"no-key",key:h}):u("LB_MATCH_NOT_FOUND",{reason:"missing-year",key:h}):u("LB_MATCH_NOT_FOUND",{reason:"no-index",key:h})})}}}}).catch(a=>{u("Title resolve failed",{requestId:l,err:a})})},_=t=>{M&&window.clearTimeout(M),M=window.setTimeout(()=>{Y(t)},Ht)},Kt=()=>{new MutationObserver(()=>{try{_("mutation")}catch(e){u("Mutation observer failed",{error:e})}}).observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class","style","aria-expanded","aria-hidden"]}),document.addEventListener("pointerover",()=>{try{_("pointer")}catch(e){u("Pointer observer failed",{error:e})}},!0),document.addEventListener("focusin",()=>{try{_("focus")}catch(e){u("Focus observer failed",{error:e})}},!0),H&&window.clearInterval(H),H=window.setInterval(()=>{w&&(P(),!A&&(T.isMounted()||Y("watchdog")))},kt),_("init")},Ut=async()=>{const e=!((await q())[E.OVERLAY_ENABLED]??!0);await ct({[E.OVERLAY_ENABLED]:e}),w=e,e?(jt(),_("toggle")):(T.unmount(),v(!1)),u("Overlay toggled",{enabled:e})},Gt=t=>{t.ctrlKey===I.ctrlKey&&t.shiftKey===I.shiftKey&&t.key.toLowerCase()===I.key&&(t.preventDefault(),Ut().catch(e=>u("Toggle failed",e)))},$t=()=>{chrome.runtime.onMessage.addListener(t=>{if((t==null?void 0:t.type)==="LB_INDEX_UPDATED"){u("LB_INDEX_UPDATED"),_("lb-index-updated");return}(t==null?void 0:t.type)==="LB_INDEX_UPDATED_ACK"&&(u("LB_INDEX_UPDATED_ACK",t.payload),_("lb-index-updated"))})},Jt=()=>{const t=ot();t.__nxlDebug={getLbIndex:async()=>chrome.storage.local.get(E.LETTERBOXD_INDEX),lastOverlayData:()=>nt,forceResolve:()=>Y("force")}},Qt=async()=>{const t=ot();if(t.__nxlBooted)return;t.__nxlBooted=!0,w=(await q())[E.OVERLAY_ENABLED]??!0,P(),w&&!A&&(v(!0),u("BADGE_SHOWN"),u("BROWSE_MODE_DETECTED")),Kt(),$t(),Jt(),window.addEventListener("keydown",Gt)},at=async()=>{await Qt()};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{at().catch(t=>u("Init failed",t))},{once:!0}):at().catch(t=>u("Init failed",t))})();
//# sourceMappingURL=index.js.map
