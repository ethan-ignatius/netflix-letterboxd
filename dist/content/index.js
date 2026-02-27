(function(){"use strict";const y={OVERLAY_ENABLED:"overlayEnabled",TMDB_API_KEY:"tmdbApiKey",TMDB_CACHE:"tmdbCache",TMDB_FEATURE_CACHE:"tmdbFeatureCache",MATCH_PROFILE:"matchProfile",LETTERBOXD_INDEX:"lb_index_v1",LETTERBOXD_STATS:"lb_stats_v1",LAST_IMPORT_AT:"lastImportAt",XRAY_ENABLED:"xrayEnabled",AWS_ACCESS_KEY_ID:"awsAccessKeyId",AWS_SECRET_ACCESS_KEY:"awsSecretAccessKey",AWS_REGION:"awsRegion"},m=(...e)=>{console.log("[Netflix+Letterboxd]",...e)},be=e=>e?e.toLowerCase().replace(/&/g," and ").replace(/[^a-z0-9']+/g," ").replace(/\s+/g," ").trim():"",je=(e,t)=>{const n=be(e),o=t?String(t):"";return`${n}-${o}`},Ge=(e,t)=>je(e,t),Te=async()=>(m("Loading storage state"),chrome.storage.local.get([y.OVERLAY_ENABLED,y.TMDB_API_KEY,y.TMDB_CACHE,y.TMDB_FEATURE_CACHE,y.MATCH_PROFILE,y.LETTERBOXD_INDEX,y.LETTERBOXD_STATS,y.LAST_IMPORT_AT,y.AWS_ACCESS_KEY_ID,y.AWS_SECRET_ACCESS_KEY,y.AWS_REGION])),Ue=async e=>{m("Saving storage state",e),await chrome.storage.local.set(e)},xe="a[href^='/title/']",j=["[role='dialog']","[aria-modal='true']","[aria-expanded='true']","[data-uia*='jawbone']","[class*='jawbone']","[data-uia*='preview']","[data-uia*='billboard']","[data-uia*='hero']","[data-uia*='details']"],we=["h1","h2","h3","[data-uia*='title']","[class*='title']","[class*='fallback']","[class*='preview'] [class*='header']"],ve=["video","img","[data-uia*='preview'] video","[data-uia*='preview'] img","[class*='preview'] video","[class*='preview'] img","[data-uia*='player'] video","[data-uia*='hero'] img"],Ae=["[data-uia*='controls']","[class*='controls']","[class*='control']","[role='toolbar']"],W=/(S\d+\s*:?\s*E\d+|Season\s*\d+\s*Episode\s*\d+|Episode\s*\d+|\bE\d+\b)/i,G=/(\b\d+\s*(m|min|minutes)\b|\b\d+\s*of\s*\d+\s*(m|min|minutes)\b)/i,Je=/\b(tv-[a-z0-9]+|pg-?13|pg|tv-ma|tv-y|tv-g|nr|nc-17|hd|uhd|4k|seasons?|season|episode|volume|part\s+\d+)\b/i,Qe=/^(play|resume|continue|more info|details|watch|watch now|watch again|add|added|my list|remove|rate|like|dislike|thumbs up|thumbs down)$/i,Ze=/because you watched/i,Ce=["[data-uia*='maturity-rating']","[data-uia*='season']","[data-uia*='resolution']","[data-uia*='hd']","[class*='maturity']","[class*='season']","[class*='quality']"],_e=["[data-uia*='genre']","a[href*='/genre/']","[class*='genre']"],Se=[...Ce,..._e,"[data-uia*='metadata']","[class*='metadata']","[class*='meta']","[class*='maturity']","[class*='season']","[class*='genre']","[class*='tag']","[class*='info']"],et=["header","nav","[data-uia*='header']","[data-uia*='row-title']","[class*='rowHeader']","[class*='row-title']"],q=["h1","h2","h3","h4","[data-uia*='title']","[class*='title']","[class*='headline']","[class*='header']","[class*='name']"],tt=/(browse|home|my list|popular|your next watch|explore all|movies & shows|movies and shows|new & popular)/i,E=e=>{const t=e.getBoundingClientRect();if(t.width===0||t.height===0)return!1;const n=window.getComputedStyle(e);return n.visibility==="hidden"||n.display==="none"||n.opacity==="0"?!1:t.bottom>=0&&t.right>=0&&t.top<=window.innerHeight&&t.left<=window.innerWidth},T=e=>{if(!e)return;const t=e.replace(/\s+/g," ").trim();return t.length?t:void 0},Re=e=>{if(!e)return;const t=e.match(/\/title\/(\d+)/);return t==null?void 0:t[1]},Y=e=>{if(!e)return;const t=e.match(/(19\d{2}|20\d{2})/);if(!t)return;const n=Number(t[1]);if(!Number.isNaN(n))return n},x=e=>{if(!e)return;let t=e;return t=t.replace(/^\s*S\d+\s*:?\s*E\d+\s*/i,""),t=t.replace(/"[^"]*"/g,n=>{const o=n.replace(/"/g,"");return W.test(o)?"":n}),t=t.replace(/Episode\s*\d+/gi,""),t=t.replace(/\bE\d+\b/gi,""),t=t.replace(G,""),t=t.replace(/\s+of\s+\d+\s*(m|min|minutes)?/gi,""),t=t.replace(/\s+/g," ").trim(),t.length?t:void 0},Le=(e,t)=>{const n=e.getAttribute("href")||void 0,o=Re(n),i=T(e.getAttribute("aria-label")||e.textContent);return{netflixTitleId:o,titleText:i,href:n,source:t}},U=e=>{for(const t of we){const n=e.querySelector(t);if(n&&E(n)){const o=T(n.textContent);if(o)return o}}},nt=e=>{if(e)return U(e)},ot=e=>{if(e)for(const t of we){const n=Array.from(e.querySelectorAll(t));for(const o of n){if(!E(o))continue;const i=T(o.textContent);if(!i||W.test(i)||G.test(i))continue;const r=x(i);if(r)return r}}},z=e=>{if(!e)return null;const t=[];return ve.forEach(n=>{e.querySelectorAll(n).forEach(o=>{E(o)&&t.push(o)})}),t.length?t.reduce((n,o)=>{const i=n.getBoundingClientRect(),r=o.getBoundingClientRect(),s=i.width*i.height;return r.width*r.height>s?o:n}):null},M=e=>{var i;if(!e)return null;const t=[];Ae.forEach(r=>{e.querySelectorAll(r).forEach(s=>{E(s)&&t.push(s)})});const o=Array.from(new Set(t)).map(r=>{const s=r.querySelectorAll("button, [role='button']").length,a=r.getBoundingClientRect(),c=s*10+a.width;return{el:r,score:c,top:a.top}}).filter(r=>r.score>0);return o.sort((r,s)=>s.score-r.score||s.top-r.top),((i=o[0])==null?void 0:i.el)??null},it=e=>{if(!e)return!1;const t=[...Ce,..._e].join(",");return Array.from(e.querySelectorAll(t)).some(o=>E(o))},rt=e=>!!e.closest(Se.join(",")),J=e=>!!e.closest(et.join(",")),C=e=>tt.test(e)||Qe.test(e.trim())||Ze.test(e)||Je.test(e)?!0:W.test(e)||G.test(e)||/\b\d+\s*of\s*\d+\s*(m|min|minutes)?\b/i.test(e)||/\b\d+\s*(m|min|minutes)\b/i.test(e),Q=(e,t)=>e.closest('[role="progressbar"], [data-uia*="progress"], [class*="progress"]')?!0:t!==void 0?e.getBoundingClientRect().bottom>=t-8:!1,V=(e,t)=>e?t&&(t.contains(e)||e.closest("button, [role='button']"))?!0:!!e.closest("button, [role='button'], [data-uia*='play'], [data-uia*='button']"):!1,st=e=>{const t=e.getBoundingClientRect(),n=M(e),o=n?n.getBoundingClientRect().top:void 0,i=Array.from(e.querySelectorAll(q.join(",")));let r,s=0;const a=[];if(i.forEach(l=>{if(!E(l)){s+=1;return}if(J(l)){s+=1;return}if(V(l,n)){s+=1;return}if(Q(l,o)){s+=1;return}const d=T(l.textContent);if(!d||d.length<2||d.length>80){s+=1;return}if(C(d)){a.push(l),s+=1;return}const h=l.getBoundingClientRect(),u=window.getComputedStyle(l),p=parseFloat(u.fontSize)||14,g=u.fontWeight==="bold"?700:Number(u.fontWeight),f=Number.isNaN(g)?400:g,w=h.left-t.left,ye=h.top-t.top,Ee=Math.hypot(w,ye),An=rt(l)?120:0,Xe=p*10+f/10+Math.max(0,300-Ee)-An;(!r||Xe>r.score)&&(r={el:l,score:Xe,text:d})}),r)return{title:x(r.text)??r.text,chosen:r.el,rejectedCount:s};for(const l of a){let d=l.parentElement,h=0;for(;d&&h<4;){const u=Array.from(d.querySelectorAll(q.join(","))).filter(p=>p!==l);for(const p of u){if(!E(p)||V(p,n)||Q(p,o))continue;const g=T(p.textContent);if(!(!g||g.length<2||g.length>80)&&!C(g))return{title:x(g)??g,chosen:p,rejectedCount:s}}d=d.parentElement,h+=1}}const c=e.querySelector("a[href^='/title/']");if(c){const l=c.querySelector(q.join(",")),d=T((l==null?void 0:l.textContent)||c.textContent);if(d&&!C(d))return{title:x(d)??d,chosen:l??c,rejectedCount:s};let h=c.parentElement,u=0;for(;h&&u<4;){const p=Array.from(h.querySelectorAll(q.join(",")));for(const g of p){if(!E(g)||V(g,n)||Q(g,o))continue;const f=T(g.textContent);if(!(!f||f.length<2||f.length>80)&&!C(f))return{title:x(f)??f,chosen:g,rejectedCount:s}}h=h.parentElement,u+=1}}return{title:null,rejectedCount:s}},at=e=>{const n=Array.from(e.querySelectorAll(Se.join(","))).map(c=>T(c.textContent)).filter(Boolean);if(!n.length){const c=M(e),l=c==null?void 0:c.nextElementSibling,d=T(l==null?void 0:l.textContent);d&&n.push(d)}const o=n.join(" "),i=Y(o),r=/\bseasons?\b/i.test(o),s=/\b\d+\s*(m|min|minutes)\b/i.test(o)||/\b\d+\s*h\b/i.test(o);let a;return r?a=!0:s&&(a=!1),{year:i,isSeries:a}},Z=e=>{var n,o;const t=[e.getAttribute("aria-label"),e.getAttribute("title"),(n=e.querySelector("img[alt]"))==null?void 0:n.alt,(o=e.querySelector("[aria-label]"))==null?void 0:o.getAttribute("aria-label"),e.textContent];for(const i of t){const r=T(i);if(r&&!C(r))return r}},lt=e=>{var o,i,r,s,a;const t=e,n=[((o=t.getAttribute)==null?void 0:o.call(t,"aria-label"))??void 0,((i=t.getAttribute)==null?void 0:i.call(t,"data-uia-title"))??void 0,((r=t.getAttribute)==null?void 0:r.call(t,"title"))??void 0,(a=(s=t.querySelector)==null?void 0:s.call(t,"img[alt]"))==null?void 0:a.alt,t.textContent];for(const c of n){const l=T(c);if(l&&!C(l)&&!J(t))return l}},ct=(e,t,n)=>{const i=Array.from(e.querySelectorAll("a[href^='/title/']")).filter(a=>E(a));if(!i.length)return null;const r=t==null?void 0:t.getBoundingClientRect();let s=null;for(const a of i){if(J(a)||V(a,n)||!Z(a))continue;const l=a.getBoundingClientRect(),d=l.width*l.height;let h=0;if(r){const u=r.top-220,p=r.bottom+220;if(l.bottom<u||l.top>p)continue}if(t&&(a.contains(t)||t.contains(a))&&(h+=1e3),r){const u=l.left+l.width/2-(r.left+r.width/2),p=l.top+l.height/2-(r.top+r.height/2),g=Math.hypot(u,p);h+=Math.max(0,500-g)}h+=Math.min(d/100,200),h+=50,(!s||h>s.score)&&(s={anchor:a,score:h})}return(s==null?void 0:s.anchor)??null},dt=e=>{if(e){const t=ut(e);if(t)return t}return ft()},ee=(e,t,n)=>{const o=be(e);if(!o)return null;const i=(t==null?void 0:t.getAttribute("href"))??null,r=Re(i)??null,{year:s,isSeries:a}=at(n);return{rawTitle:e,normalizedTitle:o,year:s??null,isSeries:a,netflixId:r,href:i}},ut=e=>{const t=gt(e);let n,o=null;if(t){const s=Z(t);s&&(n=x(s)??s,o=t)}if(!n){let s=e,a=0;for(;s&&s!==document.body&&a<8;){const c=lt(s);if(c){n=x(c)??c;break}s=s.parentElement,a+=1}}if(!n)return null;if(o){const s=yt(o);if(s){const a=ee(n,o,s);return a?{jawboneEl:s,extracted:a,chosenTitleElement:o}:null}}let i=o??e,r=0;for(;i&&i!==document.body&&r<8;){if(i instanceof HTMLElement){const s=i.getBoundingClientRect();if(s.width>=200&&s.height>=120){const a=ee(n,o,i);if(a)return{jawboneEl:i,extracted:a,chosenTitleElement:o??void 0}}}i=i.parentElement,r+=1}return null},ft=()=>{const e=pt(),t=Et().map(r=>({root:r,preview:z(r)})),n=e?[{root:e.root,preview:e.preview},...t.filter(r=>r.root!==e.root)]:t,o=window.innerWidth*.85,i=window.innerHeight*.6;for(const r of n){const s=r.root,a=s.getBoundingClientRect();if(a.width>o||a.height>i)continue;const c=r.preview??z(s),l=M(s),d=it(s);if(!c||!l)continue;const h=ct(s,c,l);let u=null,p=null;if(h){const f=Z(h);f&&(u=x(f)??f,p=h)}if(u||(u=st(s).title??null),!u&&!d)continue;if(!u&&d){const f=nt(s);f&&!C(f)&&(u=x(f)??f)}if(!u)continue;const g=ee(u,p,s);if(g)return{jawboneEl:s,extracted:g,chosenTitleElement:p??void 0}}return{jawboneEl:null,extracted:null}},te=(e,t)=>{const n=ot(e);if(n)return n;const o=x(t);if(o&&!W.test(o))return o;if(t)return x(t)??t},ht=e=>{const t=Array.from(e.querySelectorAll(xe)),n=t.filter(E);return n.length>0?n[0]:t[0]},Oe=()=>{const e=j.join(","),t=Array.from(document.querySelectorAll(e)),n=t.filter(E),o=window.innerWidth*.85,i=window.innerHeight*.6,r=n.filter(s=>{const a=s.getBoundingClientRect();return!(a.width===0||a.height===0||a.width<240||a.height<180||a.width>o||a.height>i)});return r.length>0?r.sort((s,a)=>{const c=s.getBoundingClientRect(),l=a.getBoundingClientRect();return l.width*l.height-c.width*c.height}):n.length>0?n:t},mt=()=>{const e=[];return ve.forEach(t=>{document.querySelectorAll(t).forEach(n=>{if(!E(n))return;const o=n.getBoundingClientRect();o.width<200||o.height<120||e.push(n)})}),e},pt=()=>{const e=mt();if(!e.length)return null;const t=window.innerWidth*.85,n=window.innerHeight*.6,o=e.sort((i,r)=>{const s=i.getBoundingClientRect(),a=r.getBoundingClientRect();return a.width*a.height-s.width*s.height});for(const i of o){let r=i,s=0;for(;r&&s<8;){if(r instanceof HTMLElement){const a=r.getBoundingClientRect();if(a.width>=240&&a.height>=180&&a.width<=t&&a.height<=n&&M(r))return{root:r,preview:i}}r=r.parentElement,s+=1}}return null},gt=e=>{var o,i,r;let t=e;for(;t&&t!==document.body;){if(t instanceof HTMLAnchorElement&&((o=t.getAttribute("href"))!=null&&o.startsWith("/title/")))return t;const s=(i=t.querySelector)==null?void 0:i.call(t,":scope > a[href^='/title/']");if(s&&E(s))return s;t=t.parentElement}const n=(r=e.querySelector)==null?void 0:r.call(e,"a[href^='/title/']");return n&&E(n)?n:null},yt=e=>{let t=e,n=0;const o=window.innerWidth*.85,i=window.innerHeight*.6;for(;t&&t!==document.body&&n<12;){if(t instanceof HTMLElement){const r=t.getBoundingClientRect();if(r.width>=240&&r.height>=180&&r.width<=o&&r.height<=i){const s=z(t),a=M(t);if(s&&a)return t}}t=t.parentElement,n+=1}return null},Et=()=>{const e=Oe();if(e.length)return e;const t=Array.from(document.querySelectorAll(Ae.join(","))),n=window.innerWidth*.85,o=window.innerHeight*.6,i=new Set;return t.forEach(r=>{let s=r,a=0;for(;s&&a<6;){if(s instanceof HTMLElement){const c=s.getBoundingClientRect();if(c.width>=240&&c.height>=180&&c.width<=n&&c.height<=o&&z(s)){i.add(s);break}}s=s.parentElement,a+=1}}),Array.from(i)},bt=()=>{const e=Oe();for(const n of e){const o=ht(n);if(o){const r=Le(o,"container-anchor");if(r.netflixTitleId||r.titleText){const s=r.titleText??U(n),a=te(n,s??r.titleText);return{candidate:{...r,titleText:a,year:Y(a??s)},container:n}}}const i=U(n);if(i){const r=te(n,i);return{candidate:{titleText:r??i,year:Y(r??i),source:"container-text"},container:n}}}const t=Array.from(document.querySelectorAll(xe)).find(E);if(t){const n=Le(t,"page-anchor"),o=te(t.closest(j.join(","))??t.parentElement,n.titleText);return{candidate:{...n,titleText:o??n.titleText,year:Y(o??n.titleText)},container:t.closest(j.join(","))??t.parentElement}}return{candidate:null,container:null}},Tt="nxlb-top-section",xt=()=>{const e=document.createElement("div");e.id=Tt,e.style.display="block",e.style.width="100%",e.style.pointerEvents="none";const t=e.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=`
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
  `;const o=document.createElement("div");o.className="nxl-top-section";const i=document.createElement("div");i.className="nxl-header";const r=document.createElement("div");r.className="nxl-branding",r.innerHTML=`
    Powered by
    <span class="nxl-dots">
      <span class="nxl-dot green"></span>
      <span class="nxl-dot orange"></span>
      <span class="nxl-dot blue"></span>
    </span>
    Letterboxd
  `,i.appendChild(r);const s=document.createElement("div");s.className="nxl-body";const a=document.createElement("div");a.className="nxl-rating",a.dataset.field="communityRating",a.textContent="Community rating: —";const c=document.createElement("div");c.className="nxl-match",c.dataset.field="match",c.textContent="Your match: —";const l=document.createElement("div");l.className="nxl-because",l.dataset.field="because",l.textContent="Because you like: —";const d=document.createElement("div");return d.className="nxl-badges",d.dataset.field="badges",s.appendChild(a),s.appendChild(c),s.appendChild(l),s.appendChild(d),o.appendChild(i),o.appendChild(s),t.appendChild(n),t.appendChild(o),e},wt=e=>e==null?"":e>=1e6?`${(e/1e6).toFixed(1)}M`:e>=1e3?`${(e/1e3).toFixed(1)}K`:`${e}`,vt=e=>{const t=Math.max(0,Math.min(5,e)),n=Math.floor(t),o=t%1>=.5;return"★".repeat(n)+(o?"½":"")},Ne=(e,t)=>{var l,d,h,u,p,g;const n=((l=t.tmdb)==null?void 0:l.voteAverage)??null,o=((d=t.tmdb)==null?void 0:d.voteCount)??null,i=t.letterboxd,r=(h=e.shadowRoot)==null?void 0:h.querySelector("[data-field='communityRating']");if(r)if(n!=null){const f=wt(o),w=n/2;r.innerHTML=`
        Community rating:
        <span class="nxl-star">★</span>
        ${w.toFixed(1)}${f?` <span class="nxl-meta">${f} ratings</span>`:""}
      `}else r.textContent="Community rating: —";const s=(u=e.shadowRoot)==null?void 0:u.querySelector("[data-field='match']");s&&((i==null?void 0:i.matchPercent)!==null&&(i==null?void 0:i.matchPercent)!==void 0?s.innerHTML=`Your match: <span class="nxl-match-value">${i.matchPercent}%</span>`:s.textContent="Your match: —");const a=(p=e.shadowRoot)==null?void 0:p.querySelector("[data-field='because']");if(a){const f=(i==null?void 0:i.becauseYouLike)??[];a.textContent=f.length>0?`Because you like: ${f.join(", ")}`:"Because you like: —"}const c=(g=e.shadowRoot)==null?void 0:g.querySelector("[data-field='badges']");if(c){if(c.innerHTML="",i!=null&&i.inWatchlist){const f=document.createElement("span");f.className="nxl-badge",f.textContent="On your watchlist",c.appendChild(f)}if((i==null?void 0:i.userRating)!==null&&(i==null?void 0:i.userRating)!==void 0){const f=document.createElement("span");f.className="nxl-badge",f.textContent=`You rated ${vt(i.userRating)}`,c.appendChild(f)}if(!(i!=null&&i.inWatchlist)&&(i==null?void 0:i.userRating)===void 0){const f=document.createElement("span");f.className="nxl-badge",f.textContent="Letterboxd: —",c.appendChild(f)}}},At=()=>{let e=null,t=null,n=null;const o=()=>{t||(t=xt())};return{mount:c=>{o(),t&&e!==c&&(t.remove(),c.insertBefore(t,c.firstChild),e=c,requestAnimationFrame(()=>{t==null||t.classList.add("nxl-visible")}))},update:c=>{n=c,t&&Ne(t,c)},unmount:()=>{t&&t.remove(),e=null},renderLast:()=>{t&&n&&Ne(t,n)},getLastData:()=>n,getCurrentRoot:()=>e,isMounted:()=>!!(t&&t.isConnected)}},Ct="nxlb-reaction-timeline",B=104,_t=6,St=.62,Rt=.16,Lt={laugh:"😂",smile:"😊",shock:"😱",sad:"😢",angry:"😡",scared:"😨",bored:"😴",neutral:"🙂"},Ot=["laugh","smile","shock"],Nt=["angry","scared"],It=["sad","bored"],ne=[76,217,100],oe=[255,69,58],ie=[90,130,230],Dt=e=>{if(e.count===0)return{green:0,red:0,blue:0};const t=Ot.reduce((r,s)=>r+e.reactions[s],0),n=Nt.reduce((r,s)=>r+e.reactions[s],0),o=It.reduce((r,s)=>r+e.reactions[s],0),i=t+n+o;return i===0?{green:.33,red:.33,blue:.33}:{green:t/i,red:n/i,blue:o/i}},Mt=(e,t)=>{const n=Math.round(e.green*ne[0]+e.red*oe[0]+e.blue*ie[0]),o=Math.round(e.green*ne[1]+e.red*oe[1]+e.blue*ie[1]),i=Math.round(e.green*ne[2]+e.red*oe[2]+e.blue*ie[2]);return t<=0?`rgba(${n}, ${o}, ${i}, 0)`:`rgba(${n}, ${o}, ${i}, ${Math.max(.35,Math.min(.95,t*1.1))})`},Bt=(e,t,n,o,i=6)=>({cp1:[t[0]+(n[0]-e[0])/i,t[1]+(n[1]-e[1])/i],cp2:[n[0]-(o[0]-t[0])/i,n[1]-(o[1]-t[1])/i]}),Ht=(e,t,n)=>{const o=t/e.length,i=Math.max(1,B-_t);return e.map((r,s)=>{const a=(s+.5)*o,c=n>0?r.intensity/n:0,l=c>0?Math.pow(c,St):0,d=r.count>0?Math.max(Rt,l):0,h=d*i,u=Dt(r),p=Mt(u,d);return{x:a,y:h,color:p,bucket:r}})},Pt=(e,t,n)=>{const o=e.createLinearGradient(0,0,n,0);for(const i of t){const r=Math.max(0,Math.min(1,i.x/n));o.addColorStop(r,i.color)}return o},Ie=(e,t,n)=>{const o=i=>n-i;e.moveTo(t[0].x,o(t[0].y));for(let i=0;i<t.length-1;i++){const r=t[Math.max(0,i-1)],s=t[i],a=t[i+1],c=t[Math.min(t.length-1,i+2)],{cp1:l,cp2:d}=Bt([r.x,o(r.y)],[s.x,o(s.y)],[a.x,o(a.y)],[c.x,o(c.y)]);e.bezierCurveTo(l[0],l[1],d[0],d[1],a.x,o(a.y))}},F=(e,t,n,o)=>{e.clearRect(0,0,n,o),t.length!==0&&(e.beginPath(),e.moveTo(0,o),e.lineTo(t[0].x,o),Ie(e,t,o),e.lineTo(t[t.length-1].x,o),e.lineTo(0,o),e.closePath(),e.fillStyle=Pt(e,t,n),e.fill(),e.beginPath(),Ie(e,t,o),e.strokeStyle="rgba(255, 255, 255, 0.42)",e.lineWidth=1.2,e.stroke())},kt=e=>{if(e.count===0)return"";const t=Object.entries(e.reactions).filter(([,n])=>n>0).sort((n,o)=>o[1]-n[1]);return t.length===0?"":t.map(([n,o])=>`${Lt[n]} ${o}`).join("  ")};let H=null;const Wt=(e,t)=>{if(e.dataset.hoverBound==="1")return;e.dataset.hoverBound="1";let n=-1;e.addEventListener("mousemove",o=>{if(!H)return;const{points:i,ctx:r,logicalW:s,logicalH:a}=H;if(i.length===0)return;const c=e.getBoundingClientRect(),l=o.clientX-c.left,d=s/i.length,h=Math.min(i.length-1,Math.max(0,Math.floor(l/d)));if(h===n)return;n=h;const u=i[h],p=kt(u.bucket);if(!p){t.style.display="none",F(r,i,s,a);return}t.textContent=p,t.style.display="block",t.style.left=`${u.x}px`,F(r,i,s,a),r.beginPath(),r.moveTo(u.x,0),r.lineTo(u.x,a),r.strokeStyle="rgba(255, 255, 255, 0.25)",r.lineWidth=1,r.stroke()}),e.addEventListener("mouseleave",()=>{if(!H)return;const{points:o,ctx:i,logicalW:r,logicalH:s}=H;t.style.display="none",n=-1,F(i,o,r,s)})},qt=()=>{const e=["[data-uia='timeline']","[class*='scrubber']","[role='slider'][aria-label]","[class*='Slider']","[class*='progress-bar']","[class*='PlayerTimeline']"];for(const t of e){const n=document.querySelector(t);if(n&&n.getBoundingClientRect().width>100)return n}return null},Yt=()=>!!document.querySelector("[data-uia*='ad-break'], [data-uia*='interstitial'], [class*='AdBreak'], [class*='interstitial']"),zt=()=>{const e=document.createElement("div");e.id=Ct,e.style.position="fixed",e.style.zIndex="2147483645",e.style.pointerEvents="auto",e.style.height=`${B}px`;const t=e.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=`
    :host {
      all: initial;
      display: block;
      width: 100%;
      height: 100%;
      pointer-events: auto;
    }
    .graph-container {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: visible;
    }
    .graph-canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
    .tooltip {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 0;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.92);
      color: #f5f5f5;
      font-family: "Netflix Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-size: 12px;
      padding: 6px 10px;
      border-radius: 6px;
      white-space: nowrap;
      pointer-events: none;
      z-index: 10;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
      display: none;
    }
  `;const o=document.createElement("div");o.className="graph-container",o.dataset.field="graph";const i=document.createElement("canvas");i.className="graph-canvas";const r=document.createElement("div");return r.className="tooltip",o.appendChild(i),o.appendChild(r),t.appendChild(n),t.appendChild(o),e};let b=null;const De=()=>{b&&(b.style.display="none")},Vt=async()=>{var w;if(!window.location.pathname.includes("/watch/")||Yt())return null;const e=qt();if(!e)return m("EMOTION_TIMELINE_NO_SCRUBBER"),null;const t=e.getBoundingClientRect();(!b||!b.isConnected)&&(b=zt(),document.body.appendChild(b)),b.style.left=`${t.left}px`,b.style.width=`${t.width}px`,b.style.top=`${t.top-B}px`,b.style.height=`${B}px`,b.style.display="block";const n=document.querySelector("video"),o=window.location.pathname.match(/\/watch\/(\d+)/),i=(o==null?void 0:o[1])??null;if(!n||!i)return null;const r=n.duration||0;if(!r||!Number.isFinite(r))return null;const s=await nn(i,r);if(!s)return null;const a=(w=b.shadowRoot)==null?void 0:w.querySelector("[data-field='graph']");if(!a)return s;const c=a.querySelector(".graph-canvas"),l=a.querySelector(".tooltip");if(!c||!l)return s;const d=t.width,h=B,u=window.devicePixelRatio||1;c.width=d*u,c.height=h*u,c.style.width=`${d}px`,c.style.height=`${h}px`;const p=c.getContext("2d");if(!p)return s;p.setTransform(u,0,0,u,0,0);const g=s.buckets.reduce((ye,Ee)=>Math.max(ye,Ee.intensity),0),f=Ht(s.buckets,d,g);return F(p,f,d,h),H={points:f,ctx:p,logicalW:d,logicalH:h},Wt(c,l),s},Ft={KeyL:"laugh",KeyS:"sad",KeyA:"angry",KeyB:"bored",KeyH:"shock",KeyN:"neutral",KeyJ:"smile"},Me={laugh:"😂",smile:"😊",shock:"😱",sad:"😢",angry:"😡",scared:"😨",bored:"😴",neutral:"🙂"},_=()=>{const e=document.querySelectorAll("video");for(let t=0;t<e.length;t+=1){const n=e[t],o=n.getBoundingClientRect();if(o.width>=window.innerWidth*.5&&o.height>=window.innerHeight*.5)return n}return e[0]??null},$t=()=>`rx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,re=()=>document.querySelector(".watch-video--player-view, [data-uia*='video-player'], [class*='VideoPlayer']")??document.body,Kt=e=>{const t=re();if(!t)return;const n=Me[e];if(!n)return;const o=document.createElement("div");o.textContent=n,o.style.position="absolute",o.style.zIndex="2147483647",o.style.pointerEvents="none",o.style.fontSize="26px",o.style.filter="drop-shadow(0 2px 4px rgba(0,0,0,0.6))";const i=t.getBoundingClientRect(),r=.3+Math.random()*.4,s=.6+Math.random()*.15;o.style.left=`${i.width*r}px`,o.style.top=`${i.height*s}px`,o.style.transform="translate(-50%, 0)",o.style.opacity="1",o.style.transition="transform 700ms ease-out, opacity 700ms ease-out",t.appendChild(o),requestAnimationFrame(()=>{o.style.transform="translate(-50%, -60px)",o.style.opacity="0"}),window.setTimeout(()=>{o.remove()},800)};let P=null,O=null,v=null,Be=0,He=null,Pe=!1;const $="nxlb-reaction-timeline",se=1700,Xt=320,jt=260,Gt=120,K=()=>{if(P&&P.isConnected)return;const e=re();if(!e)return;const t=document.createElement("div");t.style.position="absolute",t.style.right="20px",t.style.top="50%",t.style.bottom="auto",t.style.transform="translateY(-50%)",t.style.zIndex="2147483646",t.style.pointerEvents="none";const n=document.createElement("div");n.style.pointerEvents="none",n.style.background="transparent",n.style.border="none",n.style.padding="0",n.style.fontFamily='"Netflix Sans", "Netflix Sans Icon", "Helvetica Neue", Helvetica, Arial, sans-serif',n.style.fontSize="11px",n.style.color="rgba(255,255,255,0.9)",n.style.textShadow="0 2px 8px rgba(0,0,0,0.8)",n.style.maxWidth="300px",n.style.display="flex",n.style.flexDirection="column",n.style.alignItems="center";const o=document.createElement("div");o.textContent="Press while watching!",o.style.fontWeight="700",o.style.fontSize="16px",o.style.marginBottom="10px",o.style.letterSpacing="0.25px",o.style.textAlign="center";const i=document.createElement("div");i.style.display="flex",i.style.flexDirection="column",i.style.alignItems="center",i.style.gap="10px",[["L","laugh"],["J","smile"],["H","shock"],["S","sad"],["A","angry"],["B","bored"],["N","neutral"]].forEach(([s,a])=>{const c=Me[a],l=document.createElement("div");l.style.display="flex",l.style.alignItems="center",l.style.justifyContent="center",l.style.gap="8px",l.style.whiteSpace="nowrap";const d=document.createElement("span");d.textContent=c,d.style.fontSize="18px",d.style.lineHeight="1";const h=document.createElement("span");h.textContent=`Press ${s}`,h.style.fontWeight="700",h.style.fontSize="13px",h.style.letterSpacing="0.25px";const u=document.createElement("span");u.textContent=a,u.style.textTransform="capitalize",u.style.fontSize="13px",u.style.opacity="0.92",l.appendChild(d),l.appendChild(h),l.appendChild(u),i.appendChild(l)}),n.appendChild(o),n.appendChild(i),t.appendChild(n),t.style.display="none",e.appendChild(t),P=t},X=e=>{P&&(P.style.display=e?"block":"none")},N=()=>window.location.pathname.includes("/watch/"),ke=()=>{O!==null&&(window.clearTimeout(O),O=null),v!==null&&(window.clearTimeout(v),v=null)},ae=(e=se,t=!1)=>{O!==null&&window.clearTimeout(O),t&&v!==null&&(window.clearTimeout(v),v=null),O=window.setTimeout(()=>{const n=_();!n||n.paused||n.ended||(X(!1),De())},e)},Ut=e=>{var n;if(!e||!(e instanceof Node))return!1;if(e instanceof HTMLElement&&e.id===$||e instanceof Element&&e.closest(`#${$}`))return!0;const t=(n=e.getRootNode)==null?void 0:n.call(e);return t instanceof ShadowRoot&&t.host instanceof HTMLElement&&t.host.id===$},le=(e=!1)=>{const t=Date.now();!e&&t-Be<jt||(Be=t,Vt())},ce=()=>{if(!N())return;const e=_();!e||e.paused||e.ended||(K(),X(!0),le(),v!==null&&window.clearTimeout(v),v=window.setTimeout(()=>{const t=_();!t||t.paused||t.ended||!N()||le(!0)},Gt),ae(se))},Jt=e=>{const t=_();if(!(!t||t.paused||t.ended)){if(e!=null&&e.relatedTarget&&Ut(e.relatedTarget)){ae(se);return}ae(Xt,!0)}},de=()=>{const e=re();!e||e===He||(He=e,e.addEventListener("mousemove",ce,{passive:!0}),e.addEventListener("mouseenter",ce,{passive:!0}),e.addEventListener("mouseleave",t=>Jt(t)),!Pe&&(Pe=!0,document.addEventListener("mousemove",t=>{if(!N())return;t.composedPath().some(o=>o instanceof HTMLElement&&o.id===$)&&ce()},{passive:!0})))},Qt=()=>{const e=window.location.pathname.match(/\/watch\/(\d+)/);if(e!=null&&e[1])return e[1];const{candidate:t}=bt();return(t==null?void 0:t.netflixTitleId)??null},Zt=()=>null,en=e=>{chrome.runtime.sendMessage({type:"STORE_REACTION_EVENT",payload:e}).catch(()=>{})},tn=()=>{const e=n=>{n.dataset.nxlReactionsObserved!=="1"&&(n.dataset.nxlReactionsObserved="1",N()&&(K(),de(),n.addEventListener("pause",()=>{ke(),X(!0),le(!0)}),n.addEventListener("play",()=>{ke(),X(!1),De()})))};if(N()){K(),de();const n=_();n&&e(n)}new MutationObserver(()=>{if(!N())return;K(),de();const n=_();n&&e(n)}).observe(document.body,{childList:!0,subtree:!0}),window.addEventListener("keydown",n=>{if(n.repeat)return;const o=Ft[n.code];if(!o)return;n.stopPropagation(),n.preventDefault();const i=_();if(!i)return;const r=Qt();if(!r)return;const s=i.currentTime,a={id:$t(),netflixId:r,profileId:Zt(),season:null,episode:null,timestampSec:s,createdAt:Date.now(),type:o};en(a),Kt(o)},!0)},nn=async(e,t)=>{try{return await chrome.runtime.sendMessage({type:"GET_REACTION_TIMELINE",payload:{netflixId:e,durationSec:t}})??null}catch{return null}},We="nxlb-status-badge",on=()=>{const e=document.createElement("div");e.id=We,e.style.position="fixed",e.style.bottom="16px",e.style.right="16px",e.style.zIndex="2147483647",e.style.pointerEvents="none";const t=e.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=`
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
  `,t.appendChild(n),t.appendChild(o),e},I=e=>{const t=document.getElementById(We);if(!e){t&&(t.remove(),m("OVERLAY_BADGE_REMOVED"));return}if(t)return;const n=on();document.documentElement.appendChild(n),m("OVERLAY_BADGE_MOUNTED")},ue={ctrlKey:!0,shiftKey:!0,key:"l"},rn=250,sn=2e3,an=.85,ln=.6,A=At();let S=!0,qe="",Ye=null,fe,he,ze="",D=null,R=!1,Ve=null,k=null;const Fe=()=>window,cn=e=>{if(!e)return!1;const t=e.getBoundingClientRect();return t.width===0||t.height===0?!1:t.width>window.innerWidth*an||t.height>window.innerHeight*ln},me=e=>{D&&D!==e&&(D.style.outline="",D.style.outlineOffset="",D=null),e&&(e.style.outline="1px solid rgba(255, 80, 80, 0.85)",e.style.outlineOffset="-1px",D=e)},dn=()=>window.location.pathname.includes("/watch/"),$e=()=>Array.from(document.querySelectorAll("video")).some(t=>{if(t.paused||t.ended)return!1;const n=t.getBoundingClientRect();if(n.width===0||n.height===0)return!1;const o=n.width/window.innerWidth,i=n.height/window.innerHeight;return o>.85||i>.6}),un=()=>!!document.querySelector("[data-uia*='video-player'], [class*='VideoPlayer'], [class*='watch-video'], [data-uia*='player']"),fn=()=>!!(dn()||$e()||un()&&$e()),pe=()=>{const e=fn();e!==R&&(R=e,R?(I(!1),m("BADGE_HIDDEN_PLAYBACK"),A.unmount()):S&&(I(!0),m("BADGE_SHOWN"),m("BROWSE_MODE_DETECTED")))},hn=()=>{if(!S){I(!1);return}R||(I(!0),m("BADGE_SHOWN"))},mn=e=>[e.normalizedTitle??"",e.year??"",e.netflixId??"",e.href??""].join("|"),pn=(e,t)=>({title:e,year:t??null,tmdb:{id:null,voteAverage:null,voteCount:null},letterboxd:{inWatchlist:!1,userRating:null,matchPercent:null,becauseYouLike:[]}}),gn=e=>{var t;try{return(t=chrome.runtime)!=null&&t.id?chrome.runtime.sendMessage(e):(m("EXT_CONTEXT_INVALID",{messageType:e==null?void 0:e.type}),Promise.resolve(null))}catch(n){return m("EXT_CONTEXT_SEND_FAILED",{error:n,messageType:e==null?void 0:e.type}),Promise.resolve(null)}},yn=()=>k?k.isConnected?k:(k=null,null):null,ge=e=>{if(!S||(pe(),R))return;m("OVERLAY_MOUNT_ATTEMPT",{reason:e});const t=dt(yn()),n=t.jawboneEl,o=t.extracted;if(!n||!o){m("OVERLAY_MOUNT_FAILED",{reason:"no-jawbone"}),A.unmount(),me(null);return}if(cn(n)){m("OVERLAY_MOUNT_FAILED",{reason:"hero-sized"}),A.unmount(),me(null);return}m("ACTIVE_JAWBONE_FOUND",{rawTitle:o.rawTitle,netflixId:o.netflixId,year:o.year,isSeries:o.isSeries,rejectedTitleCandidates:t.rejectedCount,chosenTitleElement:t.chosenTitleElement?t.chosenTitleElement.outerHTML.slice(0,200):void 0}),m("EXTRACTED_TITLE_INFO",o);const i=mn(o);if(i===qe&&n===Ye){m("OVERLAY_MOUNT_SUCCESS",{reused:!0});return}qe=i,Ye=n,me(n),A.mount(n),A.update(pn(o.rawTitle,o.year??void 0));const r=`req_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;ze=r;const s={type:"RESOLVE_OVERLAY_DATA",requestId:r,payload:o};m("OVERLAY_REQUEST",{titleText:o.rawTitle,normalizedTitle:o.normalizedTitle,href:o.href,year:o.year}),gn(s).then(a=>{var c,l,d,h,u,p;if(a&&(a==null?void 0:a.type)==="OVERLAY_DATA_RESOLVED"&&a.requestId===ze){Ve=a.payload,m("OVERLAY_RESPONSE",{requestId:r,tmdb:a.payload.tmdb,letterboxd:{inWatchlist:((c=a.payload.letterboxd)==null?void 0:c.inWatchlist)??!1,userRating:((l=a.payload.letterboxd)==null?void 0:l.userRating)??null,matchPercent:((d=a.payload.letterboxd)==null?void 0:d.matchPercent)??null,becauseYouLikeCount:((u=(h=a.payload.letterboxd)==null?void 0:h.becauseYouLike)==null?void 0:u.length)??0}}),A.update(a.payload);{const g=a.payload.letterboxd;if(!g||!g.inWatchlist&&g.userRating===null){const f=Ge(o.rawTitle,o.year??void 0);try{(p=chrome.runtime)!=null&&p.id?chrome.storage.local.get([y.LETTERBOXD_INDEX]).then(w=>{w[y.LETTERBOXD_INDEX]?o.year?m("LB_MATCH_NOT_FOUND",{reason:"no-key",key:f}):m("LB_MATCH_NOT_FOUND",{reason:"missing-year",key:f}):m("LB_MATCH_NOT_FOUND",{reason:"no-index",key:f})}):m("LB_INDEX_SKIP_EXT_CONTEXT_INVALID",{key:f})}catch(w){m("LB_INDEX_LOOKUP_FAILED",{error:w,key:f})}}}}}).catch(a=>{m("Title resolve failed",{requestId:r,err:a})})},L=e=>{fe&&window.clearTimeout(fe),fe=window.setTimeout(()=>{ge(e)},rn)},En=()=>{new MutationObserver(()=>{try{L("mutation")}catch(t){m("Mutation observer failed",{error:t})}}).observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class","style","aria-expanded","aria-hidden"]}),document.addEventListener("pointerover",t=>{try{k=t.target,L("pointer")}catch(n){m("Pointer observer failed",{error:n})}},!0),document.addEventListener("focusin",()=>{try{L("focus")}catch(t){m("Focus observer failed",{error:t})}},!0),he&&window.clearInterval(he),he=window.setInterval(()=>{S&&(pe(),!R&&(A.isMounted()||ge("watchdog")))},sn),L("init")},bn=async()=>{const t=!((await Te())[y.OVERLAY_ENABLED]??!0);await Ue({[y.OVERLAY_ENABLED]:t}),S=t,t?(hn(),L("toggle")):(A.unmount(),I(!1)),m("Overlay toggled",{enabled:t})},Tn=e=>{e.ctrlKey===ue.ctrlKey&&e.shiftKey===ue.shiftKey&&e.key.toLowerCase()===ue.key&&(e.preventDefault(),bn().catch(t=>m("Toggle failed",t)))},xn=()=>{chrome.runtime.onMessage.addListener(e=>{if((e==null?void 0:e.type)==="LB_INDEX_UPDATED"){m("LB_INDEX_UPDATED"),L("lb-index-updated");return}(e==null?void 0:e.type)==="LB_INDEX_UPDATED_ACK"&&(m("LB_INDEX_UPDATED_ACK",e.payload),L("lb-index-updated"))})},wn=()=>{const e=Fe();e.__nxlDebug={getLbIndex:async()=>chrome.storage.local.get(y.LETTERBOXD_INDEX),lastOverlayData:()=>Ve,forceResolve:()=>ge("force")}},vn=async()=>{const e=Fe();if(e.__nxlBooted)return;e.__nxlBooted=!0,S=(await Te())[y.OVERLAY_ENABLED]??!0,pe(),S&&!R&&(I(!0),m("BADGE_SHOWN"),m("BROWSE_MODE_DETECTED")),En(),xn(),wn(),window.addEventListener("keydown",Tn),tn()},Ke=async()=>{await vn()};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{Ke().catch(e=>m("Init failed",e))},{once:!0}):Ke().catch(e=>m("Init failed",e))})();
//# sourceMappingURL=index.js.map
