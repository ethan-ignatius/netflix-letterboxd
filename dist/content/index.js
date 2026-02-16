(function(){"use strict";const g={OVERLAY_ENABLED:"overlayEnabled",TMDB_API_KEY:"tmdbApiKey",TMDB_CACHE:"tmdbCache",TMDB_FEATURE_CACHE:"tmdbFeatureCache",MATCH_PROFILE:"matchProfile",LETTERBOXD_INDEX:"lb_index_v1",LETTERBOXD_STATS:"lb_stats_v1",LAST_IMPORT_AT:"lastImportAt"},O=(...t)=>{},V=async()=>chrome.storage.local.get([g.OVERLAY_ENABLED,g.TMDB_API_KEY,g.TMDB_CACHE,g.TMDB_FEATURE_CACHE,g.MATCH_PROFILE,g.LETTERBOXD_INDEX,g.LETTERBOXD_STATS,g.LAST_IMPORT_AT]),ot=async t=>{await chrome.storage.local.set(t)},B="a[href^='/title/']",N=["[role='dialog']","[aria-modal='true']","[aria-expanded='true']","[data-uia*='jawbone']","[class*='jawbone']","[data-uia*='preview']","[data-uia*='billboard']","[data-uia*='hero']","[data-uia*='details']"],S=["h1","h2","h3","[data-uia*='title']","[class*='title']","[class*='fallback']","[class*='preview'] [class*='header']"],it=["video","img","[data-uia*='preview'] video","[data-uia*='preview'] img","[class*='preview'] video","[class*='preview'] img","[data-uia*='player'] video","[data-uia*='hero'] img"],rt=["[data-uia*='controls']","[class*='controls']","[class*='control']","[role='toolbar']"],R=/(S\d+\s*:?\s*E\d+|Season\s*\d+\s*Episode\s*\d+|Episode\s*\d+|\bE\d+\b)/i,I=/(\b\d+\s*(m|min|minutes)\b|\b\d+\s*of\s*\d+\s*(m|min|minutes)\b)/i,st=["[data-uia*='maturity-rating']","[data-uia*='season']","[data-uia*='resolution']","[data-uia*='hd']","[class*='maturity']","[class*='season']","[class*='quality']"],at=["[data-uia*='genre']","a[href*='/genre/']","[class*='genre']"],_=["h1","h2","h3","h4","[data-uia*='title']","[class*='title']","[class*='headline']","[class*='header']","[class*='name']"],ct=/(browse|home|my list|popular)/i,h=t=>{const e=t.getBoundingClientRect();if(e.width===0||e.height===0)return!1;const n=window.getComputedStyle(t);return n.visibility==="hidden"||n.display==="none"||n.opacity==="0"?!1:e.bottom>=0&&e.right>=0&&e.top<=window.innerHeight&&e.left<=window.innerWidth},T=t=>{if(!t)return;const e=t.replace(/\s+/g," ").trim();return e.length?e:void 0},lt=t=>{if(!t)return;const e=t.match(/\/title\/(\d+)/);return e==null?void 0:e[1]},D=t=>{if(!t)return;const e=t.match(/(19\d{2}|20\d{2})/);if(!e)return;const n=Number(e[1]);if(!Number.isNaN(n))return n},w=t=>{if(!t)return;let e=t;return e=e.replace(/^\s*S\d+\s*:?\s*E\d+\s*/i,""),e=e.replace(/"[^"]*"/g,n=>{const o=n.replace(/"/g,"");return R.test(o)?"":n}),e=e.replace(/Episode\s*\d+/gi,""),e=e.replace(/\bE\d+\b/gi,""),e=e.replace(I,""),e=e.replace(/\s+of\s+\d+\s*(m|min|minutes)?/gi,""),e=e.replace(/\s+/g," ").trim(),e.length?e:void 0},Y=(t,e)=>{const n=t.getAttribute("href")||void 0,o=lt(n),r=T(t.getAttribute("aria-label")||t.textContent);return{netflixTitleId:o,titleText:r,href:n,source:e}},F=t=>{for(const e of S){const n=t.querySelector(e);if(n&&h(n)){const o=T(n.textContent);if(o)return o}}},dt=t=>{if(t)for(const e of S){const n=Array.from(t.querySelectorAll(e));for(const o of n){if(!h(o))continue;const r=T(o.textContent);if(!r||R.test(r)||I.test(r))continue;const i=w(r);if(i)return i}}},ut=t=>{if(t){const o=$(t);if(o&&h(o))return o;for(const r of S){const i=t.querySelector(r);if(i&&h(i))return i}}const e=Array.from(document.querySelectorAll(B)).find(h);return e||(Array.from(document.querySelectorAll(S.join(","))).find(h)??null)},W=t=>{if(!t)return null;const e=[];return it.forEach(n=>{t.querySelectorAll(n).forEach(o=>{h(o)&&e.push(o)})}),e.length?e.reduce((n,o)=>{const r=n.getBoundingClientRect(),i=o.getBoundingClientRect(),s=r.width*r.height;return i.width*i.height>s?o:n}):null},K=t=>{var r;if(!t)return null;const e=[];rt.forEach(i=>{t.querySelectorAll(i).forEach(s=>{h(s)&&e.push(s)})});const o=Array.from(new Set(e)).map(i=>{const s=i.querySelectorAll("button, [role='button']").length,a=i.getBoundingClientRect(),u=s*10+a.width;return{el:i,score:u,top:a.top}}).filter(i=>i.score>0);return o.sort((i,s)=>s.score-i.score||s.top-i.top),((r=o[0])==null?void 0:r.el)??null},ft=t=>{if(!t)return!1;const e=[...st,...at].join(",");return Array.from(t.querySelectorAll(e)).some(o=>h(o))},ht=()=>{const t=G(),e=window.innerWidth*.85,n=window.innerHeight*.6;for(const o of t){const r=o.getBoundingClientRect();if(r.width>e||r.height>n)continue;const i=W(o),s=K(o),a=ft(o);if(i&&s&&a)return o}return null},L=t=>ct.test(t)?!0:R.test(t)||I.test(t)||/\b\d+\s*of\s*\d+\s*(m|min|minutes)?\b/i.test(t)||/\b\d+\s*(m|min|minutes)\b/i.test(t),q=(t,e)=>t.closest('[role="progressbar"], [data-uia*="progress"], [class*="progress"]')?!0:e!==void 0?t.getBoundingClientRect().bottom>=e-8:!1,pt=t=>{const e=t.getBoundingClientRect(),n=K(t),o=n?n.getBoundingClientRect().top:void 0,r=Array.from(t.querySelectorAll(_.join(",")));let i,s=0;const a=[];if(r.forEach(l=>{if(!h(l)){s+=1;return}if(q(l,o)){s+=1;return}const f=T(l.textContent);if(!f||f.length<2||f.length>80){s+=1;return}if(L(f)){a.push(l),s+=1;return}const c=l.getBoundingClientRect(),m=window.getComputedStyle(l),x=parseFloat(m.fontSize)||14,p=m.fontWeight==="bold"?700:Number(m.fontWeight),E=Number.isNaN(p)?400:p,Dt=c.left-e.left,qt=c.top-e.top,Ht=Math.hypot(Dt,qt),nt=x*10+E/10+Math.max(0,300-Ht);(!i||nt>i.score)&&(i={el:l,score:nt,text:f})}),i)return{title:w(i.text)??i.text,chosen:i.el,rejectedCount:s};for(const l of a){let f=l.parentElement,c=0;for(;f&&c<4;){const m=Array.from(f.querySelectorAll(_.join(","))).filter(x=>x!==l);for(const x of m){if(!h(x)||q(x,o))continue;const p=T(x.textContent);if(!(!p||p.length<2||p.length>80)&&!L(p))return{title:w(p)??p,chosen:x,rejectedCount:s}}f=f.parentElement,c+=1}}const u=t.querySelector("a[href^='/title/']");if(u){const l=u.querySelector(_.join(",")),f=T((l==null?void 0:l.textContent)||u.textContent);if(f&&!L(f))return{title:w(f)??f,chosen:l??u,rejectedCount:s};let c=u.parentElement,m=0;for(;c&&m<4;){const x=Array.from(c.querySelectorAll(_.join(",")));for(const p of x){if(!h(p)||q(p,o))continue;const E=T(p.textContent);if(!(!E||E.length<2||E.length>80)&&!L(E))return{title:w(E)??E,chosen:p,rejectedCount:s}}c=c.parentElement,m+=1}}return{title:null,rejectedCount:s}},H=(t,e)=>{const n=dt(t);if(n)return n;const o=w(e);if(o&&!R.test(o))return o;if(e)return w(e)??e},$=t=>{const e=Array.from(t.querySelectorAll(B)),n=e.filter(h);return n.length>0?n[0]:e[0]},G=()=>{const t=N.join(","),e=Array.from(document.querySelectorAll(t)),n=e.filter(h),o=window.innerWidth*.85,r=window.innerHeight*.6,i=n.filter(s=>{const a=s.getBoundingClientRect();return!(a.width===0||a.height===0||a.width<240||a.height<180||a.width>o||a.height>r)});return i.length>0?i.sort((s,a)=>{const u=s.getBoundingClientRect(),l=a.getBoundingClientRect();return l.width*l.height-u.width*u.height}):n.length>0?n:e},mt=()=>{const t=G();for(const n of t){const o=$(n);if(o){const i=Y(o,"container-anchor");if(i.netflixTitleId||i.titleText){const s=i.titleText??F(n),a=H(n,s??i.titleText);return{candidate:{...i,titleText:a,year:D(a??s)},container:n}}}const r=F(n);if(r){const i=H(n,r);return{candidate:{titleText:i??r,year:D(i??r),source:"container-text"},container:n}}}const e=Array.from(document.querySelectorAll(B)).find(h);if(e){const n=Y(e,"page-anchor"),o=H(e.closest(N.join(","))??e.parentElement,n.titleText);return{candidate:{...n,titleText:o??n.titleText,year:D(o??n.titleText)},container:e.closest(N.join(","))??e.parentElement}}return{candidate:null,container:null}},gt="nxlb-top-section",xt=()=>{const t=document.createElement("div");t.id=gt,t.style.display="block",t.style.width="100%",t.style.pointerEvents="none";const e=t.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=`
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
  `;const o=document.createElement("div");o.className="nxl-top-section";const r=document.createElement("div");r.className="nxl-header";const i=document.createElement("div");i.className="nxl-branding",i.innerHTML=`
    Powered by
    <span class="nxl-dots">
      <span class="nxl-dot green"></span>
      <span class="nxl-dot orange"></span>
      <span class="nxl-dot blue"></span>
    </span>
    Letterboxd
  `,r.appendChild(i);const s=document.createElement("div");s.className="nxl-body";const a=document.createElement("div");a.className="nxl-rating",a.dataset.field="communityRating",a.textContent="Community rating: —";const u=document.createElement("div");u.className="nxl-match",u.dataset.field="match",u.textContent="Your match: —";const l=document.createElement("div");return l.className="nxl-because",l.dataset.field="because",l.textContent="Because you like: —",s.appendChild(a),s.appendChild(u),s.appendChild(l),o.appendChild(r),o.appendChild(s),e.appendChild(n),e.appendChild(o),t};let M=null,d=null;const yt=t=>t===void 0?"":t>=1e6?`${(t/1e6).toFixed(1)}M`:t>=1e3?`${(t/1e3).toFixed(1)}K`:`${t}`,bt=t=>{var r,i,s;const e=(r=d==null?void 0:d.shadowRoot)==null?void 0:r.querySelector("[data-field='communityRating']");if(e)if(t.communityRating!==void 0){const a=yt(t.ratingCount);e.innerHTML=`
        Community rating:
        <span class="nxl-star">★</span>
        ${t.communityRating.toFixed(1)}${a?` <span class="nxl-meta">${a} ratings</span>`:""}
      `}else e.textContent="Community rating: —";const n=(i=d==null?void 0:d.shadowRoot)==null?void 0:i.querySelector("[data-field='match']");n&&(t.matchScore!==void 0?n.innerHTML=`Your match: <span class="nxl-match-value">${t.matchScore}%</span>`:n.textContent="Your match: —");const o=(s=d==null?void 0:d.shadowRoot)==null?void 0:s.querySelector("[data-field='because']");o&&(o.textContent=t.matchExplanation?`Because you like: ${t.matchExplanation.replace(/^Because you like\s*/i,"")}`:"Because you like: —")},U=(t,e)=>{const n=M!==t;return n&&(d&&d.remove(),M=t,d=xt(),t.insertBefore(d,t.firstChild),requestAnimationFrame(()=>{d==null||d.classList.add("nxl-visible")})),bt(e),n},b=()=>{d&&d.remove(),M=null,d=null},X="nxlb-status-badge",Et=()=>{const t=document.createElement("div");t.id=X,t.style.position="fixed",t.style.bottom="16px",t.style.right="16px",t.style.zIndex="2147483647",t.style.pointerEvents="none";const e=t.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=`
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
  `,e.appendChild(n),e.appendChild(o),t},y=t=>{const e=document.getElementById(X);if(!t){e&&e.remove();return}if(e)return;const n=Et();document.documentElement.appendChild(n)},k={ctrlKey:!0,shiftKey:!0,key:"l"},Tt=250,wt=.85,Ct=.6;let J=!0,z="",j=null,P,Q="",C=null;const kt=t=>{var r;if(!t)return"none";const e=[t.tagName.toLowerCase()],n=t.className;n&&e.push("."+n.toString().split(/\s+/).filter(Boolean).slice(0,3).join("."));const o=(r=t.getAttribute)==null?void 0:r.call(t,"data-uia");return o&&e.push(`[data-uia="${o}"]`),e.join("")},vt=()=>window.location.pathname.startsWith("/watch"),At=()=>Array.from(document.querySelectorAll("video")).some(e=>{const n=e.getBoundingClientRect();if(n.width===0||n.height===0)return!1;const o=n.width/window.innerWidth,r=n.height/window.innerHeight;return o>.85||r>.6}),St=()=>Array.from(document.querySelectorAll("h1, h2, h3, [data-uia*='episode'], [class*='episode']")).some(e=>{if(e instanceof HTMLElement){const n=e.getBoundingClientRect();if(n.width===0||n.height===0)return!1;const o=e.textContent??"";return/episode/i.test(o)}return!1}),Z=t=>{if(!t)return!1;const e=t.getBoundingClientRect();return e.width===0||e.height===0?!1:e.width>window.innerWidth*wt||e.height>window.innerHeight*Ct},v=t=>{C&&C!==t&&(C.style.outline="",C.style.outlineOffset="",C=null)},Rt=t=>t?[t.netflixTitleId??"",t.titleText??"",t.year??"",t.href??""].join("|"):"",tt=async t=>{J=t,t||_t(),y(t)},_t=(t,e)=>{{b();return}},Lt=()=>{if(!J)return;if(vt()){b(),y(!1);return}if(At()){b(),y(!1);return}if(St()){b(),y(!1);return}const{candidate:t,container:e}=mt(),n=W(e),o=ht()??e,r=ut(o??e),i=o==null?void 0:o.querySelector("a[href^='/title/']");if(i){const c=i.getAttribute("href")??void 0,m=c==null?void 0:c.match(/\/title\/(\d+)/);m&&t&&(t.netflixTitleId=m[1]),c&&t&&(t.href=c)}if(!o||!n){b(),v(null),y(!1);return}if(Z(r)||Z(o)){b(),v(null),y(!1);return}if(v(o),!t){try{b()}catch{}v(null),z="",j=null;return}const s=pt(o);if(!s.title){b(),v(null),y(!1);return}const a=s.title,u=Rt({...t,titleText:a});if(u===z&&o===j)return;z=u,j=o;const l=`req_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;Q=l;const f={type:"RESOLVE_TITLE",requestId:l,payload:{netflixTitleId:t.netflixTitleId,titleText:a,year:t.year,href:t.href}};chrome.runtime.sendMessage(f).then(c=>{if((c==null?void 0:c.type)==="TITLE_RESOLVED"&&c.requestId===Q)try{const m=U(o,{communityRating:c.payload.tmdbVoteAverage,ratingCount:c.payload.tmdbVoteCount,matchScore:c.payload.matchScore,matchExplanation:c.payload.matchExplanation});y(!0)}catch{}}).catch(c=>{});try{const c=U(o,{});y(!0)}catch{}},A=()=>{P&&window.clearTimeout(P),P=window.setTimeout(()=>{Lt()},Tt)},Ot=()=>{new MutationObserver(()=>{try{A()}catch{}}).observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class","style","aria-expanded","aria-hidden"]}),document.addEventListener("pointerover",()=>{try{A()}catch{}},!0),document.addEventListener("focusin",()=>{try{A()}catch{}},!0),A()},Bt=async()=>{const e=!((await V())[g.OVERLAY_ENABLED]??!0);await ot({[g.OVERLAY_ENABLED]:e}),await tt(e),e&&A()},Nt=t=>{t.ctrlKey===k.ctrlKey&&t.shiftKey===k.shiftKey&&t.key.toLowerCase()===k.key&&(t.preventDefault(),Bt().catch(e=>O("Toggle failed",e)))},It=async()=>{const e=(await V())[g.OVERLAY_ENABLED]??!0;await tt(e),Ot(),window.addEventListener("keydown",Nt)},et=async()=>{await It()};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{et().catch(t=>O("Init failed",t))},{once:!0}):et().catch(t=>O("Init failed",t))})();
//# sourceMappingURL=index.js.map
