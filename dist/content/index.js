(function(){"use strict";const b={OVERLAY_ENABLED:"overlayEnabled",TMDB_API_KEY:"tmdbApiKey",TMDB_CACHE:"tmdbCache",TMDB_FEATURE_CACHE:"tmdbFeatureCache",MATCH_PROFILE:"matchProfile",LETTERBOXD_INDEX:"lb_index_v1",LETTERBOXD_STATS:"lb_stats_v1",LAST_IMPORT_AT:"lastImportAt",XRAY_ENABLED:"xrayEnabled",AWS_ACCESS_KEY_ID:"awsAccessKeyId",AWS_SECRET_ACCESS_KEY:"awsSecretAccessKey",AWS_REGION:"awsRegion"},et=500,u=(...t)=>{console.log("[Netflix+Letterboxd]",...t)},nt=t=>t?t.toLowerCase().replace(/&/g," and ").replace(/[^a-z0-9']+/g," ").replace(/\s+/g," ").trim():"",Bt=(t,e)=>{const n=nt(t),o=e?String(e):"";return`${n}-${o}`},Ht=(t,e)=>Bt(t,e),ot=async()=>(u("Loading storage state"),chrome.storage.local.get([b.OVERLAY_ENABLED,b.TMDB_API_KEY,b.TMDB_CACHE,b.TMDB_FEATURE_CACHE,b.MATCH_PROFILE,b.LETTERBOXD_INDEX,b.LETTERBOXD_STATS,b.LAST_IMPORT_AT,b.AWS_ACCESS_KEY_ID,b.AWS_SECRET_ACCESS_KEY,b.AWS_REGION])),Pt=async t=>{u("Saving storage state",t),await chrome.storage.local.set(t)},it="a[href^='/title/']",q=["[role='dialog']","[aria-modal='true']","[aria-expanded='true']","[data-uia*='jawbone']","[class*='jawbone']","[data-uia*='preview']","[data-uia*='billboard']","[data-uia*='hero']","[data-uia*='details']"],rt=["h1","h2","h3","[data-uia*='title']","[class*='title']","[class*='fallback']","[class*='preview'] [class*='header']"],at=["video","img","[data-uia*='preview'] video","[data-uia*='preview'] img","[class*='preview'] video","[class*='preview'] img","[data-uia*='player'] video","[data-uia*='hero'] img"],st=["[data-uia*='controls']","[class*='controls']","[class*='control']","[role='toolbar']"],M=/(S\d+\s*:?\s*E\d+|Season\s*\d+\s*Episode\s*\d+|Episode\s*\d+|\bE\d+\b)/i,W=/(\b\d+\s*(m|min|minutes)\b|\b\d+\s*of\s*\d+\s*(m|min|minutes)\b)/i,kt=/\b(tv-[a-z0-9]+|pg-?13|pg|tv-ma|tv-y|tv-g|nr|nc-17|hd|uhd|4k|seasons?|season|episode|volume|part\s+\d+)\b/i,qt=/^(play|resume|continue|more info|details|watch|watch now|watch again|add|added|my list|remove|rate|like|dislike|thumbs up|thumbs down)$/i,Wt=/because you watched/i,lt=["[data-uia*='maturity-rating']","[data-uia*='season']","[data-uia*='resolution']","[data-uia*='hd']","[class*='maturity']","[class*='season']","[class*='quality']"],ct=["[data-uia*='genre']","a[href*='/genre/']","[class*='genre']"],dt=[...lt,...ct,"[data-uia*='metadata']","[class*='metadata']","[class*='meta']","[class*='maturity']","[class*='season']","[class*='genre']","[class*='tag']","[class*='info']"],zt=["header","nav","[data-uia*='header']","[data-uia*='row-title']","[class*='rowHeader']","[class*='row-title']"],B=["h1","h2","h3","h4","[data-uia*='title']","[class*='title']","[class*='headline']","[class*='header']","[class*='name']"],Ft=/(browse|home|my list|popular|your next watch|explore all|movies & shows|movies and shows|new & popular)/i,E=t=>{const e=t.getBoundingClientRect();if(e.width===0||e.height===0)return!1;const n=window.getComputedStyle(t);return n.visibility==="hidden"||n.display==="none"||n.opacity==="0"?!1:e.bottom>=0&&e.right>=0&&e.top<=window.innerHeight&&e.left<=window.innerWidth},y=t=>{if(!t)return;const e=t.replace(/\s+/g," ").trim();return e.length?e:void 0},ut=t=>{if(!t)return;const e=t.match(/\/title\/(\d+)/);return e==null?void 0:e[1]},H=t=>{if(!t)return;const e=t.match(/(19\d{2}|20\d{2})/);if(!e)return;const n=Number(e[1]);if(!Number.isNaN(n))return n},x=t=>{if(!t)return;let e=t;return e=e.replace(/^\s*S\d+\s*:?\s*E\d+\s*/i,""),e=e.replace(/"[^"]*"/g,n=>{const o=n.replace(/"/g,"");return M.test(o)?"":n}),e=e.replace(/Episode\s*\d+/gi,""),e=e.replace(/\bE\d+\b/gi,""),e=e.replace(W,""),e=e.replace(/\s+of\s+\d+\s*(m|min|minutes)?/gi,""),e=e.replace(/\s+/g," ").trim(),e.length?e:void 0},ft=(t,e)=>{const n=t.getAttribute("href")||void 0,o=ut(n),a=y(t.getAttribute("aria-label")||t.textContent);return{netflixTitleId:o,titleText:a,href:n,source:e}},z=t=>{for(const e of rt){const n=t.querySelector(e);if(n&&E(n)){const o=y(n.textContent);if(o)return o}}},Yt=t=>{if(t)return z(t)},Vt=t=>{if(t)for(const e of rt){const n=Array.from(t.querySelectorAll(e));for(const o of n){if(!E(o))continue;const a=y(o.textContent);if(!a||M.test(a)||W.test(a))continue;const r=x(a);if(r)return r}}},P=t=>{if(!t)return null;const e=[];return at.forEach(n=>{t.querySelectorAll(n).forEach(o=>{E(o)&&e.push(o)})}),e.length?e.reduce((n,o)=>{const a=n.getBoundingClientRect(),r=o.getBoundingClientRect(),i=a.width*a.height;return r.width*r.height>i?o:n}):null},D=t=>{var a;if(!t)return null;const e=[];st.forEach(r=>{t.querySelectorAll(r).forEach(i=>{E(i)&&e.push(i)})});const o=Array.from(new Set(e)).map(r=>{const i=r.querySelectorAll("button, [role='button']").length,s=r.getBoundingClientRect(),l=i*10+s.width;return{el:r,score:l,top:s.top}}).filter(r=>r.score>0);return o.sort((r,i)=>i.score-r.score||i.top-r.top),((a=o[0])==null?void 0:a.el)??null},Xt=t=>{if(!t)return!1;const e=[...lt,...ct].join(",");return Array.from(t.querySelectorAll(e)).some(o=>E(o))},Kt=t=>!!t.closest(dt.join(",")),F=t=>!!t.closest(zt.join(",")),v=t=>Ft.test(t)||qt.test(t.trim())||Wt.test(t)||kt.test(t)?!0:M.test(t)||W.test(t)||/\b\d+\s*of\s*\d+\s*(m|min|minutes)?\b/i.test(t)||/\b\d+\s*(m|min|minutes)\b/i.test(t),Y=(t,e)=>t.closest('[role="progressbar"], [data-uia*="progress"], [class*="progress"]')?!0:e!==void 0?t.getBoundingClientRect().bottom>=e-8:!1,k=(t,e)=>t?e&&(e.contains(t)||t.closest("button, [role='button']"))?!0:!!t.closest("button, [role='button'], [data-uia*='play'], [data-uia*='button']"):!1,jt=t=>{const e=t.getBoundingClientRect(),n=D(t),o=n?n.getBoundingClientRect().top:void 0,a=Array.from(t.querySelectorAll(B.join(",")));let r,i=0;const s=[];if(a.forEach(c=>{if(!E(c)){i+=1;return}if(F(c)){i+=1;return}if(k(c,n)){i+=1;return}if(Y(c,o)){i+=1;return}const f=y(c.textContent);if(!f||f.length<2||f.length>80){i+=1;return}if(v(f)){s.push(c),i+=1;return}const p=c.getBoundingClientRect(),h=window.getComputedStyle(c),g=parseFloat(h.fontSize)||14,m=h.fontWeight==="bold"?700:Number(h.fontWeight),d=Number.isNaN(m)?400:m,S=p.left-e.left,en=p.top-e.top,nn=Math.hypot(S,en),on=Kt(c)?120:0,Mt=g*10+d/10+Math.max(0,300-nn)-on;(!r||Mt>r.score)&&(r={el:c,score:Mt,text:f})}),r)return{title:x(r.text)??r.text,chosen:r.el,rejectedCount:i};for(const c of s){let f=c.parentElement,p=0;for(;f&&p<4;){const h=Array.from(f.querySelectorAll(B.join(","))).filter(g=>g!==c);for(const g of h){if(!E(g)||k(g,n)||Y(g,o))continue;const m=y(g.textContent);if(!(!m||m.length<2||m.length>80)&&!v(m))return{title:x(m)??m,chosen:g,rejectedCount:i}}f=f.parentElement,p+=1}}const l=t.querySelector("a[href^='/title/']");if(l){const c=l.querySelector(B.join(",")),f=y((c==null?void 0:c.textContent)||l.textContent);if(f&&!v(f))return{title:x(f)??f,chosen:c??l,rejectedCount:i};let p=l.parentElement,h=0;for(;p&&h<4;){const g=Array.from(p.querySelectorAll(B.join(",")));for(const m of g){if(!E(m)||k(m,n)||Y(m,o))continue;const d=y(m.textContent);if(!(!d||d.length<2||d.length>80)&&!v(d))return{title:x(d)??d,chosen:m,rejectedCount:i}}p=p.parentElement,h+=1}}return{title:null,rejectedCount:i}},$t=t=>{const n=Array.from(t.querySelectorAll(dt.join(","))).map(l=>y(l.textContent)).filter(Boolean);if(!n.length){const l=D(t),c=l==null?void 0:l.nextElementSibling,f=y(c==null?void 0:c.textContent);f&&n.push(f)}const o=n.join(" "),a=H(o),r=/\bseasons?\b/i.test(o),i=/\b\d+\s*(m|min|minutes)\b/i.test(o)||/\b\d+\s*h\b/i.test(o);let s;return r?s=!0:i&&(s=!1),{year:a,isSeries:s}},V=t=>{var n,o;const e=[t.getAttribute("aria-label"),t.getAttribute("title"),(n=t.querySelector("img[alt]"))==null?void 0:n.alt,(o=t.querySelector("[aria-label]"))==null?void 0:o.getAttribute("aria-label"),t.textContent];for(const a of e){const r=y(a);if(r&&!v(r))return r}},Ut=t=>{var o,a,r,i,s;const e=t,n=[((o=e.getAttribute)==null?void 0:o.call(e,"aria-label"))??void 0,((a=e.getAttribute)==null?void 0:a.call(e,"data-uia-title"))??void 0,((r=e.getAttribute)==null?void 0:r.call(e,"title"))??void 0,(s=(i=e.querySelector)==null?void 0:i.call(e,"img[alt]"))==null?void 0:s.alt,e.textContent];for(const l of n){const c=y(l);if(c&&!v(c)&&!F(e))return c}},Gt=(t,e,n)=>{const a=Array.from(t.querySelectorAll("a[href^='/title/']")).filter(s=>E(s));if(!a.length)return null;const r=e==null?void 0:e.getBoundingClientRect();let i=null;for(const s of a){if(F(s)||k(s,n)||!V(s))continue;const c=s.getBoundingClientRect(),f=c.width*c.height;let p=0;if(r){const h=r.top-220,g=r.bottom+220;if(c.bottom<h||c.top>g)continue}if(e&&(s.contains(e)||e.contains(s))&&(p+=1e3),r){const h=c.left+c.width/2-(r.left+r.width/2),g=c.top+c.height/2-(r.top+r.height/2),m=Math.hypot(h,g);p+=Math.max(0,500-m)}p+=Math.min(f/100,200),p+=50,(!i||p>i.score)&&(i={anchor:s,score:p})}return(i==null?void 0:i.anchor)??null},Jt=t=>{if(t){const e=Qt(t);if(e)return e}return Zt()},X=(t,e,n)=>{const o=nt(t);if(!o)return null;const a=(e==null?void 0:e.getAttribute("href"))??null,r=ut(a)??null,{year:i,isSeries:s}=$t(n);return{rawTitle:t,normalizedTitle:o,year:i??null,isSeries:s,netflixId:r,href:a}},Qt=t=>{const e=oe(t);let n,o=null;if(e){const i=V(e);i&&(n=x(i)??i,o=e)}if(!n){let i=t,s=0;for(;i&&i!==document.body&&s<8;){const l=Ut(i);if(l){n=x(l)??l;break}i=i.parentElement,s+=1}}if(!n)return null;if(o){const i=ie(o);if(i){const s=X(n,o,i);return s?{jawboneEl:i,extracted:s,chosenTitleElement:o}:null}}let a=o??t,r=0;for(;a&&a!==document.body&&r<8;){if(a instanceof HTMLElement){const i=a.getBoundingClientRect();if(i.width>=200&&i.height>=120){const s=X(n,o,a);if(s)return{jawboneEl:a,extracted:s,chosenTitleElement:o??void 0}}}a=a.parentElement,r+=1}return null},Zt=()=>{const t=ne(),e=re().map(r=>({root:r,preview:P(r)})),n=t?[{root:t.root,preview:t.preview},...e.filter(r=>r.root!==t.root)]:e,o=window.innerWidth*.85,a=window.innerHeight*.6;for(const r of n){const i=r.root,s=i.getBoundingClientRect();if(s.width>o||s.height>a)continue;const l=r.preview??P(i),c=D(i),f=Xt(i);if(!l||!c)continue;const p=Gt(i,l,c);let h=null,g=null;if(p){const d=V(p);d&&(h=x(d)??d,g=p)}if(h||(h=jt(i).title??null),!h&&!f)continue;if(!h&&f){const d=Yt(i);d&&!v(d)&&(h=x(d)??d)}if(!h)continue;const m=X(h,g,i);if(m)return{jawboneEl:i,extracted:m,chosenTitleElement:g??void 0}}return{jawboneEl:null,extracted:null}},K=(t,e)=>{const n=Vt(t);if(n)return n;const o=x(e);if(o&&!M.test(o))return o;if(e)return x(e)??e},te=t=>{const e=Array.from(t.querySelectorAll(it)),n=e.filter(E);return n.length>0?n[0]:e[0]},ht=()=>{const t=q.join(","),e=Array.from(document.querySelectorAll(t)),n=e.filter(E),o=window.innerWidth*.85,a=window.innerHeight*.6,r=n.filter(i=>{const s=i.getBoundingClientRect();return!(s.width===0||s.height===0||s.width<240||s.height<180||s.width>o||s.height>a)});return r.length>0?r.sort((i,s)=>{const l=i.getBoundingClientRect(),c=s.getBoundingClientRect();return c.width*c.height-l.width*l.height}):n.length>0?n:e},ee=()=>{const t=[];return at.forEach(e=>{document.querySelectorAll(e).forEach(n=>{if(!E(n))return;const o=n.getBoundingClientRect();o.width<200||o.height<120||t.push(n)})}),t},ne=()=>{const t=ee();if(!t.length)return null;const e=window.innerWidth*.85,n=window.innerHeight*.6,o=t.sort((a,r)=>{const i=a.getBoundingClientRect(),s=r.getBoundingClientRect();return s.width*s.height-i.width*i.height});for(const a of o){let r=a,i=0;for(;r&&i<8;){if(r instanceof HTMLElement){const s=r.getBoundingClientRect();if(s.width>=240&&s.height>=180&&s.width<=e&&s.height<=n&&D(r))return{root:r,preview:a}}r=r.parentElement,i+=1}}return null},oe=t=>{var o,a,r;let e=t;for(;e&&e!==document.body;){if(e instanceof HTMLAnchorElement&&((o=e.getAttribute("href"))!=null&&o.startsWith("/title/")))return e;const i=(a=e.querySelector)==null?void 0:a.call(e,":scope > a[href^='/title/']");if(i&&E(i))return i;e=e.parentElement}const n=(r=t.querySelector)==null?void 0:r.call(t,"a[href^='/title/']");return n&&E(n)?n:null},ie=t=>{let e=t,n=0;const o=window.innerWidth*.85,a=window.innerHeight*.6;for(;e&&e!==document.body&&n<12;){if(e instanceof HTMLElement){const r=e.getBoundingClientRect();if(r.width>=240&&r.height>=180&&r.width<=o&&r.height<=a){const i=P(e),s=D(e);if(i&&s)return e}}e=e.parentElement,n+=1}return null},re=()=>{const t=ht();if(t.length)return t;const e=Array.from(document.querySelectorAll(st.join(","))),n=window.innerWidth*.85,o=window.innerHeight*.6,a=new Set;return e.forEach(r=>{let i=r,s=0;for(;i&&s<6;){if(i instanceof HTMLElement){const l=i.getBoundingClientRect();if(l.width>=240&&l.height>=180&&l.width<=n&&l.height<=o&&P(i)){a.add(i);break}}i=i.parentElement,s+=1}}),Array.from(a)},pt=()=>{const t=ht();for(const n of t){const o=te(n);if(o){const r=ft(o,"container-anchor");if(r.netflixTitleId||r.titleText){const i=r.titleText??z(n),s=K(n,i??r.titleText);return{candidate:{...r,titleText:s,year:H(s??i)},container:n}}}const a=z(n);if(a){const r=K(n,a);return{candidate:{titleText:r??a,year:H(r??a),source:"container-text"},container:n}}}const e=Array.from(document.querySelectorAll(it)).find(E);if(e){const n=ft(e,"page-anchor"),o=K(e.closest(q.join(","))??e.parentElement,n.titleText);return{candidate:{...n,titleText:o??n.titleText,year:H(o??n.titleText)},container:e.closest(q.join(","))??e.parentElement}}return{candidate:null,container:null}},ae="nxlb-top-section",se=()=>{const t=document.createElement("div");t.id=ae,t.style.display="block",t.style.width="100%",t.style.pointerEvents="none";const e=t.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=`
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
  `;const o=document.createElement("div");o.className="nxl-top-section";const a=document.createElement("div");a.className="nxl-header";const r=document.createElement("div");r.className="nxl-branding",r.innerHTML=`
    Powered by
    <span class="nxl-dots">
      <span class="nxl-dot green"></span>
      <span class="nxl-dot orange"></span>
      <span class="nxl-dot blue"></span>
    </span>
    Letterboxd
  `,a.appendChild(r);const i=document.createElement("div");i.className="nxl-body";const s=document.createElement("div");s.className="nxl-rating",s.dataset.field="communityRating",s.textContent="Community rating: —";const l=document.createElement("div");l.className="nxl-match",l.dataset.field="match",l.textContent="Your match: —";const c=document.createElement("div");c.className="nxl-because",c.dataset.field="because",c.textContent="Because you like: —";const f=document.createElement("div");return f.className="nxl-badges",f.dataset.field="badges",i.appendChild(s),i.appendChild(l),i.appendChild(c),i.appendChild(f),o.appendChild(a),o.appendChild(i),e.appendChild(n),e.appendChild(o),t},le=t=>t==null?"":t>=1e6?`${(t/1e6).toFixed(1)}M`:t>=1e3?`${(t/1e3).toFixed(1)}K`:`${t}`,ce=t=>{const e=Math.max(0,Math.min(5,t)),n=Math.floor(e),o=e%1>=.5;return"★".repeat(n)+(o?"½":"")},mt=(t,e)=>{var c,f,p,h,g,m;const n=((c=e.tmdb)==null?void 0:c.voteAverage)??null,o=((f=e.tmdb)==null?void 0:f.voteCount)??null,a=e.letterboxd,r=(p=t.shadowRoot)==null?void 0:p.querySelector("[data-field='communityRating']");if(r)if(n!=null){const d=le(o),S=n/2;r.innerHTML=`
        Community rating:
        <span class="nxl-star">★</span>
        ${S.toFixed(1)}${d?` <span class="nxl-meta">${d} ratings</span>`:""}
      `}else r.textContent="Community rating: —";const i=(h=t.shadowRoot)==null?void 0:h.querySelector("[data-field='match']");i&&((a==null?void 0:a.matchPercent)!==null&&(a==null?void 0:a.matchPercent)!==void 0?i.innerHTML=`Your match: <span class="nxl-match-value">${a.matchPercent}%</span>`:i.textContent="Your match: —");const s=(g=t.shadowRoot)==null?void 0:g.querySelector("[data-field='because']");if(s){const d=(a==null?void 0:a.becauseYouLike)??[];s.textContent=d.length>0?`Because you like: ${d.join(", ")}`:"Because you like: —"}const l=(m=t.shadowRoot)==null?void 0:m.querySelector("[data-field='badges']");if(l){if(l.innerHTML="",a!=null&&a.inWatchlist){const d=document.createElement("span");d.className="nxl-badge",d.textContent="On your watchlist",l.appendChild(d)}if((a==null?void 0:a.userRating)!==null&&(a==null?void 0:a.userRating)!==void 0){const d=document.createElement("span");d.className="nxl-badge",d.textContent=`You rated ${ce(a.userRating)}`,l.appendChild(d)}if(!(a!=null&&a.inWatchlist)&&(a==null?void 0:a.userRating)===void 0){const d=document.createElement("span");d.className="nxl-badge",d.textContent="Letterboxd: —",l.appendChild(d)}}},de=()=>{let t=null,e=null,n=null;const o=()=>{e||(e=se())};return{mount:l=>{o(),e&&t!==l&&(e.remove(),l.insertBefore(e,l.firstChild),t=l,requestAnimationFrame(()=>{e==null||e.classList.add("nxl-visible")}))},update:l=>{n=l,e&&mt(e,l)},unmount:()=>{e&&e.remove(),t=null},renderLast:()=>{e&&n&&mt(e,n)},getLastData:()=>n,getCurrentRoot:()=>t,isMounted:()=>!!(e&&e.isConnected)}},ue={KeyL:"laugh",KeyS:"sad",KeyA:"angry",KeyB:"bored",KeyH:"shock",KeyN:"neutral",KeyM:"smile"},fe=()=>{const t=document.querySelectorAll("video");for(let e=0;e<t.length;e+=1){const n=t[e],o=n.getBoundingClientRect();if(o.width>=window.innerWidth*.5&&o.height>=window.innerHeight*.5)return n}return t[0]??null},he=()=>`rx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,pe=()=>{const t=window.location.pathname.match(/\/watch\/(\d+)/);if(t!=null&&t[1])return t[1];const{candidate:e}=pt();return(e==null?void 0:e.netflixTitleId)??null},me=()=>null,ge=t=>{chrome.runtime.sendMessage({type:"STORE_REACTION_EVENT",payload:t}).catch(()=>{})},be=()=>{window.location.pathname.includes("/watch/")&&window.addEventListener("keydown",t=>{if(t.repeat)return;const e=ue[t.code];if(!e)return;const n=fe();if(!n)return;const o=pe();if(!o)return;const a=n.currentTime,r={id:he(),netflixId:o,profileId:me(),season:null,episode:null,timestampSec:a,createdAt:Date.now(),type:e};ge(r)},!0)},Ee=async(t,e)=>{try{return await chrome.runtime.sendMessage({type:"GET_REACTION_TIMELINE",payload:{netflixId:t,durationSec:e}})??null}catch{return null}},gt="nxlb-status-badge",ye=()=>{const t=document.createElement("div");t.id=gt,t.style.position="fixed",t.style.bottom="16px",t.style.right="16px",t.style.zIndex="2147483647",t.style.pointerEvents="none";const e=t.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=`
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
  `,e.appendChild(n),e.appendChild(o),t},R=t=>{const e=document.getElementById(gt);if(!t){e&&(e.remove(),u("OVERLAY_BADGE_REMOVED"));return}if(e)return;const n=ye();document.documentElement.appendChild(n),u("OVERLAY_BADGE_MOUNTED")},bt="nxlb-reaction-timeline",Et="nxlb-emotion-panel",xe=()=>{const t=document.createElement("div");t.id=bt,t.style.position="absolute",t.style.left="0",t.style.right="0",t.style.bottom="0",t.style.height="4px",t.style.pointerEvents="none";const e=t.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=`
    :host {
      all: initial;
      display: block;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    .bar {
      display: flex;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    .segment {
      flex: 1 1 auto;
      height: 100%;
      background: rgba(255, 255, 255, 0.0);
      transition: background-color 120ms ease, opacity 120ms ease;
    }
  `;const o=document.createElement("div");return o.className="bar",o.dataset.field="segments",e.appendChild(n),e.appendChild(o),t},Te=()=>{const t=document.createElement("div");t.id=Et,t.style.position="absolute",t.style.right="16px",t.style.bottom="60px",t.style.width="220px",t.style.height="160px",t.style.zIndex="2147483646";const e=t.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=`
    :host {
      all: initial;
      font-family: "Netflix Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
    }
    .panel {
      background: rgba(0, 0, 0, 0.88);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.18);
      padding: 10px 12px;
      color: #f5f5f5;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-rows: auto 1fr;
      gap: 6px;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      color: rgba(255,255,255,0.85);
    }
    .axes {
      position: relative;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at center, rgba(255,255,255,0.06), transparent);
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.12);
      overflow: hidden;
    }
    .axes::before,
    .axes::after {
      content: "";
      position: absolute;
      background: rgba(255,255,255,0.18);
    }
    .axes::before {
      left: 50%;
      top: 0;
      bottom: 0;
      width: 1px;
    }
    .axes::after {
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
    }
    .point {
      position: absolute;
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: #46d369;
      box-shadow: 0 0 8px rgba(70,211,105,0.8);
      transform: translate(-50%, -50%);
    }
  `;const o=document.createElement("div");o.className="panel";const a=document.createElement("div");a.className="header",a.innerHTML='<span>Emotional map</span><span style="opacity:0.7">valence × arousal</span>';const r=document.createElement("div");r.className="axes",r.dataset.field="axes";const i=document.createElement("div");return i.className="point",i.dataset.field="pointer",i.style.left="50%",i.style.top="50%",r.appendChild(i),o.appendChild(a),o.appendChild(r),e.appendChild(n),e.appendChild(o),t},we=(t,e)=>{const o=(Math.max(-1,Math.min(1,t))+1)/2,i=0*(1-o)+120*o,s=Math.max(.1,Math.min(.8,e));return`hsla(${i}, 70%, 55%, ${s})`},ve=async t=>{var f;const e=t.querySelector("[data-uia*='scrubber'], [role='slider']");if(!e)return u("EMOTION_TIMELINE_NO_SCRUBBER"),null;(!e.style.position||e.style.position==="static")&&(e.style.position="relative");let n=e.querySelector(`#${bt}`);n||(n=xe(),e.appendChild(n));const o=document.querySelector("video"),a=window.location.pathname.match(/\/watch\/(\d+)/),r=(a==null?void 0:a[1])??null;if(!o||!r)return null;const i=o.duration||0;if(!i||!Number.isFinite(i))return null;const s=await Ee(r,i);if(!s)return null;const l=(f=n.shadowRoot)==null?void 0:f.querySelector("[data-field='segments']");if(!l)return s;l.innerHTML="";const c=s.buckets.length||1;return s.buckets.forEach(p=>{const h=document.createElement("div");h.className="segment";const g=p.count>0?we(p.meanValence,p.intensity):"rgba(255,255,255,0.0)";h.style.backgroundColor=g,h.style.opacity=p.count>0?"1":"0.0",h.style.flexBasis=`${100/c}%`,l.appendChild(h)}),s},yt=t=>{const e=document.querySelector("[data-uia*='video-player']")??document.body;if(!e)return null;let n=e.querySelector(`#${Et}`);return n||(n=Te(),e.appendChild(n)),n},Ae=(t,e)=>{var m,d;if(!t)return;const n=document.querySelector("video");if(!n||!Number.isFinite(n.currentTime))return;const o=n.currentTime,a=e.bucketSizeSec,r=Math.min(e.buckets.length-1,Math.max(0,Math.floor(o/a))),i=e.buckets[r],s=(m=t.shadowRoot)==null?void 0:m.querySelector("[data-field='pointer']"),l=(d=t.shadowRoot)==null?void 0:d.querySelector("[data-field='axes']");if(!s||!l)return;const c=l.getBoundingClientRect(),f=Math.max(-1,Math.min(1,i.meanValence||0)),p=Math.max(0,Math.min(1,i.meanArousal||0)),h=(f+1)/2*c.width,g=(1-p)*c.height;s.style.left=`${h/c.width*100}%`,s.style.top=`${g/c.height*100}%`},j={ctrlKey:!0,shiftKey:!0,key:"l"},Ce=250,_e=2e3,Se=.85,Re=.6,T=de();let A=!0,xt="",Tt=null,$,U,wt="",N=null,w=!1,vt=null,I=null,L=null,G=null;const At=()=>window,Ne=t=>{if(!t)return!1;const e=t.getBoundingClientRect();return e.width===0||e.height===0?!1:e.width>window.innerWidth*Se||e.height>window.innerHeight*Re},J=t=>{N&&N!==t&&(N.style.outline="",N.style.outlineOffset="",N=null),t&&(t.style.outline="1px solid rgba(255, 80, 80, 0.85)",t.style.outlineOffset="-1px",N=t)},Le=()=>window.location.pathname.includes("/watch/"),Ct=()=>Array.from(document.querySelectorAll("video")).some(e=>{if(e.paused||e.ended)return!1;const n=e.getBoundingClientRect();if(n.width===0||n.height===0)return!1;const o=n.width/window.innerWidth,a=n.height/window.innerHeight;return o>.85||a>.6}),Oe=()=>!!document.querySelector("[data-uia*='video-player'], [class*='VideoPlayer'], [class*='watch-video'], [data-uia*='player']"),De=()=>!!(Le()||Ct()||Oe()&&Ct()),Q=()=>{const t=De();t!==w&&(w=t,w?(R(!1),u("BADGE_HIDDEN_PLAYBACK"),T.unmount()):A&&(R(!0),u("BADGE_SHOWN"),u("BROWSE_MODE_DETECTED")))},Ie=()=>{if(!A){R(!1);return}w||(R(!0),u("BADGE_SHOWN"))},Me=t=>[t.normalizedTitle??"",t.year??"",t.netflixId??"",t.href??""].join("|"),Be=(t,e)=>({title:t,year:e??null,tmdb:{id:null,voteAverage:null,voteCount:null},letterboxd:{inWatchlist:!1,userRating:null,matchPercent:null,becauseYouLike:[]}}),He=t=>{var e;try{return(e=chrome.runtime)!=null&&e.id?chrome.runtime.sendMessage(t):(u("EXT_CONTEXT_INVALID",{messageType:t==null?void 0:t.type}),Promise.resolve(null))}catch(n){return u("EXT_CONTEXT_SEND_FAILED",{error:n,messageType:t==null?void 0:t.type}),Promise.resolve(null)}},Pe=()=>I?I.isConnected?I:(I=null,null):null,Z=t=>{if(!A||(Q(),w))return;u("OVERLAY_MOUNT_ATTEMPT",{reason:t});const e=Jt(Pe()),n=e.jawboneEl,o=e.extracted;if(!n||!o){u("OVERLAY_MOUNT_FAILED",{reason:"no-jawbone"}),T.unmount(),J(null);return}if(Ne(n)){u("OVERLAY_MOUNT_FAILED",{reason:"hero-sized"}),T.unmount(),J(null);return}u("ACTIVE_JAWBONE_FOUND",{rawTitle:o.rawTitle,netflixId:o.netflixId,year:o.year,isSeries:o.isSeries,rejectedTitleCandidates:e.rejectedCount,chosenTitleElement:e.chosenTitleElement?e.chosenTitleElement.outerHTML.slice(0,200):void 0}),u("EXTRACTED_TITLE_INFO",o);const a=Me(o);if(a===xt&&n===Tt){u("OVERLAY_MOUNT_SUCCESS",{reused:!0});return}xt=a,Tt=n,J(n),T.mount(n),T.update(Be(o.rawTitle,o.year??void 0));try{ve(n).then(s=>{s&&(G=s,L||(L=yt(n)))})}catch(s){u("EMOTION_TIMELINE_MOUNT_FAILED",{error:s})}const r=`req_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;wt=r;const i={type:"RESOLVE_OVERLAY_DATA",requestId:r,payload:o};u("OVERLAY_REQUEST",{titleText:o.rawTitle,normalizedTitle:o.normalizedTitle,href:o.href,year:o.year}),He(i).then(s=>{var l,c,f,p,h,g;if(s&&(s==null?void 0:s.type)==="OVERLAY_DATA_RESOLVED"&&s.requestId===wt){vt=s.payload,u("OVERLAY_RESPONSE",{requestId:r,tmdb:s.payload.tmdb,letterboxd:{inWatchlist:((l=s.payload.letterboxd)==null?void 0:l.inWatchlist)??!1,userRating:((c=s.payload.letterboxd)==null?void 0:c.userRating)??null,matchPercent:((f=s.payload.letterboxd)==null?void 0:f.matchPercent)??null,becauseYouLikeCount:((h=(p=s.payload.letterboxd)==null?void 0:p.becauseYouLike)==null?void 0:h.length)??0}}),T.update(s.payload);{const m=s.payload.letterboxd;if(!m||!m.inWatchlist&&m.userRating===null){const d=Ht(o.rawTitle,o.year??void 0);try{(g=chrome.runtime)!=null&&g.id?chrome.storage.local.get([b.LETTERBOXD_INDEX]).then(S=>{S[b.LETTERBOXD_INDEX]?o.year?u("LB_MATCH_NOT_FOUND",{reason:"no-key",key:d}):u("LB_MATCH_NOT_FOUND",{reason:"missing-year",key:d}):u("LB_MATCH_NOT_FOUND",{reason:"no-index",key:d})}):u("LB_INDEX_SKIP_EXT_CONTEXT_INVALID",{key:d})}catch(S){u("LB_INDEX_LOOKUP_FAILED",{error:S,key:d})}}}}}).catch(s=>{u("Title resolve failed",{requestId:r,err:s})})},C=t=>{$&&window.clearTimeout($),$=window.setTimeout(()=>{Z(t)},Ce)},ke=()=>{new MutationObserver(()=>{try{C("mutation")}catch(e){u("Mutation observer failed",{error:e})}}).observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class","style","aria-expanded","aria-hidden"]}),document.addEventListener("pointerover",e=>{try{I=e.target,C("pointer")}catch(n){u("Pointer observer failed",{error:n})}},!0),document.addEventListener("focusin",()=>{try{C("focus")}catch(e){u("Focus observer failed",{error:e})}},!0),U&&window.clearInterval(U),U=window.setInterval(()=>{if(A&&(Q(),!w)){T.isMounted()||Z("watchdog");try{!L&&!w&&(L=yt(document.body)),L&&G&&Ae(L,G)}catch(e){u("EMOTION_PANEL_UPDATE_FAILED",{error:e})}}},_e),C("init")},qe=async()=>{const e=!((await ot())[b.OVERLAY_ENABLED]??!0);await Pt({[b.OVERLAY_ENABLED]:e}),A=e,e?(Ie(),C("toggle")):(T.unmount(),R(!1)),u("Overlay toggled",{enabled:e})},We=t=>{t.ctrlKey===j.ctrlKey&&t.shiftKey===j.shiftKey&&t.key.toLowerCase()===j.key&&(t.preventDefault(),qe().catch(e=>u("Toggle failed",e)))},ze=()=>{chrome.runtime.onMessage.addListener(t=>{if((t==null?void 0:t.type)==="LB_INDEX_UPDATED"){u("LB_INDEX_UPDATED"),C("lb-index-updated");return}(t==null?void 0:t.type)==="LB_INDEX_UPDATED_ACK"&&(u("LB_INDEX_UPDATED_ACK",t.payload),C("lb-index-updated"))})},Fe=()=>{const t=At();t.__nxlDebug={getLbIndex:async()=>chrome.storage.local.get(b.LETTERBOXD_INDEX),lastOverlayData:()=>vt,forceResolve:()=>Z("force")}},Ye=async()=>{const t=At();if(t.__nxlBooted)return;t.__nxlBooted=!0,A=(await ot())[b.OVERLAY_ENABLED]??!0,Q(),A&&!w&&(R(!0),u("BADGE_SHOWN"),u("BROWSE_MODE_DETECTED")),ke(),ze(),Fe(),window.addEventListener("keydown",We),be()},_t="nxl-xray-panel";function Ve(){const t=document.createElement("div");t.id=_t,t.style.cssText=`
    position: fixed;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
    width: 280px;
    max-height: 70vh;
    overflow-y: auto;
    z-index: 2147483646;
    pointer-events: auto;
    font-family: "Netflix Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  `;const e=t.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=`
    :host, .panel {
      all: initial;
      font-family: "Netflix Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
    }
    .panel {
      background: rgba(0, 0, 0, 0.88);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      color: #f5f5f5;
    }
    .panel-title {
      font-size: 13px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 12px;
      letter-spacing: 0.02em;
    }
    .actor-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .actor-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .actor-card:last-child {
      border-bottom: none;
    }
    .actor-photo {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      background: rgba(255, 255, 255, 0.1);
      flex-shrink: 0;
    }
    .actor-info {
      flex: 1;
      min-width: 0;
    }
    .actor-name {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
    }
    .actor-character {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.65);
      margin-top: 2px;
    }
    .actor-confidence {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.45);
      margin-top: 2px;
    }
    .state-message {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.7);
      padding: 12px 0;
      text-align: center;
    }
    .state-loading {
      color: rgba(255, 255, 255, 0.5);
    }
  `;const o=document.createElement("div");return o.className="panel",o.innerHTML='<div class="panel-title">In this scene</div><div class="actor-list" data-list></div>',e.appendChild(n),e.appendChild(o),t}let O=null;function Xe(){return(!O||!O.isConnected)&&(O=Ve(),document.documentElement.appendChild(O)),O}function St(){var e;return((e=Xe().shadowRoot)==null?void 0:e.querySelector("[data-list]"))??null}function Ke(){const t=St();t&&(t.innerHTML='<div class="state-message state-loading">Identifying actors…</div>')}function je(t){const e=St();e&&(e.innerHTML=`<div class="state-message">${Ue(t)}</div>`)}function $e(){const t=document.getElementById(_t);t&&t.remove(),O=null}function Ue(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}let _,Rt=0,Nt=!0;function Ge(){const t=window.location.pathname.match(/\/watch\/(\d+)/);return t==null?void 0:t[1]}function Je(){var i,s;const{candidate:t,container:e}=pt();if(t!=null&&t.titleText)return{titleText:t.titleText,year:t.year??void 0};const n=document.querySelector("[data-uia='video-title'], .title-title, [class*='title']"),o=(i=n==null?void 0:n.textContent)==null?void 0:i.trim(),a=document.querySelector("[class*='year'], [data-uia*='year']"),r=(s=a==null?void 0:a.textContent)==null?void 0:s.match(/(19\d{2}|20\d{2})/);return{titleText:o??void 0,year:r?Number(r[1]):void 0}}function Qe(){if(!Nt)return;const t=Ge();if(!t){u("X-Ray: no title ID on watch page"),je("Could not detect title");return}const{titleText:e,year:n}=Je(),o={tabId:0,netflixTitleId:t,titleText:e,year:n,timestamp:Math.floor(Date.now()/1e3)};chrome.runtime.sendMessage({type:"ANALYZE_FRAME",requestId:`xray_${Date.now()}`,payload:o},a=>{})}function Lt(){const t=document.querySelectorAll("video");for(let e=0;e<t.length;e+=1){const n=t[e],o=n.getBoundingClientRect();if(o.width>=window.innerWidth*.5&&o.height>=window.innerHeight*.5)return n}return t[0]??null}function tt(){const t=Date.now();t-Rt<et||(Rt=t,_&&window.clearTimeout(_),_=window.setTimeout(()=>{_=void 0,Ke(),Qe()},et))}function Ze(){_&&(window.clearTimeout(_),_=void 0),$e()}function Ot(t){t.addEventListener("pause",tt),t.addEventListener("play",Ze)}function Dt(){return window.location.pathname.includes("/watch/")}async function tn(){if(Nt=(await chrome.storage.local.get([b.XRAY_ENABLED]))[b.XRAY_ENABLED]!==!1,!Dt())return;const e=Lt();e&&(Ot(e),e.paused&&tt()),new MutationObserver(()=>{if(!Dt())return;const o=Lt();o&&!o.dataset.nxlObserved&&(o.dataset.nxlObserved="1",Ot(o),o.paused&&tt())}).observe(document.body,{childList:!0,subtree:!0})}const It=async()=>{await Ye(),await tn()};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{It().catch(t=>u("Init failed",t))},{once:!0}):It().catch(t=>u("Init failed",t))})();
//# sourceMappingURL=index.js.map
