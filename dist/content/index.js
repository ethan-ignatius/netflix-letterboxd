(function(){"use strict";const I=(...t)=>{},H=async()=>chrome.storage.local.get(["letterboxdExport","lastImportAt","overlayEnabled","tmdbApiKey","tmdbCache","letterboxdIndex","letterboxdStats"]),ot=async t=>{await chrome.storage.local.set(t)},N="a[href^='/title/']",O=["[role='dialog']","[aria-modal='true']","[aria-expanded='true']","[data-uia*='jawbone']","[class*='jawbone']","[data-uia*='preview']","[data-uia*='billboard']","[data-uia*='hero']","[data-uia*='details']"],C=["h1","h2","h3","[data-uia*='title']","[class*='title']","[class*='fallback']","[class*='preview'] [class*='header']"],rt=["video","img","[data-uia*='preview'] video","[data-uia*='preview'] img","[class*='preview'] video","[class*='preview'] img","[data-uia*='player'] video","[data-uia*='hero'] img"],st=["[data-uia*='controls']","[class*='controls']","[class*='control']","[role='toolbar']"],S=/(S\d+\s*:?\s*E\d+|Season\s*\d+\s*Episode\s*\d+|Episode\s*\d+|\bE\d+\b)/i,A=/(\b\d+\s*(m|min|minutes)\b|\b\d+\s*of\s*\d+\s*(m|min|minutes)\b)/i,W=["[data-uia*='maturity-rating']","[data-uia*='season']","[data-uia*='resolution']","[data-uia*='hd']","[class*='maturity']","[class*='season']","[class*='quality']"],P=["[data-uia*='genre']","a[href*='/genre/']","[class*='genre']"],R=["h1","h2","h3","h4","[data-uia*='title']","[class*='title']","[class*='headline']","[class*='header']","[class*='name']"],g=t=>{const e=t.getBoundingClientRect();if(e.width===0||e.height===0)return!1;const n=window.getComputedStyle(t);return n.visibility==="hidden"||n.display==="none"||n.opacity==="0"?!1:e.bottom>=0&&e.right>=0&&e.top<=window.innerHeight&&e.left<=window.innerWidth},y=t=>{if(!t)return;const e=t.replace(/\s+/g," ").trim();return e.length?e:void 0},V=(t,e)=>{const n=[];return e.forEach(i=>{t.querySelectorAll(i).forEach(r=>{if(!g(r))return;const o=y(r.textContent);o&&n.push(o)})}),n},at=t=>{const e=t.toLowerCase();return e.includes("episode")||e.includes("min")||e.includes("of ")?!1:(e.includes("season")||e.includes("hd")||e.includes("tv-"),!0)},lt=t=>{if(!t)return;const e=t.match(/\/title\/(\d+)/);return e==null?void 0:e[1]},q=t=>{if(!t)return;const e=t.match(/(19\d{2}|20\d{2})/);if(!e)return;const n=Number(e[1]);if(!Number.isNaN(n))return n},b=t=>{if(!t)return;let e=t;return e=e.replace(/^\s*S\d+\s*:?\s*E\d+\s*/i,""),e=e.replace(/"[^"]*"/g,n=>{const i=n.replace(/"/g,"");return S.test(i)?"":n}),e=e.replace(/Episode\s*\d+/gi,""),e=e.replace(/\bE\d+\b/gi,""),e=e.replace(A,""),e=e.replace(/\s+of\s+\d+\s*(m|min|minutes)?/gi,""),e=e.replace(/\s+/g," ").trim(),e.length?e:void 0},G=(t,e)=>{const n=t.getAttribute("href")||void 0,i=lt(n),r=y(t.getAttribute("aria-label")||t.textContent);return{netflixTitleId:i,titleText:r,href:n,source:e}},K=t=>{for(const e of C){const n=t.querySelector(e);if(n&&g(n)){const i=y(n.textContent);if(i)return i}}},ct=t=>{if(t)for(const e of C){const n=Array.from(t.querySelectorAll(e));for(const i of n){if(!g(i))continue;const r=y(i.textContent);if(!r||S.test(r)||A.test(r))continue;const o=b(r);if(o)return o}}},dt=t=>{if(t){const i=U(t);if(i&&g(i))return i;for(const r of C){const o=t.querySelector(r);if(o&&g(o))return o}}const e=Array.from(document.querySelectorAll(N)).find(g);return e||(Array.from(document.querySelectorAll(C.join(","))).find(g)??null)},$=t=>{if(!t)return null;const e=[];return rt.forEach(n=>{t.querySelectorAll(n).forEach(i=>{g(i)&&e.push(i)})}),e.length?e.reduce((n,i)=>{const r=n.getBoundingClientRect(),o=i.getBoundingClientRect(),s=r.width*r.height;return o.width*o.height>s?i:n}):null},F=t=>{var r;if(!t)return null;const e=[];st.forEach(o=>{t.querySelectorAll(o).forEach(s=>{g(s)&&e.push(s)})});const i=Array.from(new Set(e)).map(o=>{const s=o.querySelectorAll("button, [role='button']").length,c=o.getBoundingClientRect(),f=s*10+c.width;return{el:o,score:f,top:c.top}}).filter(o=>o.score>0);return i.sort((o,s)=>s.score-o.score||s.top-o.top),((r=i[0])==null?void 0:r.el)??null},ut=t=>{if(!t)return!1;const e=[...W,...P].join(",");return Array.from(t.querySelectorAll(e)).some(i=>g(i))},ft=t=>{const e=Y(),n=window.innerWidth*.85,i=window.innerHeight*.6;for(const r of e){const o=r.getBoundingClientRect();if(o.width>n||o.height>i)continue;const s=$(r),c=F(r),f=ut(r);if(s&&c&&f)return r}return null},ht=t=>{if(!t)return;const e=V(t,W).map(i=>i.replace(/\s+/g," ").trim()).filter(i=>i.length>0).filter(at).filter(i=>!A.test(i)).filter(i=>i.length<=24),n=Array.from(new Set(e));if(n.length)return n.slice(0,3).join(" • ")},mt=t=>{if(!t)return;const e=V(t,P).map(i=>i.replace(/\s+/g," ").trim()).filter(i=>i.length>0).filter(i=>i.length<=24).filter(i=>!/episode|min/i.test(i)),n=Array.from(new Set(e));if(n.length)return n.slice(0,3).join(" • ")},L=t=>S.test(t)||A.test(t)||/\b\d+\s*of\s*\d+\s*(m|min|minutes)?\b/i.test(t)||/\b\d+\s*(m|min|minutes)\b/i.test(t),B=(t,e)=>t.closest('[role="progressbar"], [data-uia*="progress"], [class*="progress"]')?!0:e!==void 0?t.getBoundingClientRect().bottom>=e-8:!1,pt=t=>{const e=t.getBoundingClientRect(),n=F(t),i=n?n.getBoundingClientRect().top:void 0,r=Array.from(t.querySelectorAll(R.join(",")));let o=null,s=0;const c=[];if(r.forEach(l=>{if(!g(l)){s+=1;return}if(B(l,i)){s+=1;return}const u=y(l.textContent);if(!u||u.length<2||u.length>80){s+=1;return}if(L(u)){c.push(l),s+=1;return}const h=l.getBoundingClientRect(),p=window.getComputedStyle(l),m=parseFloat(p.fontSize)||14,a=p.fontWeight==="bold"?700:Number(p.fontWeight),x=Number.isNaN(a)?400:a,Bt=h.left-e.left,kt=h.top-e.top,_t=Math.hypot(Bt,kt),it=m*10+x/10+Math.max(0,300-_t);(!o||it>o.score)&&(o={el:l,score:it,text:u})}),o)return{title:b(o.text)??o.text,chosen:o.el,rejectedCount:s};for(const l of c){let u=l.parentElement,h=0;for(;u&&h<4;){const p=Array.from(u.querySelectorAll(R.join(","))).filter(m=>m!==l);for(const m of p){if(!g(m)||B(m,i))continue;const a=y(m.textContent);if(!(!a||a.length<2||a.length>80)&&!L(a))return{title:b(a)??a,chosen:m,rejectedCount:s}}u=u.parentElement,h+=1}}const f=t.querySelector("a[href^='/title/']");if(f){const l=f.querySelector(R.join(",")),u=y((l==null?void 0:l.textContent)||f.textContent);if(u&&!L(u))return{title:b(u)??u,chosen:l??f,rejectedCount:s};let h=f.parentElement,p=0;for(;h&&p<4;){const m=Array.from(h.querySelectorAll(R.join(",")));for(const a of m){if(!g(a)||B(a,i))continue;const x=y(a.textContent);if(!(!x||x.length<2||x.length>80)&&!L(x))return{title:b(x)??x,chosen:a,rejectedCount:s}}h=h.parentElement,p+=1}}return{title:null,rejectedCount:s}},k=(t,e)=>{const n=ct(t);if(n)return n;const i=b(e);if(i&&!S.test(i))return i;if(e)return b(e)??e},U=t=>{const e=Array.from(t.querySelectorAll(N)),n=e.filter(g);return n.length>0?n[0]:e[0]},Y=()=>{const t=O.join(","),e=Array.from(document.querySelectorAll(t)),n=e.filter(g),i=window.innerWidth*.85,r=window.innerHeight*.6,o=n.filter(s=>{const c=s.getBoundingClientRect();return!(c.width===0||c.height===0||c.width<240||c.height<180||c.width>i||c.height>r)});return o.length>0?o.sort((s,c)=>{const f=s.getBoundingClientRect(),l=c.getBoundingClientRect();return l.width*l.height-f.width*f.height}):n.length>0?n:e},gt=()=>{const t=Y();for(const n of t){const i=U(n);if(i){const o=G(i,"container-anchor");if(o.netflixTitleId||o.titleText){const s=o.titleText??K(n),c=k(n,s??o.titleText);return{candidate:{...o,titleText:c,year:q(c??s)},container:n}}}const r=K(n);if(r){const o=k(n,r);return{candidate:{titleText:o??r,year:q(o??r),source:"container-text"},container:n}}}const e=Array.from(document.querySelectorAll(N)).find(g);if(e){const n=G(e,"page-anchor"),i=k(e.closest(O.join(","))??e.parentElement,n.titleText);return{candidate:{...n,titleText:i??n.titleText,year:q(i??n.titleText)},container:e.closest(O.join(","))??e.parentElement}}return{candidate:null,container:null}},xt="nxlb-top-section",yt=t=>{const e=document.createElement("div");e.id=xt,e.style.display="block",e.style.width="100%",e.style.pointerEvents="none";const n=e.attachShadow({mode:"open"}),i=document.createElement("style");i.textContent=`
    :host {
      all: initial;
      font-family: "Netflix Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
      pointer-events: none;
      display: block;
      width: 100%;
      box-sizing: border-box;
    }
    .nxl-top-section {
      background: rgba(0, 0, 0, 0.85);
      color: #f5f5f5;
      padding: 20px;
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: grid;
      gap: 10px;
      box-sizing: border-box;
    }
    .nxl-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }
    .nxl-title {
      font-size: 30px;
      font-weight: 700;
      line-height: 1.1;
      letter-spacing: 0.01em;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      max-width: 70%;
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
      display: inline-flex;
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
      border-radius: 999px;
      display: inline-block;
    }
    .nxl-dot.green { background: #00c46a; }
    .nxl-dot.orange { background: #f2b34c; }
    .nxl-dot.blue { background: #4aa8ff; }
    .nxl-body {
      display: grid;
      gap: 8px;
      font-size: 16px;
      color: rgba(255, 255, 255, 0.9);
      max-height: 220px;
      overflow: auto;
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
  `;const r=document.createElement("div");r.className="nxl-top-section";const o=document.createElement("div");o.className="nxl-header";const s=document.createElement("div"),c=document.createElement("div");c.className="nxl-title",c.textContent=t.titleLine;const f=document.createElement("div");f.className="nxl-meta",f.dataset.field="metadata";const l=document.createElement("div");l.className="nxl-genres",l.dataset.field="genres",s.appendChild(c),s.appendChild(f),s.appendChild(l);const u=document.createElement("div");u.className="nxl-branding",u.innerHTML=`
    Powered by
    <span class="nxl-dots">
      <span class="nxl-dot green"></span>
      <span class="nxl-dot orange"></span>
      <span class="nxl-dot blue"></span>
    </span>
    Letterboxd
  `,o.appendChild(s),o.appendChild(u);const h=document.createElement("div");h.className="nxl-body";const p=document.createElement("div");p.className="nxl-rating",p.dataset.field="communityRating",p.textContent="Community rating: —";const m=document.createElement("div");m.className="nxl-match",m.dataset.field="match",m.textContent="Your match: —";const a=document.createElement("div");return a.className="nxl-because",a.dataset.field="because",a.textContent="Because you like —",h.appendChild(p),h.appendChild(m),h.appendChild(a),r.appendChild(o),r.appendChild(h),n.appendChild(i),n.appendChild(r),e};let _=null,d=null;const bt=t=>t===void 0?"":t>=1e6?`${(t/1e6).toFixed(1)}M`:t>=1e3?`${(t/1e3).toFixed(1)}K`:`${t}`,Et=t=>{var c,f,l,u,h,p;const e=(c=d==null?void 0:d.shadowRoot)==null?void 0:c.querySelector(".nxl-title");e&&(e.textContent=t.titleLine);const n=(f=d==null?void 0:d.shadowRoot)==null?void 0:f.querySelector("[data-field='communityRating']");if(n)if(t.communityRating!==void 0){const m=bt(t.ratingCount);n.innerHTML=`
        Community rating:
        <span class="nxl-star">★</span>
        ${t.communityRating.toFixed(1)}${m?` <span class="nxl-meta">${m} ratings</span>`:""}
      `}else n.textContent="Community rating: —";const i=(l=d==null?void 0:d.shadowRoot)==null?void 0:l.querySelector("[data-field='match']");i&&(t.matchScore!==void 0?i.innerHTML=`Your match: <span class="nxl-match-value">${t.matchScore}%</span>`:i.textContent="Your match: —");const r=(u=d==null?void 0:d.shadowRoot)==null?void 0:u.querySelector("[data-field='because']");r&&(r.textContent=t.matchExplanation??"Because you like —");const o=(h=d==null?void 0:d.shadowRoot)==null?void 0:h.querySelector("[data-field='metadata']");o&&(t.metadataLine?(o.style.display="block",o.textContent=t.metadataLine):(o.style.display="none",o.textContent=""));const s=(p=d==null?void 0:d.shadowRoot)==null?void 0:p.querySelector("[data-field='genres']");s&&(t.genresLine?(s.style.display="block",s.textContent=t.genresLine):(s.style.display="none",s.textContent=""))},X=(t,e)=>{const n=_!==t;return n&&(d&&d.remove(),_=t,d=yt(e),t.insertBefore(d,t.firstChild)),Et(e),n},E=()=>{d&&d.remove(),_=null,d=null},J="nxlb-debug-badge",j={ctrlKey:!0,shiftKey:!0,key:"l"},wt=250,vt=.85,Tt=.6,Ct=t=>{const e=document.getElementById(J);if(!t){e==null||e.remove();return}if(e)return;const n=document.createElement("div");n.id=J,n.style.position="fixed",n.style.bottom="16px",n.style.right="16px",n.style.zIndex="2147483647";const i=n.attachShadow({mode:"open"}),r=document.createElement("style");r.textContent=`
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
  `;const o=document.createElement("div");o.className="badge",o.textContent="N×L active",i.appendChild(r),i.appendChild(o),document.documentElement.appendChild(n)};let Q=!0;const Z=async t=>{Q=t,t||updateOverlay(null,null),Ct(t)};let z="",D=null,M,tt="",w=null;const zt=t=>{var r;if(!t)return"none";const e=[t.tagName.toLowerCase()],n=t.className;n&&e.push("."+n.toString().split(/\s+/).filter(Boolean).slice(0,3).join("."));const i=(r=t.getAttribute)==null?void 0:r.call(t,"data-uia");return i&&e.push(`[data-uia="${i}"]`),e.join("")},St=()=>window.location.pathname.startsWith("/watch"),At=()=>Array.from(document.querySelectorAll("video")).some(e=>{const n=e.getBoundingClientRect();if(n.width===0||n.height===0)return!1;const i=n.width/window.innerWidth,r=n.height/window.innerHeight;return i>.85||r>.6}),Rt=()=>Array.from(document.querySelectorAll("h1, h2, h3, [data-uia*='episode'], [class*='episode']")).some(e=>{if(e instanceof HTMLElement){const n=e.getBoundingClientRect();if(n.width===0||n.height===0)return!1;const i=e.textContent??"";return/episode/i.test(i)}return!1}),et=t=>{if(!t)return!1;const e=t.getBoundingClientRect();return e.width===0||e.height===0?!1:e.width>window.innerWidth*vt||e.height>window.innerHeight*Tt},v=t=>{w&&w!==t&&(w.style.outline="",w.style.outlineOffset="",w=null)},Lt=t=>t?[t.netflixTitleId??"",t.titleText??"",t.year??"",t.href??""].join("|"):"",It=()=>{if(!Q)return;if(St()){E();return}if(At()){E();return}if(Rt()){E();return}const{candidate:t,container:e}=gt(),n=$(e),i=ft()??e,r=dt(i??e),o=i==null?void 0:i.querySelector("a[href^='/title/']");if(o){const a=o.getAttribute("href")??void 0,x=a==null?void 0:a.match(/\/title\/(\d+)/);x&&t&&(t.netflixTitleId=x[1]),a&&t&&(t.href=a)}const s=ht(i??e),c=mt(i??e);if(!i||!n){E(),v(null);return}if(et(r)||et(i)){E(),v(null);return}if(v(i),!t){try{E()}catch{}v(null),z="",D=null;return}const f=pt(i);if(!f.title){E(),v(null);return}const l=f.title,u=Lt({...t,titleText:l});if(u===z&&i===D)return;z=u,D=i;const h=`req_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;tt=h;const p={type:"RESOLVE_TITLE",requestId:h,payload:{netflixTitleId:t.netflixTitleId,titleText:l,year:t.year,href:t.href}};chrome.runtime.sendMessage(p).then(a=>{if((a==null?void 0:a.type)==="TITLE_RESOLVED"&&a.requestId===tt)try{const x=X(i,{titleLine:l,metadataLine:s,genresLine:c,communityRating:a.payload.tmdbVoteAverage,ratingCount:a.payload.tmdbVoteCount,matchScore:a.payload.matchScore,matchExplanation:a.payload.matchExplanation})}catch{}}).catch(a=>{});const m=l;try{const a=X(i,{titleLine:m,metadataLine:s,genresLine:c})}catch{}},T=()=>{M&&window.clearTimeout(M),M=window.setTimeout(()=>{It()},wt)},Nt=()=>{new MutationObserver(()=>{try{T()}catch{}}).observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class","style","aria-expanded","aria-hidden"]}),document.addEventListener("pointerover",()=>{try{T()}catch{}},!0),document.addEventListener("focusin",()=>{try{T()}catch{}},!0),T()},Ot=async()=>{const e=!((await H()).overlayEnabled??!0);await ot({overlayEnabled:e}),await Z(e),e&&T()},qt=t=>{t.ctrlKey===j.ctrlKey&&t.shiftKey===j.shiftKey&&t.key.toLowerCase()===j.key&&(t.preventDefault(),Ot().catch(e=>I("Toggle failed",e)))},nt=async()=>{const e=(await H()).overlayEnabled??!0;await Z(e),Nt(),window.addEventListener("keydown",qt)};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{nt().catch(t=>I("Init failed",t))},{once:!0}):nt().catch(t=>I("Init failed",t))})();
//# sourceMappingURL=index.js.map
