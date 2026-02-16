(function(){"use strict";const I=(...t)=>{},W=async()=>chrome.storage.local.get(["letterboxdExport","lastImportAt","overlayEnabled","tmdbApiKey","tmdbCache","letterboxdIndex","letterboxdStats","lb_index_v1","lb_stats_v1"]),nt=async t=>{await chrome.storage.local.set(t)},L="a[href^='/title/']",O=["[role='dialog']","[aria-modal='true']","[aria-expanded='true']","[data-uia*='jawbone']","[class*='jawbone']","[data-uia*='preview']","[data-uia*='billboard']","[data-uia*='hero']","[data-uia*='details']"],S=["h1","h2","h3","[data-uia*='title']","[class*='title']","[class*='fallback']","[class*='preview'] [class*='header']"],ot=["video","img","[data-uia*='preview'] video","[data-uia*='preview'] img","[class*='preview'] video","[class*='preview'] img","[data-uia*='player'] video","[data-uia*='hero'] img"],it=["[data-uia*='controls']","[class*='controls']","[class*='control']","[role='toolbar']"],A=/(S\d+\s*:?\s*E\d+|Season\s*\d+\s*Episode\s*\d+|Episode\s*\d+|\bE\d+\b)/i,_=/(\b\d+\s*(m|min|minutes)\b|\b\d+\s*of\s*\d+\s*(m|min|minutes)\b)/i,rt=["[data-uia*='maturity-rating']","[data-uia*='season']","[data-uia*='resolution']","[data-uia*='hd']","[class*='maturity']","[class*='season']","[class*='quality']"],st=["[data-uia*='genre']","a[href*='/genre/']","[class*='genre']"],R=["h1","h2","h3","h4","[data-uia*='title']","[class*='title']","[class*='headline']","[class*='header']","[class*='name']"],at=/(browse|home|my list|popular)/i,h=t=>{const e=t.getBoundingClientRect();if(e.width===0||e.height===0)return!1;const n=window.getComputedStyle(t);return n.visibility==="hidden"||n.display==="none"||n.opacity==="0"?!1:e.bottom>=0&&e.right>=0&&e.top<=window.innerHeight&&e.left<=window.innerWidth},b=t=>{if(!t)return;const e=t.replace(/\s+/g," ").trim();return e.length?e:void 0},ct=t=>{if(!t)return;const e=t.match(/\/title\/(\d+)/);return e==null?void 0:e[1]},B=t=>{if(!t)return;const e=t.match(/(19\d{2}|20\d{2})/);if(!e)return;const n=Number(e[1]);if(!Number.isNaN(n))return n},E=t=>{if(!t)return;let e=t;return e=e.replace(/^\s*S\d+\s*:?\s*E\d+\s*/i,""),e=e.replace(/"[^"]*"/g,n=>{const o=n.replace(/"/g,"");return A.test(o)?"":n}),e=e.replace(/Episode\s*\d+/gi,""),e=e.replace(/\bE\d+\b/gi,""),e=e.replace(_,""),e=e.replace(/\s+of\s+\d+\s*(m|min|minutes)?/gi,""),e=e.replace(/\s+/g," ").trim(),e.length?e:void 0},P=(t,e)=>{const n=t.getAttribute("href")||void 0,o=ct(n),r=b(t.getAttribute("aria-label")||t.textContent);return{netflixTitleId:o,titleText:r,href:n,source:e}},V=t=>{for(const e of S){const n=t.querySelector(e);if(n&&h(n)){const o=b(n.textContent);if(o)return o}}},lt=t=>{if(t)for(const e of S){const n=Array.from(t.querySelectorAll(e));for(const o of n){if(!h(o))continue;const r=b(o.textContent);if(!r||A.test(r)||_.test(r))continue;const i=E(r);if(i)return i}}},dt=t=>{if(t){const o=F(t);if(o&&h(o))return o;for(const r of S){const i=t.querySelector(r);if(i&&h(i))return i}}const e=Array.from(document.querySelectorAll(L)).find(h);return e||(Array.from(document.querySelectorAll(S.join(","))).find(h)??null)},K=t=>{if(!t)return null;const e=[];return ot.forEach(n=>{t.querySelectorAll(n).forEach(o=>{h(o)&&e.push(o)})}),e.length?e.reduce((n,o)=>{const r=n.getBoundingClientRect(),i=o.getBoundingClientRect(),s=r.width*r.height;return i.width*i.height>s?o:n}):null},$=t=>{var r;if(!t)return null;const e=[];it.forEach(i=>{t.querySelectorAll(i).forEach(s=>{h(s)&&e.push(s)})});const o=Array.from(new Set(e)).map(i=>{const s=i.querySelectorAll("button, [role='button']").length,a=i.getBoundingClientRect(),u=s*10+a.width;return{el:i,score:u,top:a.top}}).filter(i=>i.score>0);return o.sort((i,s)=>s.score-i.score||s.top-i.top),((r=o[0])==null?void 0:r.el)??null},ut=t=>{if(!t)return!1;const e=[...rt,...st].join(",");return Array.from(t.querySelectorAll(e)).some(o=>h(o))},ft=t=>{const e=G(),n=window.innerWidth*.85,o=window.innerHeight*.6;for(const r of e){const i=r.getBoundingClientRect();if(i.width>n||i.height>o)continue;const s=K(r),a=$(r),u=ut(r);if(s&&a&&u)return r}return null},N=t=>at.test(t)?!0:A.test(t)||_.test(t)||/\b\d+\s*of\s*\d+\s*(m|min|minutes)?\b/i.test(t)||/\b\d+\s*(m|min|minutes)\b/i.test(t),q=(t,e)=>t.closest('[role="progressbar"], [data-uia*="progress"], [class*="progress"]')?!0:e!==void 0?t.getBoundingClientRect().bottom>=e-8:!1,ht=t=>{const e=t.getBoundingClientRect(),n=$(t),o=n?n.getBoundingClientRect().top:void 0,r=Array.from(t.querySelectorAll(R.join(",")));let i=null,s=0;const a=[];if(r.forEach(l=>{if(!h(l)){s+=1;return}if(q(l,o)){s+=1;return}const d=b(l.textContent);if(!d||d.length<2||d.length>80){s+=1;return}if(N(d)){a.push(l),s+=1;return}const c=l.getBoundingClientRect(),m=window.getComputedStyle(l),g=parseFloat(m.fontSize)||14,p=m.fontWeight==="bold"?700:Number(m.fontWeight),y=Number.isNaN(p)?400:p,Lt=c.left-e.left,Ot=c.top-e.top,_t=Math.hypot(Lt,Ot),et=g*10+y/10+Math.max(0,300-_t);(!i||et>i.score)&&(i={el:l,score:et,text:d})}),i)return{title:E(i.text)??i.text,chosen:i.el,rejectedCount:s};for(const l of a){let d=l.parentElement,c=0;for(;d&&c<4;){const m=Array.from(d.querySelectorAll(R.join(","))).filter(g=>g!==l);for(const g of m){if(!h(g)||q(g,o))continue;const p=b(g.textContent);if(!(!p||p.length<2||p.length>80)&&!N(p))return{title:E(p)??p,chosen:g,rejectedCount:s}}d=d.parentElement,c+=1}}const u=t.querySelector("a[href^='/title/']");if(u){const l=u.querySelector(R.join(",")),d=b((l==null?void 0:l.textContent)||u.textContent);if(d&&!N(d))return{title:E(d)??d,chosen:l??u,rejectedCount:s};let c=u.parentElement,m=0;for(;c&&m<4;){const g=Array.from(c.querySelectorAll(R.join(",")));for(const p of g){if(!h(p)||q(p,o))continue;const y=b(p.textContent);if(!(!y||y.length<2||y.length>80)&&!N(y))return{title:E(y)??y,chosen:p,rejectedCount:s}}c=c.parentElement,m+=1}}return{title:null,rejectedCount:s}},k=(t,e)=>{const n=lt(t);if(n)return n;const o=E(e);if(o&&!A.test(o))return o;if(e)return E(e)??e},F=t=>{const e=Array.from(t.querySelectorAll(L)),n=e.filter(h);return n.length>0?n[0]:e[0]},G=()=>{const t=O.join(","),e=Array.from(document.querySelectorAll(t)),n=e.filter(h),o=window.innerWidth*.85,r=window.innerHeight*.6,i=n.filter(s=>{const a=s.getBoundingClientRect();return!(a.width===0||a.height===0||a.width<240||a.height<180||a.width>o||a.height>r)});return i.length>0?i.sort((s,a)=>{const u=s.getBoundingClientRect(),l=a.getBoundingClientRect();return l.width*l.height-u.width*u.height}):n.length>0?n:e},pt=()=>{const t=G();for(const n of t){const o=F(n);if(o){const i=P(o,"container-anchor");if(i.netflixTitleId||i.titleText){const s=i.titleText??V(n),a=k(n,s??i.titleText);return{candidate:{...i,titleText:a,year:B(a??s)},container:n}}}const r=V(n);if(r){const i=k(n,r);return{candidate:{titleText:i??r,year:B(i??r),source:"container-text"},container:n}}}const e=Array.from(document.querySelectorAll(L)).find(h);if(e){const n=P(e,"page-anchor"),o=k(e.closest(O.join(","))??e.parentElement,n.titleText);return{candidate:{...n,titleText:o??n.titleText,year:B(o??n.titleText)},container:e.closest(O.join(","))??e.parentElement}}return{candidate:null,container:null}},mt="nxlb-top-section",gt=t=>{const e=document.createElement("div");e.id=mt,e.style.display="block",e.style.width="100%",e.style.pointerEvents="none";const n=e.attachShadow({mode:"open"}),o=document.createElement("style");o.textContent=`
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
  `;const r=document.createElement("div");r.className="nxl-top-section";const i=document.createElement("div");i.className="nxl-header";const s=document.createElement("div");s.className="nxl-branding",s.innerHTML=`
    Powered by
    <span class="nxl-dots">
      <span class="nxl-dot green"></span>
      <span class="nxl-dot orange"></span>
      <span class="nxl-dot blue"></span>
    </span>
    Letterboxd
  `,i.appendChild(s);const a=document.createElement("div");a.className="nxl-body";const u=document.createElement("div");u.className="nxl-rating",u.dataset.field="communityRating",u.textContent="Community rating: —";const l=document.createElement("div");l.className="nxl-match",l.dataset.field="match",l.textContent="Your match: —";const d=document.createElement("div");return d.className="nxl-because",d.dataset.field="because",d.textContent="Because you like: —",a.appendChild(u),a.appendChild(l),a.appendChild(d),r.appendChild(i),r.appendChild(a),n.appendChild(o),n.appendChild(r),e};let z=null,f=null;const xt=t=>t===void 0?"":t>=1e6?`${(t/1e6).toFixed(1)}M`:t>=1e3?`${(t/1e3).toFixed(1)}K`:`${t}`,yt=t=>{var r,i,s;const e=(r=f==null?void 0:f.shadowRoot)==null?void 0:r.querySelector("[data-field='communityRating']");if(e)if(t.communityRating!==void 0){const a=xt(t.ratingCount);e.innerHTML=`
        Community rating:
        <span class="nxl-star">★</span>
        ${t.communityRating.toFixed(1)}${a?` <span class="nxl-meta">${a} ratings</span>`:""}
      `}else e.textContent="Community rating: —";const n=(i=f==null?void 0:f.shadowRoot)==null?void 0:i.querySelector("[data-field='match']");n&&(t.matchScore!==void 0?n.innerHTML=`Your match: <span class="nxl-match-value">${t.matchScore}%</span>`:n.textContent="Your match: —");const o=(s=f==null?void 0:f.shadowRoot)==null?void 0:s.querySelector("[data-field='because']");o&&(o.textContent=t.matchExplanation?`Because you like: ${t.matchExplanation.replace(/^Because you like\\s*/i,"")}`:"Because you like: —")},Y=(t,e)=>{const n=z!==t;return n&&(f&&f.remove(),z=t,f=gt(),t.insertBefore(f,t.firstChild),requestAnimationFrame(()=>{f==null||f.classList.add("nxl-visible")})),yt(e),n},w=()=>{f&&f.remove(),z=null,f=null},U="nxlb-status-badge",D={ctrlKey:!0,shiftKey:!0,key:"l"},bt=250,Et=.85,wt=.6,x=t=>{const e=document.getElementById(U);if(!t){e&&e.remove();return}if(e)return;const n=document.createElement("div");n.id=U,n.style.position="fixed",n.style.bottom="16px",n.style.right="16px",n.style.zIndex="2147483647",n.style.pointerEvents="none";const o=n.attachShadow({mode:"open"}),r=document.createElement("style");r.textContent=`
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
  `;const i=document.createElement("div");i.className="badge",i.innerHTML=`
    <span class="dots">
      <span class="dot orange"></span>
      <span class="dot green"></span>
      <span class="dot blue"></span>
    </span>
    <span>Letterboxd</span>
    <span class="status" aria-hidden="true"></span>
    <span class="tooltip">Netflix × Letterboxd overlay enabled</span>
  `,o.appendChild(r),o.appendChild(i),document.documentElement.appendChild(n)};let X=!0;const J=async t=>{X=t,t||updateOverlay(null,null),x(t)};let H="",j=null,M,Q="",T=null;const qt=t=>{var r;if(!t)return"none";const e=[t.tagName.toLowerCase()],n=t.className;n&&e.push("."+n.toString().split(/\s+/).filter(Boolean).slice(0,3).join("."));const o=(r=t.getAttribute)==null?void 0:r.call(t,"data-uia");return o&&e.push(`[data-uia="${o}"]`),e.join("")},Tt=()=>window.location.pathname.startsWith("/watch"),vt=()=>Array.from(document.querySelectorAll("video")).some(e=>{const n=e.getBoundingClientRect();if(n.width===0||n.height===0)return!1;const o=n.width/window.innerWidth,r=n.height/window.innerHeight;return o>.85||r>.6}),Ct=()=>Array.from(document.querySelectorAll("h1, h2, h3, [data-uia*='episode'], [class*='episode']")).some(e=>{if(e instanceof HTMLElement){const n=e.getBoundingClientRect();if(n.width===0||n.height===0)return!1;const o=e.textContent??"";return/episode/i.test(o)}return!1}),Z=t=>{if(!t)return!1;const e=t.getBoundingClientRect();return e.width===0||e.height===0?!1:e.width>window.innerWidth*Et||e.height>window.innerHeight*wt},v=t=>{T&&T!==t&&(T.style.outline="",T.style.outlineOffset="",T=null)},St=t=>t?[t.netflixTitleId??"",t.titleText??"",t.year??"",t.href??""].join("|"):"",At=()=>{if(!X)return;if(Tt()){w(),x(!1);return}if(vt()){w(),x(!1);return}if(Ct()){w(),x(!1);return}const{candidate:t,container:e}=pt(),n=K(e),o=ft()??e,r=dt(o??e),i=o==null?void 0:o.querySelector("a[href^='/title/']");if(i){const c=i.getAttribute("href")??void 0,m=c==null?void 0:c.match(/\/title\/(\d+)/);m&&t&&(t.netflixTitleId=m[1]),c&&t&&(t.href=c)}if(!o||!n){w(),v(null),x(!1);return}if(Z(r)||Z(o)){w(),v(null),x(!1);return}if(v(o),!t){try{w()}catch{}v(null),H="",j=null;return}const s=ht(o);if(!s.title){w(),v(null),x(!1);return}const a=s.title,u=St({...t,titleText:a});if(u===H&&o===j)return;H=u,j=o;const l=`req_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;Q=l;const d={type:"RESOLVE_TITLE",requestId:l,payload:{netflixTitleId:t.netflixTitleId,titleText:a,year:t.year,href:t.href}};chrome.runtime.sendMessage(d).then(c=>{if((c==null?void 0:c.type)==="TITLE_RESOLVED"&&c.requestId===Q)try{const m=Y(o,{communityRating:c.payload.tmdbVoteAverage,ratingCount:c.payload.tmdbVoteCount,matchScore:c.payload.matchScore,matchExplanation:c.payload.matchExplanation});x(!0)}catch{}}).catch(c=>{});try{const c=Y(o,{});x(!0)}catch{}},C=()=>{M&&window.clearTimeout(M),M=window.setTimeout(()=>{At()},bt)},Rt=()=>{new MutationObserver(()=>{try{C()}catch{}}).observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class","style","aria-expanded","aria-hidden"]}),document.addEventListener("pointerover",()=>{try{C()}catch{}},!0),document.addEventListener("focusin",()=>{try{C()}catch{}},!0),C()},Nt=async()=>{const e=!((await W()).overlayEnabled??!0);await nt({overlayEnabled:e}),await J(e),e&&C()},It=t=>{t.ctrlKey===D.ctrlKey&&t.shiftKey===D.shiftKey&&t.key.toLowerCase()===D.key&&(t.preventDefault(),Nt().catch(e=>I("Toggle failed",e)))},tt=async()=>{const e=(await W()).overlayEnabled??!0;await J(e),Rt(),window.addEventListener("keydown",It)};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{tt().catch(t=>I("Init failed",t))},{once:!0}):tt().catch(t=>I("Init failed",t))})();
//# sourceMappingURL=index.js.map
