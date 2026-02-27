(function(){"use strict";const y={OVERLAY_ENABLED:"overlayEnabled",TMDB_API_KEY:"tmdbApiKey",TMDB_CACHE:"tmdbCache",TMDB_FEATURE_CACHE:"tmdbFeatureCache",MATCH_PROFILE:"matchProfile",LETTERBOXD_INDEX:"lb_index_v1",LETTERBOXD_STATS:"lb_stats_v1",LAST_IMPORT_AT:"lastImportAt",XRAY_ENABLED:"xrayEnabled",AWS_ACCESS_KEY_ID:"awsAccessKeyId",AWS_SECRET_ACCESS_KEY:"awsSecretAccessKey",AWS_REGION:"awsRegion"},h=(...t)=>{console.log("[Netflix+Letterboxd]",...t)},lt=t=>t?t.toLowerCase().replace(/&/g," and ").replace(/[^a-z0-9']+/g," ").replace(/\s+/g," ").trim():"",Bt=(t,e)=>{const n=lt(t),o=e?String(e):"";return`${n}-${o}`},Mt=(t,e)=>Bt(t,e),ct=async()=>(h("Loading storage state"),chrome.storage.local.get([y.OVERLAY_ENABLED,y.TMDB_API_KEY,y.TMDB_CACHE,y.TMDB_FEATURE_CACHE,y.MATCH_PROFILE,y.LETTERBOXD_INDEX,y.LETTERBOXD_STATS,y.LAST_IMPORT_AT,y.AWS_ACCESS_KEY_ID,y.AWS_SECRET_ACCESS_KEY,y.AWS_REGION])),Ht=async t=>{h("Saving storage state",t),await chrome.storage.local.set(t)},dt="a[href^='/title/']",Y=["[role='dialog']","[aria-modal='true']","[aria-expanded='true']","[data-uia*='jawbone']","[class*='jawbone']","[data-uia*='preview']","[data-uia*='billboard']","[data-uia*='hero']","[data-uia*='details']"],ut=["h1","h2","h3","[data-uia*='title']","[class*='title']","[class*='fallback']","[class*='preview'] [class*='header']"],ft=["video","img","[data-uia*='preview'] video","[data-uia*='preview'] img","[class*='preview'] video","[class*='preview'] img","[data-uia*='player'] video","[data-uia*='hero'] img"],ht=["[data-uia*='controls']","[class*='controls']","[class*='control']","[role='toolbar']"],M=/(S\d+\s*:?\s*E\d+|Season\s*\d+\s*Episode\s*\d+|Episode\s*\d+|\bE\d+\b)/i,z=/(\b\d+\s*(m|min|minutes)\b|\b\d+\s*of\s*\d+\s*(m|min|minutes)\b)/i,Pt=/\b(tv-[a-z0-9]+|pg-?13|pg|tv-ma|tv-y|tv-g|nr|nc-17|hd|uhd|4k|seasons?|season|episode|volume|part\s+\d+)\b/i,kt=/^(play|resume|continue|more info|details|watch|watch now|watch again|add|added|my list|remove|rate|like|dislike|thumbs up|thumbs down)$/i,Wt=/because you watched/i,pt=["[data-uia*='maturity-rating']","[data-uia*='season']","[data-uia*='resolution']","[data-uia*='hd']","[class*='maturity']","[class*='season']","[class*='quality']"],mt=["[data-uia*='genre']","a[href*='/genre/']","[class*='genre']"],gt=[...pt,...mt,"[data-uia*='metadata']","[class*='metadata']","[class*='meta']","[class*='maturity']","[class*='season']","[class*='genre']","[class*='tag']","[class*='info']"],qt=["header","nav","[data-uia*='header']","[data-uia*='row-title']","[class*='rowHeader']","[class*='row-title']"],H=["h1","h2","h3","h4","[data-uia*='title']","[class*='title']","[class*='headline']","[class*='header']","[class*='name']"],Yt=/(browse|home|my list|popular|your next watch|explore all|movies & shows|movies and shows|new & popular)/i,E=t=>{const e=t.getBoundingClientRect();if(e.width===0||e.height===0)return!1;const n=window.getComputedStyle(t);return n.visibility==="hidden"||n.display==="none"||n.opacity==="0"?!1:e.bottom>=0&&e.right>=0&&e.top<=window.innerHeight&&e.left<=window.innerWidth},x=t=>{if(!t)return;const e=t.replace(/\s+/g," ").trim();return e.length?e:void 0},yt=t=>{if(!t)return;const e=t.match(/\/title\/(\d+)/);return e==null?void 0:e[1]},P=t=>{if(!t)return;const e=t.match(/(19\d{2}|20\d{2})/);if(!e)return;const n=Number(e[1]);if(!Number.isNaN(n))return n},T=t=>{if(!t)return;let e=t;return e=e.replace(/^\s*S\d+\s*:?\s*E\d+\s*/i,""),e=e.replace(/"[^"]*"/g,n=>{const o=n.replace(/"/g,"");return M.test(o)?"":n}),e=e.replace(/Episode\s*\d+/gi,""),e=e.replace(/\bE\d+\b/gi,""),e=e.replace(z,""),e=e.replace(/\s+of\s+\d+\s*(m|min|minutes)?/gi,""),e=e.replace(/\s+/g," ").trim(),e.length?e:void 0},Et=(t,e)=>{const n=t.getAttribute("href")||void 0,o=yt(n),i=x(t.getAttribute("aria-label")||t.textContent);return{netflixTitleId:o,titleText:i,href:n,source:e}},F=t=>{for(const e of ut){const n=t.querySelector(e);if(n&&E(n)){const o=x(n.textContent);if(o)return o}}},zt=t=>{if(t)return F(t)},Ft=t=>{if(t)for(const e of ut){const n=Array.from(t.querySelectorAll(e));for(const o of n){if(!E(o))continue;const i=x(o.textContent);if(!i||M.test(i)||z.test(i))continue;const r=T(i);if(r)return r}}},k=t=>{if(!t)return null;const e=[];return ft.forEach(n=>{t.querySelectorAll(n).forEach(o=>{E(o)&&e.push(o)})}),e.length?e.reduce((n,o)=>{const i=n.getBoundingClientRect(),r=o.getBoundingClientRect(),a=i.width*i.height;return r.width*r.height>a?o:n}):null},L=t=>{var i;if(!t)return null;const e=[];ht.forEach(r=>{t.querySelectorAll(r).forEach(a=>{E(a)&&e.push(a)})});const o=Array.from(new Set(e)).map(r=>{const a=r.querySelectorAll("button, [role='button']").length,s=r.getBoundingClientRect(),l=a*10+s.width;return{el:r,score:l,top:s.top}}).filter(r=>r.score>0);return o.sort((r,a)=>a.score-r.score||a.top-r.top),((i=o[0])==null?void 0:i.el)??null},Vt=t=>{if(!t)return!1;const e=[...pt,...mt].join(",");return Array.from(t.querySelectorAll(e)).some(o=>E(o))},Kt=t=>!!t.closest(gt.join(",")),V=t=>!!t.closest(qt.join(",")),C=t=>Yt.test(t)||kt.test(t.trim())||Wt.test(t)||Pt.test(t)?!0:M.test(t)||z.test(t)||/\b\d+\s*of\s*\d+\s*(m|min|minutes)?\b/i.test(t)||/\b\d+\s*(m|min|minutes)\b/i.test(t),K=(t,e)=>t.closest('[role="progressbar"], [data-uia*="progress"], [class*="progress"]')?!0:e!==void 0?t.getBoundingClientRect().bottom>=e-8:!1,W=(t,e)=>t?e&&(e.contains(t)||t.closest("button, [role='button']"))?!0:!!t.closest("button, [role='button'], [data-uia*='play'], [data-uia*='button']"):!1,Xt=t=>{const e=t.getBoundingClientRect(),n=L(t),o=n?n.getBoundingClientRect().top:void 0,i=Array.from(t.querySelectorAll(H.join(",")));let r,a=0;const s=[];if(i.forEach(c=>{if(!E(c)){a+=1;return}if(V(c)){a+=1;return}if(W(c,n)){a+=1;return}if(K(c,o)){a+=1;return}const d=x(c.textContent);if(!d||d.length<2||d.length>80){a+=1;return}if(C(d)){s.push(c),a+=1;return}const p=c.getBoundingClientRect(),f=window.getComputedStyle(c),m=parseFloat(f.fontSize)||14,g=f.fontWeight==="bold"?700:Number(f.fontWeight),u=Number.isNaN(g)?400:g,w=p.left-e.left,at=p.top-e.top,st=Math.hypot(w,at),on=Kt(c)?120:0,Dt=m*10+u/10+Math.max(0,300-st)-on;(!r||Dt>r.score)&&(r={el:c,score:Dt,text:d})}),r)return{title:T(r.text)??r.text,chosen:r.el,rejectedCount:a};for(const c of s){let d=c.parentElement,p=0;for(;d&&p<4;){const f=Array.from(d.querySelectorAll(H.join(","))).filter(m=>m!==c);for(const m of f){if(!E(m)||W(m,n)||K(m,o))continue;const g=x(m.textContent);if(!(!g||g.length<2||g.length>80)&&!C(g))return{title:T(g)??g,chosen:m,rejectedCount:a}}d=d.parentElement,p+=1}}const l=t.querySelector("a[href^='/title/']");if(l){const c=l.querySelector(H.join(",")),d=x((c==null?void 0:c.textContent)||l.textContent);if(d&&!C(d))return{title:T(d)??d,chosen:c??l,rejectedCount:a};let p=l.parentElement,f=0;for(;p&&f<4;){const m=Array.from(p.querySelectorAll(H.join(",")));for(const g of m){if(!E(g)||W(g,n)||K(g,o))continue;const u=x(g.textContent);if(!(!u||u.length<2||u.length>80)&&!C(u))return{title:T(u)??u,chosen:g,rejectedCount:a}}p=p.parentElement,f+=1}}return{title:null,rejectedCount:a}},$t=t=>{const n=Array.from(t.querySelectorAll(gt.join(","))).map(l=>x(l.textContent)).filter(Boolean);if(!n.length){const l=L(t),c=l==null?void 0:l.nextElementSibling,d=x(c==null?void 0:c.textContent);d&&n.push(d)}const o=n.join(" "),i=P(o),r=/\bseasons?\b/i.test(o),a=/\b\d+\s*(m|min|minutes)\b/i.test(o)||/\b\d+\s*h\b/i.test(o);let s;return r?s=!0:a&&(s=!1),{year:i,isSeries:s}},X=t=>{var n,o;const e=[t.getAttribute("aria-label"),t.getAttribute("title"),(n=t.querySelector("img[alt]"))==null?void 0:n.alt,(o=t.querySelector("[aria-label]"))==null?void 0:o.getAttribute("aria-label"),t.textContent];for(const i of e){const r=x(i);if(r&&!C(r))return r}},jt=t=>{var o,i,r,a,s;const e=t,n=[((o=e.getAttribute)==null?void 0:o.call(e,"aria-label"))??void 0,((i=e.getAttribute)==null?void 0:i.call(e,"data-uia-title"))??void 0,((r=e.getAttribute)==null?void 0:r.call(e,"title"))??void 0,(s=(a=e.querySelector)==null?void 0:a.call(e,"img[alt]"))==null?void 0:s.alt,e.textContent];for(const l of n){const c=x(l);if(c&&!C(c)&&!V(e))return c}},Gt=(t,e,n)=>{const i=Array.from(t.querySelectorAll("a[href^='/title/']")).filter(s=>E(s));if(!i.length)return null;const r=e==null?void 0:e.getBoundingClientRect();let a=null;for(const s of i){if(V(s)||W(s,n)||!X(s))continue;const c=s.getBoundingClientRect(),d=c.width*c.height;let p=0;if(r){const f=r.top-220,m=r.bottom+220;if(c.bottom<f||c.top>m)continue}if(e&&(s.contains(e)||e.contains(s))&&(p+=1e3),r){const f=c.left+c.width/2-(r.left+r.width/2),m=c.top+c.height/2-(r.top+r.height/2),g=Math.hypot(f,m);p+=Math.max(0,500-g)}p+=Math.min(d/100,200),p+=50,(!a||p>a.score)&&(a={anchor:s,score:p})}return(a==null?void 0:a.anchor)??null},Ut=t=>{if(t){const e=Jt(t);if(e)return e}return Qt()},$=(t,e,n)=>{const o=lt(t);if(!o)return null;const i=(e==null?void 0:e.getAttribute("href"))??null,r=yt(i)??null,{year:a,isSeries:s}=$t(n);return{rawTitle:t,normalizedTitle:o,year:a??null,isSeries:s,netflixId:r,href:i}},Jt=t=>{const e=ne(t);let n,o=null;if(e){const a=X(e);a&&(n=T(a)??a,o=e)}if(!n){let a=t,s=0;for(;a&&a!==document.body&&s<8;){const l=jt(a);if(l){n=T(l)??l;break}a=a.parentElement,s+=1}}if(!n)return null;if(o){const a=oe(o);if(a){const s=$(n,o,a);return s?{jawboneEl:a,extracted:s,chosenTitleElement:o}:null}}let i=o??t,r=0;for(;i&&i!==document.body&&r<8;){if(i instanceof HTMLElement){const a=i.getBoundingClientRect();if(a.width>=200&&a.height>=120){const s=$(n,o,i);if(s)return{jawboneEl:i,extracted:s,chosenTitleElement:o??void 0}}}i=i.parentElement,r+=1}return null},Qt=()=>{const t=ee(),e=ie().map(r=>({root:r,preview:k(r)})),n=t?[{root:t.root,preview:t.preview},...e.filter(r=>r.root!==t.root)]:e,o=window.innerWidth*.85,i=window.innerHeight*.6;for(const r of n){const a=r.root,s=a.getBoundingClientRect();if(s.width>o||s.height>i)continue;const l=r.preview??k(a),c=L(a),d=Vt(a);if(!l||!c)continue;const p=Gt(a,l,c);let f=null,m=null;if(p){const u=X(p);u&&(f=T(u)??u,m=p)}if(f||(f=Xt(a).title??null),!f&&!d)continue;if(!f&&d){const u=zt(a);u&&!C(u)&&(f=T(u)??u)}if(!f)continue;const g=$(f,m,a);if(g)return{jawboneEl:a,extracted:g,chosenTitleElement:m??void 0}}return{jawboneEl:null,extracted:null}},j=(t,e)=>{const n=Ft(t);if(n)return n;const o=T(e);if(o&&!M.test(o))return o;if(e)return T(e)??e},Zt=t=>{const e=Array.from(t.querySelectorAll(dt)),n=e.filter(E);return n.length>0?n[0]:e[0]},bt=()=>{const t=Y.join(","),e=Array.from(document.querySelectorAll(t)),n=e.filter(E),o=window.innerWidth*.85,i=window.innerHeight*.6,r=n.filter(a=>{const s=a.getBoundingClientRect();return!(s.width===0||s.height===0||s.width<240||s.height<180||s.width>o||s.height>i)});return r.length>0?r.sort((a,s)=>{const l=a.getBoundingClientRect(),c=s.getBoundingClientRect();return c.width*c.height-l.width*l.height}):n.length>0?n:e},te=()=>{const t=[];return ft.forEach(e=>{document.querySelectorAll(e).forEach(n=>{if(!E(n))return;const o=n.getBoundingClientRect();o.width<200||o.height<120||t.push(n)})}),t},ee=()=>{const t=te();if(!t.length)return null;const e=window.innerWidth*.85,n=window.innerHeight*.6,o=t.sort((i,r)=>{const a=i.getBoundingClientRect(),s=r.getBoundingClientRect();return s.width*s.height-a.width*a.height});for(const i of o){let r=i,a=0;for(;r&&a<8;){if(r instanceof HTMLElement){const s=r.getBoundingClientRect();if(s.width>=240&&s.height>=180&&s.width<=e&&s.height<=n&&L(r))return{root:r,preview:i}}r=r.parentElement,a+=1}}return null},ne=t=>{var o,i,r;let e=t;for(;e&&e!==document.body;){if(e instanceof HTMLAnchorElement&&((o=e.getAttribute("href"))!=null&&o.startsWith("/title/")))return e;const a=(i=e.querySelector)==null?void 0:i.call(e,":scope > a[href^='/title/']");if(a&&E(a))return a;e=e.parentElement}const n=(r=t.querySelector)==null?void 0:r.call(t,"a[href^='/title/']");return n&&E(n)?n:null},oe=t=>{let e=t,n=0;const o=window.innerWidth*.85,i=window.innerHeight*.6;for(;e&&e!==document.body&&n<12;){if(e instanceof HTMLElement){const r=e.getBoundingClientRect();if(r.width>=240&&r.height>=180&&r.width<=o&&r.height<=i){const a=k(e),s=L(e);if(a&&s)return e}}e=e.parentElement,n+=1}return null},ie=()=>{const t=bt();if(t.length)return t;const e=Array.from(document.querySelectorAll(ht.join(","))),n=window.innerWidth*.85,o=window.innerHeight*.6,i=new Set;return e.forEach(r=>{let a=r,s=0;for(;a&&s<6;){if(a instanceof HTMLElement){const l=a.getBoundingClientRect();if(l.width>=240&&l.height>=180&&l.width<=n&&l.height<=o&&k(a)){i.add(a);break}}a=a.parentElement,s+=1}}),Array.from(i)},re=()=>{const t=bt();for(const n of t){const o=Zt(n);if(o){const r=Et(o,"container-anchor");if(r.netflixTitleId||r.titleText){const a=r.titleText??F(n),s=j(n,a??r.titleText);return{candidate:{...r,titleText:s,year:P(s??a)},container:n}}}const i=F(n);if(i){const r=j(n,i);return{candidate:{titleText:r??i,year:P(r??i),source:"container-text"},container:n}}}const e=Array.from(document.querySelectorAll(dt)).find(E);if(e){const n=Et(e,"page-anchor"),o=j(e.closest(Y.join(","))??e.parentElement,n.titleText);return{candidate:{...n,titleText:o??n.titleText,year:P(o??n.titleText)},container:e.closest(Y.join(","))??e.parentElement}}return{candidate:null,container:null}},ae="nxlb-top-section",se=()=>{const t=document.createElement("div");t.id=ae,t.style.display="block",t.style.width="100%",t.style.pointerEvents="none";const e=t.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=`
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
  `,i.appendChild(r);const a=document.createElement("div");a.className="nxl-body";const s=document.createElement("div");s.className="nxl-rating",s.dataset.field="communityRating",s.textContent="Community rating: —";const l=document.createElement("div");l.className="nxl-match",l.dataset.field="match",l.textContent="Your match: —";const c=document.createElement("div");c.className="nxl-because",c.dataset.field="because",c.textContent="Because you like: —";const d=document.createElement("div");return d.className="nxl-badges",d.dataset.field="badges",a.appendChild(s),a.appendChild(l),a.appendChild(c),a.appendChild(d),o.appendChild(i),o.appendChild(a),e.appendChild(n),e.appendChild(o),t},le=t=>t==null?"":t>=1e6?`${(t/1e6).toFixed(1)}M`:t>=1e3?`${(t/1e3).toFixed(1)}K`:`${t}`,ce=t=>{const e=Math.max(0,Math.min(5,t)),n=Math.floor(e),o=e%1>=.5;return"★".repeat(n)+(o?"½":"")},xt=(t,e)=>{var c,d,p,f,m,g;const n=((c=e.tmdb)==null?void 0:c.voteAverage)??null,o=((d=e.tmdb)==null?void 0:d.voteCount)??null,i=e.letterboxd,r=(p=t.shadowRoot)==null?void 0:p.querySelector("[data-field='communityRating']");if(r)if(n!=null){const u=le(o),w=n/2;r.innerHTML=`
        Community rating:
        <span class="nxl-star">★</span>
        ${w.toFixed(1)}${u?` <span class="nxl-meta">${u} ratings</span>`:""}
      `}else r.textContent="Community rating: —";const a=(f=t.shadowRoot)==null?void 0:f.querySelector("[data-field='match']");a&&((i==null?void 0:i.matchPercent)!==null&&(i==null?void 0:i.matchPercent)!==void 0?a.innerHTML=`Your match: <span class="nxl-match-value">${i.matchPercent}%</span>`:a.textContent="Your match: —");const s=(m=t.shadowRoot)==null?void 0:m.querySelector("[data-field='because']");if(s){const u=(i==null?void 0:i.becauseYouLike)??[];s.textContent=u.length>0?`Because you like: ${u.join(", ")}`:"Because you like: —"}const l=(g=t.shadowRoot)==null?void 0:g.querySelector("[data-field='badges']");if(l){if(l.innerHTML="",i!=null&&i.inWatchlist){const u=document.createElement("span");u.className="nxl-badge",u.textContent="On your watchlist",l.appendChild(u)}if((i==null?void 0:i.userRating)!==null&&(i==null?void 0:i.userRating)!==void 0){const u=document.createElement("span");u.className="nxl-badge",u.textContent=`You rated ${ce(i.userRating)}`,l.appendChild(u)}if(!(i!=null&&i.inWatchlist)&&(i==null?void 0:i.userRating)===void 0){const u=document.createElement("span");u.className="nxl-badge",u.textContent="Letterboxd: —",l.appendChild(u)}}},de=()=>{let t=null,e=null,n=null;const o=()=>{e||(e=se())};return{mount:l=>{o(),e&&t!==l&&(e.remove(),l.insertBefore(e,l.firstChild),t=l,requestAnimationFrame(()=>{e==null||e.classList.add("nxl-visible")}))},update:l=>{n=l,e&&xt(e,l)},unmount:()=>{e&&e.remove(),t=null},renderLast:()=>{e&&n&&xt(e,n)},getLastData:()=>n,getCurrentRoot:()=>t,isMounted:()=>!!(e&&e.isConnected)}},ue="nxlb-reaction-timeline",N=40,fe={laugh:"😂",smile:"😊",shock:"😱",sad:"😢",angry:"😡",scared:"😨",bored:"😴",neutral:"🙂"},he=["laugh","smile","shock"],pe=["angry","scared"],me=["sad","bored"],G=[76,217,100],U=[255,69,58],J=[90,130,230],ge=t=>{if(t.count===0)return{green:0,red:0,blue:0};const e=he.reduce((r,a)=>r+t.reactions[a],0),n=pe.reduce((r,a)=>r+t.reactions[a],0),o=me.reduce((r,a)=>r+t.reactions[a],0),i=e+n+o;return i===0?{green:.33,red:.33,blue:.33}:{green:e/i,red:n/i,blue:o/i}},ye=(t,e)=>{const n=Math.round(t.green*G[0]+t.red*U[0]+t.blue*J[0]),o=Math.round(t.green*G[1]+t.red*U[1]+t.blue*J[1]),i=Math.round(t.green*G[2]+t.red*U[2]+t.blue*J[2]);return`rgba(${n}, ${o}, ${i}, ${Math.max(.2,Math.min(.85,e))})`},Ee=(t,e,n,o,i=6)=>({cp1:[e[0]+(n[0]-t[0])/i,e[1]+(n[1]-t[1])/i],cp2:[n[0]-(o[0]-e[0])/i,n[1]-(o[1]-e[1])/i]}),be=(t,e,n)=>{const o=e/t.length;return t.map((i,r)=>{const a=(r+.5)*o,s=n>0?i.intensity/n:0,l=i.count>0?s*N:0,c=ge(i),d=ye(c,s);return{x:a,y:l,color:d,bucket:i}})},xe=(t,e,n)=>{const o=t.createLinearGradient(0,0,n,0);for(const i of e){const r=Math.max(0,Math.min(1,i.x/n));o.addColorStop(r,i.color)}return o},Tt=(t,e,n)=>{const o=i=>n-i;t.moveTo(e[0].x,o(e[0].y));for(let i=0;i<e.length-1;i++){const r=e[Math.max(0,i-1)],a=e[i],s=e[i+1],l=e[Math.min(e.length-1,i+2)],{cp1:c,cp2:d}=Ee([r.x,o(r.y)],[a.x,o(a.y)],[s.x,o(s.y)],[l.x,o(l.y)]);t.bezierCurveTo(c[0],c[1],d[0],d[1],s.x,o(s.y))}},q=(t,e,n,o)=>{t.clearRect(0,0,n,o),e.length!==0&&(t.beginPath(),t.moveTo(0,o),t.lineTo(e[0].x,o),Tt(t,e,o),t.lineTo(e[e.length-1].x,o),t.lineTo(0,o),t.closePath(),t.fillStyle=xe(t,e,n),t.fill(),t.beginPath(),Tt(t,e,o),t.strokeStyle="rgba(255, 255, 255, 0.3)",t.lineWidth=1,t.stroke())},Te=t=>{if(t.count===0)return"";const e=Object.entries(t.reactions).filter(([,n])=>n>0).sort((n,o)=>o[1]-n[1]);return e.length===0?"":e.map(([n,o])=>`${fe[n]} ${o}`).join("  ")};let I=null;const we=(t,e)=>{if(t.dataset.hoverBound==="1")return;t.dataset.hoverBound="1";let n=-1;t.addEventListener("mousemove",o=>{if(!I)return;const{points:i,ctx:r,logicalW:a,logicalH:s}=I;if(i.length===0)return;const l=t.getBoundingClientRect(),c=o.clientX-l.left,d=a/i.length,p=Math.min(i.length-1,Math.max(0,Math.floor(c/d)));if(p===n)return;n=p;const f=i[p],m=Te(f.bucket);if(!m){e.style.display="none",q(r,i,a,s);return}e.textContent=m,e.style.display="block",e.style.left=`${f.x}px`,q(r,i,a,s),r.beginPath(),r.moveTo(f.x,0),r.lineTo(f.x,s),r.strokeStyle="rgba(255, 255, 255, 0.25)",r.lineWidth=1,r.stroke()}),t.addEventListener("mouseleave",()=>{if(!I)return;const{points:o,ctx:i,logicalW:r,logicalH:a}=I;e.style.display="none",n=-1,q(i,o,r,a)})},ve=()=>{const t=["[data-uia='timeline']","[class*='scrubber']","[role='slider'][aria-label]","[class*='Slider']","[class*='progress-bar']","[class*='PlayerTimeline']"];for(const e of t){const n=document.querySelector(e);if(n&&n.getBoundingClientRect().width>100)return n}return null},Ce=()=>!!document.querySelector("[data-uia*='ad-break'], [data-uia*='interstitial'], [class*='AdBreak'], [class*='interstitial']"),Ae=()=>{const t=document.createElement("div");t.id=ue,t.style.position="fixed",t.style.zIndex="2147483645",t.style.pointerEvents="auto",t.style.height=`${N}px`;const e=t.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=`
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
  `;const o=document.createElement("div");o.className="graph-container",o.dataset.field="graph";const i=document.createElement("canvas");i.className="graph-canvas";const r=document.createElement("div");return r.className="tooltip",o.appendChild(i),o.appendChild(r),e.appendChild(n),e.appendChild(o),t};let b=null;const _e=()=>{b&&(b.style.display="none")},Se=async()=>{var w;if(!window.location.pathname.includes("/watch/")||Ce())return null;const t=ve();if(!t)return h("EMOTION_TIMELINE_NO_SCRUBBER"),null;const e=t.getBoundingClientRect();(!b||!b.isConnected)&&(b=Ae(),document.body.appendChild(b)),b.style.left=`${e.left}px`,b.style.width=`${e.width}px`,b.style.top=`${e.top-N}px`,b.style.height=`${N}px`,b.style.display="block";const n=document.querySelector("video"),o=window.location.pathname.match(/\/watch\/(\d+)/),i=(o==null?void 0:o[1])??null;if(!n||!i)return null;const r=n.duration||0;if(!r||!Number.isFinite(r))return null;const a=await He(i,r);if(!a)return null;const s=(w=b.shadowRoot)==null?void 0:w.querySelector("[data-field='graph']");if(!s)return a;const l=s.querySelector(".graph-canvas"),c=s.querySelector(".tooltip");if(!l||!c)return a;const d=e.width,p=N,f=window.devicePixelRatio||1;l.width=d*f,l.height=p*f,l.style.width=`${d}px`,l.style.height=`${p}px`;const m=l.getContext("2d");if(!m)return a;m.setTransform(f,0,0,f,0,0);const g=a.buckets.reduce((at,st)=>Math.max(at,st.intensity),0),u=be(a.buckets,d,g);return q(m,u,d,p),I={points:u,ctx:m,logicalW:d,logicalH:p},we(l,c),a},Re={KeyL:"laugh",KeyS:"sad",KeyA:"angry",KeyB:"bored",KeyH:"shock",KeyN:"neutral",KeyJ:"smile"},wt={laugh:"😂",smile:"😊",shock:"😱",sad:"😢",angry:"😡",scared:"😨",bored:"😴",neutral:"🙂"},Q=()=>{const t=document.querySelectorAll("video");for(let e=0;e<t.length;e+=1){const n=t[e],o=n.getBoundingClientRect();if(o.width>=window.innerWidth*.5&&o.height>=window.innerHeight*.5)return n}return t[0]??null},Oe=()=>`rx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,vt=()=>document.querySelector(".watch-video--player-view, [data-uia*='video-player'], [class*='VideoPlayer']")??document.body,Le=t=>{const e=vt();if(!e)return;const n=wt[t];if(!n)return;const o=document.createElement("div");o.textContent=n,o.style.position="absolute",o.style.zIndex="2147483647",o.style.pointerEvents="none",o.style.fontSize="26px",o.style.filter="drop-shadow(0 2px 4px rgba(0,0,0,0.6))";const i=e.getBoundingClientRect(),r=.3+Math.random()*.4,a=.6+Math.random()*.15;o.style.left=`${i.width*r}px`,o.style.top=`${i.height*a}px`,o.style.transform="translate(-50%, 0)",o.style.opacity="1",o.style.transition="transform 700ms ease-out, opacity 700ms ease-out",e.appendChild(o),requestAnimationFrame(()=>{o.style.transform="translate(-50%, -60px)",o.style.opacity="0"}),window.setTimeout(()=>{o.remove()},800)};let D=null;const Ne=()=>{if(D&&D.isConnected)return;const t=vt();if(!t)return;const e=document.createElement("div");e.style.position="absolute",e.style.right="16px",e.style.bottom="80px",e.style.zIndex="2147483646",e.style.pointerEvents="none";const n=document.createElement("div");n.style.pointerEvents="auto",n.style.background="rgba(0,0,0,0.88)",n.style.borderRadius="12px",n.style.border="1px solid rgba(255,255,255,0.18)",n.style.padding="10px 12px",n.style.fontFamily='"Netflix Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',n.style.fontSize="11px",n.style.color="rgba(255,255,255,0.9)",n.style.boxShadow="0 8px 24px rgba(0,0,0,0.5)";const o=document.createElement("div");o.textContent="Reactions (press while watching)",o.style.fontWeight="600",o.style.marginBottom="6px";const i=document.createElement("div");i.style.display="grid",i.style.gridTemplateColumns="auto 1fr",i.style.rowGap="4px",i.style.columnGap="6px",[["L","laugh"],["J","smile"],["H","shock"],["S","sad"],["A","angry"],["B","bored"],["N","neutral"]].forEach(([a,s])=>{const l=wt[s],c=document.createElement("div");c.textContent=`${l}  ${a}`,c.style.whiteSpace="nowrap";const d=document.createElement("div");d.textContent=s,d.style.textTransform="capitalize",d.style.opacity="0.75",i.appendChild(c),i.appendChild(d)}),n.appendChild(o),n.appendChild(i),e.appendChild(n),e.style.display="none",t.appendChild(e),D=e},Ct=t=>{D&&(D.style.display=t?"block":"none")},Z=()=>window.location.pathname.includes("/watch/"),Ie=()=>{const t=window.location.pathname.match(/\/watch\/(\d+)/);if(t!=null&&t[1])return t[1];const{candidate:e}=re();return(e==null?void 0:e.netflixTitleId)??null},De=()=>null,Be=t=>{chrome.runtime.sendMessage({type:"STORE_REACTION_EVENT",payload:t}).catch(()=>{})},Me=()=>{const t=n=>{n.dataset.nxlReactionsObserved!=="1"&&(n.dataset.nxlReactionsObserved="1",Z()&&(Ne(),n.addEventListener("pause",()=>{Ct(!0),Se()}),n.addEventListener("play",()=>{Ct(!1),_e()})))};if(Z()){const n=Q();n&&t(n)}new MutationObserver(()=>{if(!Z())return;const n=Q();n&&t(n)}).observe(document.body,{childList:!0,subtree:!0}),window.addEventListener("keydown",n=>{if(n.repeat)return;const o=Re[n.code];if(!o)return;n.stopPropagation(),n.preventDefault();const i=Q();if(!i)return;const r=Ie();if(!r)return;const a=i.currentTime,s={id:Oe(),netflixId:r,profileId:De(),season:null,episode:null,timestampSec:a,createdAt:Date.now(),type:o};Be(s),Le(o)},!0)},He=async(t,e)=>{try{return await chrome.runtime.sendMessage({type:"GET_REACTION_TIMELINE",payload:{netflixId:t,durationSec:e}})??null}catch{return null}},At="nxlb-status-badge",Pe=()=>{const t=document.createElement("div");t.id=At,t.style.position="fixed",t.style.bottom="16px",t.style.right="16px",t.style.zIndex="2147483647",t.style.pointerEvents="none";const e=t.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=`
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
  `,e.appendChild(n),e.appendChild(o),t},R=t=>{const e=document.getElementById(At);if(!t){e&&(e.remove(),h("OVERLAY_BADGE_REMOVED"));return}if(e)return;const n=Pe();document.documentElement.appendChild(n),h("OVERLAY_BADGE_MOUNTED")},tt={ctrlKey:!0,shiftKey:!0,key:"l"},ke=250,We=2e3,qe=.85,Ye=.6,v=de();let A=!0,_t="",St=null,et,nt,Rt="",O=null,_=!1,Ot=null,B=null;const Lt=()=>window,ze=t=>{if(!t)return!1;const e=t.getBoundingClientRect();return e.width===0||e.height===0?!1:e.width>window.innerWidth*qe||e.height>window.innerHeight*Ye},ot=t=>{O&&O!==t&&(O.style.outline="",O.style.outlineOffset="",O=null),t&&(t.style.outline="1px solid rgba(255, 80, 80, 0.85)",t.style.outlineOffset="-1px",O=t)},Fe=()=>window.location.pathname.includes("/watch/"),Nt=()=>Array.from(document.querySelectorAll("video")).some(e=>{if(e.paused||e.ended)return!1;const n=e.getBoundingClientRect();if(n.width===0||n.height===0)return!1;const o=n.width/window.innerWidth,i=n.height/window.innerHeight;return o>.85||i>.6}),Ve=()=>!!document.querySelector("[data-uia*='video-player'], [class*='VideoPlayer'], [class*='watch-video'], [data-uia*='player']"),Ke=()=>!!(Fe()||Nt()||Ve()&&Nt()),it=()=>{const t=Ke();t!==_&&(_=t,_?(R(!1),h("BADGE_HIDDEN_PLAYBACK"),v.unmount()):A&&(R(!0),h("BADGE_SHOWN"),h("BROWSE_MODE_DETECTED")))},Xe=()=>{if(!A){R(!1);return}_||(R(!0),h("BADGE_SHOWN"))},$e=t=>[t.normalizedTitle??"",t.year??"",t.netflixId??"",t.href??""].join("|"),je=(t,e)=>({title:t,year:e??null,tmdb:{id:null,voteAverage:null,voteCount:null},letterboxd:{inWatchlist:!1,userRating:null,matchPercent:null,becauseYouLike:[]}}),Ge=t=>{var e;try{return(e=chrome.runtime)!=null&&e.id?chrome.runtime.sendMessage(t):(h("EXT_CONTEXT_INVALID",{messageType:t==null?void 0:t.type}),Promise.resolve(null))}catch(n){return h("EXT_CONTEXT_SEND_FAILED",{error:n,messageType:t==null?void 0:t.type}),Promise.resolve(null)}},Ue=()=>B?B.isConnected?B:(B=null,null):null,rt=t=>{if(!A||(it(),_))return;h("OVERLAY_MOUNT_ATTEMPT",{reason:t});const e=Ut(Ue()),n=e.jawboneEl,o=e.extracted;if(!n||!o){h("OVERLAY_MOUNT_FAILED",{reason:"no-jawbone"}),v.unmount(),ot(null);return}if(ze(n)){h("OVERLAY_MOUNT_FAILED",{reason:"hero-sized"}),v.unmount(),ot(null);return}h("ACTIVE_JAWBONE_FOUND",{rawTitle:o.rawTitle,netflixId:o.netflixId,year:o.year,isSeries:o.isSeries,rejectedTitleCandidates:e.rejectedCount,chosenTitleElement:e.chosenTitleElement?e.chosenTitleElement.outerHTML.slice(0,200):void 0}),h("EXTRACTED_TITLE_INFO",o);const i=$e(o);if(i===_t&&n===St){h("OVERLAY_MOUNT_SUCCESS",{reused:!0});return}_t=i,St=n,ot(n),v.mount(n),v.update(je(o.rawTitle,o.year??void 0));const r=`req_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;Rt=r;const a={type:"RESOLVE_OVERLAY_DATA",requestId:r,payload:o};h("OVERLAY_REQUEST",{titleText:o.rawTitle,normalizedTitle:o.normalizedTitle,href:o.href,year:o.year}),Ge(a).then(s=>{var l,c,d,p,f,m;if(s&&(s==null?void 0:s.type)==="OVERLAY_DATA_RESOLVED"&&s.requestId===Rt){Ot=s.payload,h("OVERLAY_RESPONSE",{requestId:r,tmdb:s.payload.tmdb,letterboxd:{inWatchlist:((l=s.payload.letterboxd)==null?void 0:l.inWatchlist)??!1,userRating:((c=s.payload.letterboxd)==null?void 0:c.userRating)??null,matchPercent:((d=s.payload.letterboxd)==null?void 0:d.matchPercent)??null,becauseYouLikeCount:((f=(p=s.payload.letterboxd)==null?void 0:p.becauseYouLike)==null?void 0:f.length)??0}}),v.update(s.payload);{const g=s.payload.letterboxd;if(!g||!g.inWatchlist&&g.userRating===null){const u=Mt(o.rawTitle,o.year??void 0);try{(m=chrome.runtime)!=null&&m.id?chrome.storage.local.get([y.LETTERBOXD_INDEX]).then(w=>{w[y.LETTERBOXD_INDEX]?o.year?h("LB_MATCH_NOT_FOUND",{reason:"no-key",key:u}):h("LB_MATCH_NOT_FOUND",{reason:"missing-year",key:u}):h("LB_MATCH_NOT_FOUND",{reason:"no-index",key:u})}):h("LB_INDEX_SKIP_EXT_CONTEXT_INVALID",{key:u})}catch(w){h("LB_INDEX_LOOKUP_FAILED",{error:w,key:u})}}}}}).catch(s=>{h("Title resolve failed",{requestId:r,err:s})})},S=t=>{et&&window.clearTimeout(et),et=window.setTimeout(()=>{rt(t)},ke)},Je=()=>{new MutationObserver(()=>{try{S("mutation")}catch(e){h("Mutation observer failed",{error:e})}}).observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class","style","aria-expanded","aria-hidden"]}),document.addEventListener("pointerover",e=>{try{B=e.target,S("pointer")}catch(n){h("Pointer observer failed",{error:n})}},!0),document.addEventListener("focusin",()=>{try{S("focus")}catch(e){h("Focus observer failed",{error:e})}},!0),nt&&window.clearInterval(nt),nt=window.setInterval(()=>{A&&(it(),!_&&(v.isMounted()||rt("watchdog")))},We),S("init")},Qe=async()=>{const e=!((await ct())[y.OVERLAY_ENABLED]??!0);await Ht({[y.OVERLAY_ENABLED]:e}),A=e,e?(Xe(),S("toggle")):(v.unmount(),R(!1)),h("Overlay toggled",{enabled:e})},Ze=t=>{t.ctrlKey===tt.ctrlKey&&t.shiftKey===tt.shiftKey&&t.key.toLowerCase()===tt.key&&(t.preventDefault(),Qe().catch(e=>h("Toggle failed",e)))},tn=()=>{chrome.runtime.onMessage.addListener(t=>{if((t==null?void 0:t.type)==="LB_INDEX_UPDATED"){h("LB_INDEX_UPDATED"),S("lb-index-updated");return}(t==null?void 0:t.type)==="LB_INDEX_UPDATED_ACK"&&(h("LB_INDEX_UPDATED_ACK",t.payload),S("lb-index-updated"))})},en=()=>{const t=Lt();t.__nxlDebug={getLbIndex:async()=>chrome.storage.local.get(y.LETTERBOXD_INDEX),lastOverlayData:()=>Ot,forceResolve:()=>rt("force")}},nn=async()=>{const t=Lt();if(t.__nxlBooted)return;t.__nxlBooted=!0,A=(await ct())[y.OVERLAY_ENABLED]??!0,it(),A&&!_&&(R(!0),h("BADGE_SHOWN"),h("BROWSE_MODE_DETECTED")),Je(),tn(),en(),window.addEventListener("keydown",Ze),Me()},It=async()=>{await nn()};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{It().catch(t=>h("Init failed",t))},{once:!0}):It().catch(t=>h("Init failed",t))})();
//# sourceMappingURL=index.js.map
