(function(){"use strict";const m={OVERLAY_ENABLED:"overlayEnabled",TMDB_API_KEY:"tmdbApiKey",TMDB_CACHE:"tmdbCache",TMDB_FEATURE_CACHE:"tmdbFeatureCache",MATCH_PROFILE:"matchProfile",LETTERBOXD_INDEX:"lb_index_v1",LETTERBOXD_STATS:"lb_stats_v1",LAST_IMPORT_AT:"lastImportAt"},S=(...t)=>{},j=async()=>chrome.storage.local.get([m.OVERLAY_ENABLED,m.TMDB_API_KEY,m.TMDB_CACHE,m.TMDB_FEATURE_CACHE,m.MATCH_PROFILE,m.LETTERBOXD_INDEX,m.LETTERBOXD_STATS,m.LAST_IMPORT_AT]),mt=async t=>{await chrome.storage.local.set(t)},X="a[href^='/title/']",D=["[role='dialog']","[aria-modal='true']","[aria-expanded='true']","[data-uia*='jawbone']","[class*='jawbone']","[data-uia*='preview']","[data-uia*='billboard']","[data-uia*='hero']","[data-uia*='details']"],bt=D.join(","),$=["h1","h2","h3","[data-uia*='title']","[class*='title']","[class*='fallback']","[class*='preview'] [class*='header']"],xt=["video","img","[data-uia*='preview'] video","[data-uia*='preview'] img","[class*='preview'] video","[class*='preview'] img","[data-uia*='player'] video","[data-uia*='hero'] img"],yt=["[data-uia*='controls']","[class*='controls']","[class*='control']","[role='toolbar']"],B=/(S\d+\s*:?\s*E\d+|Season\s*\d+\s*Episode\s*\d+|Episode\s*\d+|\bE\d+\b)/i,M=/(\b\d+\s*(m|min|minutes)\b|\b\d+\s*of\s*\d+\s*(m|min|minutes)\b)/i,Et=["[data-uia*='maturity-rating']","[data-uia*='season']","[data-uia*='resolution']","[data-uia*='hd']","[class*='maturity']","[class*='season']","[class*='quality']"],Tt=["[data-uia*='genre']","a[href*='/genre/']","[class*='genre']"],I=["h1","h2","h3","h4","[data-uia*='title']","[class*='title']","[class*='headline']","[class*='header']","[class*='name']"],vt=/(browse|home|my list|popular)/i,x=t=>{const e=t.getBoundingClientRect();if(e.width===0||e.height===0)return!1;const n=window.getComputedStyle(t);return n.visibility==="hidden"||n.display==="none"||n.opacity==="0"?!1:e.bottom>=0&&e.right>=0&&e.top<=window.innerHeight&&e.left<=window.innerWidth},E=t=>{if(!t)return;const e=t.replace(/\s+/g," ").trim();return e.length?e:void 0},wt=t=>{if(!t)return;const e=t.match(/\/title\/(\d+)/);return e==null?void 0:e[1]},P=t=>{if(!t)return;const e=t.match(/(19\d{2}|20\d{2})/);if(!e)return;const n=Number(e[1]);if(!Number.isNaN(n))return n},y=t=>{if(!t)return;let e=t;return e=e.replace(/^\s*S\d+\s*:?\s*E\d+\s*/i,""),e=e.replace(/"[^"]*"/g,n=>{const i=n.replace(/"/g,"");return B.test(i)?"":n}),e=e.replace(/Episode\s*\d+/gi,""),e=e.replace(/\bE\d+\b/gi,""),e=e.replace(M,""),e=e.replace(/\s+of\s+\d+\s*(m|min|minutes)?/gi,""),e=e.replace(/\s+/g," ").trim(),e.length?e:void 0},G=(t,e)=>{const n=t.getAttribute("href")||void 0,i=wt(n),o=E(t.getAttribute("aria-label")||t.textContent);return{netflixTitleId:i,titleText:o,href:n,source:e}},U=t=>{for(const e of $){const n=t.querySelector(e);if(n&&x(n)){const i=E(n.textContent);if(i)return i}}},Ct=t=>{if(t)for(const e of $){const n=Array.from(t.querySelectorAll(e));for(const i of n){if(!x(i))continue;const o=E(i.textContent);if(!o||B.test(o)||M.test(o))continue;const r=y(o);if(r)return r}}},J=t=>{if(!t)return null;const e=[];return xt.forEach(n=>{t.querySelectorAll(n).forEach(i=>{x(i)&&e.push(i)})}),e.length?e.reduce((n,i)=>{const o=n.getBoundingClientRect(),r=i.getBoundingClientRect(),a=o.width*o.height;return r.width*r.height>a?i:n}):null},Q=t=>{var o;if(!t)return null;const e=[];yt.forEach(r=>{t.querySelectorAll(r).forEach(a=>{x(a)&&e.push(a)})});const i=Array.from(new Set(e)).map(r=>{const a=r.querySelectorAll("button, [role='button']").length,c=r.getBoundingClientRect(),l=a*10+c.width;return{el:r,score:l,top:c.top}}).filter(r=>r.score>0);return i.sort((r,a)=>a.score-r.score||a.top-r.top),((o=i[0])==null?void 0:o.el)??null},At=t=>{if(!t)return!1;const e=[...Et,...Tt].join(",");return Array.from(t.querySelectorAll(e)).some(i=>x(i))},Z=()=>{const t=tt(),e=window.innerWidth*.85,n=window.innerHeight*.6;for(const i of t){const o=i.getBoundingClientRect();if(o.width>e||o.height>n)continue;const r=J(i),a=Q(i),c=At(i);if(r&&a&&c)return i}return null},H=t=>vt.test(t)?!0:B.test(t)||M.test(t)||/\b\d+\s*of\s*\d+\s*(m|min|minutes)?\b/i.test(t)||/\b\d+\s*(m|min|minutes)\b/i.test(t),k=(t,e)=>t.closest('[role="progressbar"], [data-uia*="progress"], [class*="progress"]')?!0:e!==void 0?t.getBoundingClientRect().bottom>=e-8:!1,Rt=t=>{const e=t.getBoundingClientRect(),n=Q(t),i=n?n.getBoundingClientRect().top:void 0,o=Array.from(t.querySelectorAll(I.join(",")));let r,a=0;const c=[];if(o.forEach(s=>{if(!x(s)){a+=1;return}if(k(s,i)){a+=1;return}const u=E(s.textContent);if(!u||u.length<2||u.length>80){a+=1;return}if(H(u)){c.push(s),a+=1;return}const p=s.getBoundingClientRect(),h=window.getComputedStyle(s),g=parseFloat(h.fontSize)||14,f=h.fontWeight==="bold"?700:Number(h.fontWeight),d=Number.isNaN(f)?400:f,A=p.left-e.left,_=p.top-e.top,N=Math.hypot(A,_),O=g*10+d/10+Math.max(0,300-N);(!r||O>r.score)&&(r={el:s,score:O,text:u})}),r)return{title:y(r.text)??r.text,chosen:r.el,rejectedCount:a};for(const s of c){let u=s.parentElement,p=0;for(;u&&p<4;){const h=Array.from(u.querySelectorAll(I.join(","))).filter(g=>g!==s);for(const g of h){if(!x(g)||k(g,i))continue;const f=E(g.textContent);if(!(!f||f.length<2||f.length>80)&&!H(f))return{title:y(f)??f,chosen:g,rejectedCount:a}}u=u.parentElement,p+=1}}const l=t.querySelector("a[href^='/title/']");if(l){const s=l.querySelector(I.join(",")),u=E((s==null?void 0:s.textContent)||l.textContent);if(u&&!H(u))return{title:y(u)??u,chosen:s??l,rejectedCount:a};let p=l.parentElement,h=0;for(;p&&h<4;){const g=Array.from(p.querySelectorAll(I.join(",")));for(const f of g){if(!x(f)||k(f,i))continue;const d=E(f.textContent);if(!(!d||d.length<2||d.length>80)&&!H(d))return{title:y(d)??d,chosen:f,rejectedCount:a}}p=p.parentElement,h+=1}}return{title:null,rejectedCount:a}},q=(t,e)=>{const n=Ct(t);if(n)return n;const i=y(e);if(i&&!B.test(i))return i;if(e)return y(e)??e},_t=t=>{const e=Array.from(t.querySelectorAll(X)),n=e.filter(x);return n.length>0?n[0]:e[0]},tt=()=>{const t=D.join(","),e=Array.from(document.querySelectorAll(t)),n=e.filter(x),i=window.innerWidth*.85,o=window.innerHeight*.6,r=n.filter(a=>{const c=a.getBoundingClientRect();return!(c.width===0||c.height===0||c.width<240||c.height<180||c.width>i||c.height>o)});return r.length>0?r.sort((a,c)=>{const l=a.getBoundingClientRect(),s=c.getBoundingClientRect();return s.width*s.height-l.width*l.height}):n.length>0?n:e},St=()=>{const t=tt();for(const n of t){const i=_t(n);if(i){const r=G(i,"container-anchor");if(r.netflixTitleId||r.titleText){const a=r.titleText??U(n),c=q(n,a??r.titleText);return{candidate:{...r,titleText:c,year:P(c??a)},container:n}}}const o=U(n);if(o){const r=q(n,o);return{candidate:{titleText:r??o,year:P(r??o),source:"container-text"},container:n}}}const e=Array.from(document.querySelectorAll(X)).find(x);if(e){const n=G(e,"page-anchor"),i=q(e.closest(D.join(","))??e.parentElement,n.titleText);return{candidate:{...n,titleText:i??n.titleText,year:P(i??n.titleText)},container:e.closest(D.join(","))??e.parentElement}}return{candidate:null,container:null}},Lt="nxlb-top-section",Nt=()=>{const t=document.createElement("div");t.id=Lt,t.style.display="block",t.style.width="100%",t.style.pointerEvents="none";const e=t.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=`
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
  `;const i=document.createElement("div");i.className="nxl-top-section";const o=document.createElement("div");o.className="nxl-header";const r=document.createElement("div");r.className="nxl-branding",r.innerHTML=`
    Powered by
    <span class="nxl-dots">
      <span class="nxl-dot green"></span>
      <span class="nxl-dot orange"></span>
      <span class="nxl-dot blue"></span>
    </span>
    Letterboxd
  `,o.appendChild(r);const a=document.createElement("div");a.className="nxl-body";const c=document.createElement("div");c.className="nxl-rating",c.dataset.field="communityRating",c.textContent="Community rating: —";const l=document.createElement("div");l.className="nxl-match",l.dataset.field="match",l.textContent="Your match: —";const s=document.createElement("div");s.className="nxl-because",s.dataset.field="because",s.textContent="Because you like: —";const u=document.createElement("div");return u.className="nxl-badges",u.dataset.field="badges",a.appendChild(c),a.appendChild(l),a.appendChild(s),a.appendChild(u),i.appendChild(o),i.appendChild(a),e.appendChild(n),e.appendChild(i),t},Ot=t=>t==null?"":t>=1e6?`${(t/1e6).toFixed(1)}M`:t>=1e3?`${(t/1e3).toFixed(1)}K`:`${t}`,Dt=t=>{const e=Math.max(0,Math.min(5,t)),n=Math.floor(e),i=e%1>=.5;return"★".repeat(n)+(i?"½":"")},et=(t,e)=>{var s,u,p,h,g,f;const n=((s=e.tmdb)==null?void 0:s.voteAverage)??null,i=((u=e.tmdb)==null?void 0:u.voteCount)??null,o=e.letterboxd,r=(p=t.shadowRoot)==null?void 0:p.querySelector("[data-field='communityRating']");if(r)if(n!=null){const d=Ot(i),A=n/2;r.innerHTML=`
        Community rating:
        <span class="nxl-star">★</span>
        ${A.toFixed(1)}${d?` <span class="nxl-meta">${d} ratings</span>`:""}
      `}else r.textContent="Community rating: —";const a=(h=t.shadowRoot)==null?void 0:h.querySelector("[data-field='match']");a&&((o==null?void 0:o.matchPercent)!==null&&(o==null?void 0:o.matchPercent)!==void 0?a.innerHTML=`Your match: <span class="nxl-match-value">${o.matchPercent}%</span>`:a.textContent="Your match: —");const c=(g=t.shadowRoot)==null?void 0:g.querySelector("[data-field='because']");if(c){const d=(o==null?void 0:o.becauseYouLike)??[];c.textContent=d.length>0?`Because you like: ${d.join(", ")}`:"Because you like: —"}const l=(f=t.shadowRoot)==null?void 0:f.querySelector("[data-field='badges']");if(l){if(l.innerHTML="",o!=null&&o.inWatchlist){const d=document.createElement("span");d.className="nxl-badge",d.textContent="On your watchlist",l.appendChild(d)}if((o==null?void 0:o.userRating)!==null&&(o==null?void 0:o.userRating)!==void 0){const d=document.createElement("span");d.className="nxl-badge",d.textContent=`You rated ${Dt(o.userRating)}`,l.appendChild(d)}if(!(o!=null&&o.inWatchlist)&&(o==null?void 0:o.userRating)===void 0){const d=document.createElement("span");d.className="nxl-badge",d.textContent="Letterboxd: —",l.appendChild(d)}}},Bt=()=>{let t=null,e=null,n=null;const i=()=>{e||(e=Nt())};return{mount:l=>{i(),e&&t!==l&&(e.remove(),l.insertBefore(e,l.firstChild),t=l,requestAnimationFrame(()=>{e==null||e.classList.add("nxl-visible")}))},update:l=>{n=l,e&&et(e,l)},unmount:()=>{e&&e.remove(),t=null},renderLast:()=>{e&&n&&et(e,n)},getLastData:()=>n,getCurrentRoot:()=>t,isMounted:()=>!!(e&&e.isConnected)}},nt="nxlb-status-badge",It=()=>{const t=document.createElement("div");t.id=nt,t.style.position="fixed",t.style.bottom="16px",t.style.right="16px",t.style.zIndex="2147483647",t.style.pointerEvents="none";const e=t.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=`
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
  `,e.appendChild(n),e.appendChild(i),t},R=t=>{const e=document.getElementById(nt);if(!t){e&&e.remove();return}if(e)return;const n=It();document.documentElement.appendChild(n)},Y={ctrlKey:!0,shiftKey:!0,key:"l"},Ht=250,Mt=2e3,Pt=.85,kt=.6,T=Bt();let v=!0,ot="",it=null,z,V,rt="",L=null,w=!1,at=null;const st=()=>window,qt=t=>{if(!t)return!1;const e=t.getBoundingClientRect();return e.width===0||e.height===0?!1:e.width>window.innerWidth*Pt||e.height>window.innerHeight*kt},lt=t=>{L&&L!==t&&(L.style.outline="",L.style.outlineOffset="",L=null)},Yt=()=>window.location.pathname.includes("/watch/"),ct=()=>Array.from(document.querySelectorAll("video")).some(e=>{if(e.paused||e.ended)return!1;const n=e.getBoundingClientRect();if(n.width===0||n.height===0)return!1;const i=n.width/window.innerWidth,o=n.height/window.innerHeight;return i>.85||o>.6}),zt=()=>!!document.querySelector("[data-uia*='video-player'], [class*='VideoPlayer'], [class*='watch-video'], [data-uia*='player']"),Vt=()=>!!(Yt()||ct()||zt()&&ct()),W=()=>{const t=Vt();t!==w&&(w=t,w?(R(!1),T.unmount()):v&&R(!0))},Wt=()=>{if(!v){R(!1);return}w||R(!0)},Ft=(t,e,n)=>[t??"",e??"",n??""].join("|"),Kt=t=>{if(!t)return;const e=t.match(/(19\d{2}|20\d{2})/);if(!e)return;const n=Number(e[1]);return Number.isNaN(n)?void 0:n},jt=()=>{const t=Array.from(document.querySelectorAll(":hover"));if(!t.length)return null;const e=t.map(o=>o.closest(bt)??o).filter(Boolean);let n=null,i=0;return e.forEach(o=>{const r=o.getBoundingClientRect();if(r.width===0||r.height===0)return;const a=r.width*r.height;a>i&&(i=a,n=o)}),n},Xt=(t,e)=>({title:t,year:e??null,tmdb:{id:null,voteAverage:null,voteCount:null},letterboxd:{inWatchlist:!1,userRating:null,matchPercent:null,becauseYouLike:[]}}),F=t=>{var a,c;if(!v||(W(),w))return;const e=[],n=St(),i=Z()??n.container;e.push({name:"detect-active",root:i,candidate:n.candidate});const o=Z();e.push({name:"expanded-root",root:o,candidate:null});const r=jt();e.push({name:"hovered",root:r,candidate:null});for(const l of e){const s=l.root;if(!s||qt(s)||!J(s))continue;const p=s.querySelector("a[href^='/title/']"),h=(p==null?void 0:p.getAttribute("href"))??void 0,g=h==null?void 0:h.match(/\/title\/(\d+)/),f=(g==null?void 0:g[1])??((a=l.candidate)==null?void 0:a.netflixTitleId),A=Rt(s).title??((c=l.candidate)==null?void 0:c.titleText);if(!A)continue;const _=y(A)??A,N=Kt(_),O=Ft(_,N,h);if(O===ot&&s===it)return;ot=O,it=s,lt(s),T.mount(s),T.update(Xt(_,N));const K=`req_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;rt=K;const te={type:"RESOLVE_OVERLAY_DATA",requestId:K,payload:{netflixTitleId:f,titleText:_,year:N,href:h}};chrome.runtime.sendMessage(te).then(b=>{var ut,ft,pt,ht,gt;(b==null?void 0:b.type)==="OVERLAY_DATA_RESOLVED"&&b.requestId===rt&&(at=b.payload,S("OVERLAY_RESPONSE",{requestId:K,tmdb:b.payload.tmdb,letterboxd:{inWatchlist:((ut=b.payload.letterboxd)==null?void 0:ut.inWatchlist)??!1,userRating:((ft=b.payload.letterboxd)==null?void 0:ft.userRating)??null,matchPercent:((pt=b.payload.letterboxd)==null?void 0:pt.matchPercent)??null,becauseYouLikeCount:((gt=(ht=b.payload.letterboxd)==null?void 0:ht.becauseYouLike)==null?void 0:gt.length)??0}}),T.update(b.payload))}).catch(b=>{});return}T.unmount(),lt(null)},C=t=>{z&&window.clearTimeout(z),z=window.setTimeout(()=>{F()},Ht)},$t=()=>{new MutationObserver(()=>{try{C("mutation")}catch{}}).observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class","style","aria-expanded","aria-hidden"]}),document.addEventListener("pointerover",()=>{try{C("pointer")}catch{}},!0),document.addEventListener("focusin",()=>{try{C("focus")}catch{}},!0),V&&window.clearInterval(V),V=window.setInterval(()=>{v&&(W(),!w&&(T.isMounted()||F()))},Mt),C()},Gt=async()=>{const e=!((await j())[m.OVERLAY_ENABLED]??!0);await mt({[m.OVERLAY_ENABLED]:e}),v=e,e?(Wt(),C()):(T.unmount(),R(!1))},Ut=t=>{t.ctrlKey===Y.ctrlKey&&t.shiftKey===Y.shiftKey&&t.key.toLowerCase()===Y.key&&(t.preventDefault(),Gt().catch(e=>S("Toggle failed",e)))},Jt=()=>{chrome.runtime.onMessage.addListener(t=>{if((t==null?void 0:t.type)==="LB_INDEX_UPDATED"){C();return}(t==null?void 0:t.type)==="LB_INDEX_UPDATED_ACK"&&(S("LB_INDEX_UPDATED_ACK",t.payload),C())})},Qt=()=>{const t=st();t.__nxlDebug={getLbIndex:async()=>chrome.storage.local.get(m.LETTERBOXD_INDEX),lastOverlayData:()=>at,forceResolve:()=>F()}},Zt=async()=>{const t=st();if(t.__nxlBooted)return;t.__nxlBooted=!0,v=(await j())[m.OVERLAY_ENABLED]??!0,W(),v&&!w&&R(!0),$t(),Jt(),Qt(),window.addEventListener("keydown",Ut)},dt=async()=>{await Zt()};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{dt().catch(t=>S("Init failed",t))},{once:!0}):dt().catch(t=>S("Init failed",t))})();
//# sourceMappingURL=index.js.map
