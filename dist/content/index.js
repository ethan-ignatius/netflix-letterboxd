(function(){"use strict";const b={OVERLAY_ENABLED:"overlayEnabled",TMDB_API_KEY:"tmdbApiKey",TMDB_CACHE:"tmdbCache",TMDB_FEATURE_CACHE:"tmdbFeatureCache",MATCH_PROFILE:"matchProfile",LETTERBOXD_INDEX:"lb_index_v1",LETTERBOXD_STATS:"lb_stats_v1",LAST_IMPORT_AT:"lastImportAt",XRAY_ENABLED:"xrayEnabled"},et=500,f=(...t)=>{console.log("[Netflix+Letterboxd]",...t)},nt=t=>t?t.toLowerCase().replace(/&/g," and ").replace(/[^a-z0-9']+/g," ").replace(/\s+/g," ").trim():"",Ot=(t,e)=>{const n=nt(t),o=e?String(e):"";return`${n}-${o}`},Dt=(t,e)=>Ot(t,e),ot=async()=>(f("Loading storage state"),chrome.storage.local.get([b.OVERLAY_ENABLED,b.TMDB_API_KEY,b.TMDB_CACHE,b.TMDB_FEATURE_CACHE,b.MATCH_PROFILE,b.LETTERBOXD_INDEX,b.LETTERBOXD_STATS,b.LAST_IMPORT_AT])),Bt=async t=>{f("Saving storage state",t),await chrome.storage.local.set(t)},it="a[href^='/title/']",k=["[role='dialog']","[aria-modal='true']","[aria-expanded='true']","[data-uia*='jawbone']","[class*='jawbone']","[data-uia*='preview']","[data-uia*='billboard']","[data-uia*='hero']","[data-uia*='details']"],rt=["h1","h2","h3","[data-uia*='title']","[class*='title']","[class*='fallback']","[class*='preview'] [class*='header']"],at=["video","img","[data-uia*='preview'] video","[data-uia*='preview'] img","[class*='preview'] video","[class*='preview'] img","[data-uia*='player'] video","[data-uia*='hero'] img"],st=["[data-uia*='controls']","[class*='controls']","[class*='control']","[role='toolbar']"],B=/(S\d+\s*:?\s*E\d+|Season\s*\d+\s*Episode\s*\d+|Episode\s*\d+|\bE\d+\b)/i,q=/(\b\d+\s*(m|min|minutes)\b|\b\d+\s*of\s*\d+\s*(m|min|minutes)\b)/i,Mt=/\b(tv-[a-z0-9]+|pg-?13|pg|tv-ma|tv-y|tv-g|nr|nc-17|hd|uhd|4k|seasons?|season|episode|volume|part\s+\d+)\b/i,It=/^(play|resume|continue|more info|details|watch|watch now|watch again|add|added|my list|remove|rate|like|dislike|thumbs up|thumbs down)$/i,Ht=/because you watched/i,lt=["[data-uia*='maturity-rating']","[data-uia*='season']","[data-uia*='resolution']","[data-uia*='hd']","[class*='maturity']","[class*='season']","[class*='quality']"],ct=["[data-uia*='genre']","a[href*='/genre/']","[class*='genre']"],dt=[...lt,...ct,"[data-uia*='metadata']","[class*='metadata']","[class*='meta']","[class*='maturity']","[class*='season']","[class*='genre']","[class*='tag']","[class*='info']"],Pt=["header","nav","[data-uia*='header']","[data-uia*='row-title']","[class*='rowHeader']","[class*='row-title']"],M=["h1","h2","h3","h4","[data-uia*='title']","[class*='title']","[class*='headline']","[class*='header']","[class*='name']"],kt=/(browse|home|my list|popular|your next watch|explore all|movies & shows|movies and shows|new & popular)/i,E=t=>{const e=t.getBoundingClientRect();if(e.width===0||e.height===0)return!1;const n=window.getComputedStyle(t);return n.visibility==="hidden"||n.display==="none"||n.opacity==="0"?!1:e.bottom>=0&&e.right>=0&&e.top<=window.innerHeight&&e.left<=window.innerWidth},x=t=>{if(!t)return;const e=t.replace(/\s+/g," ").trim();return e.length?e:void 0},ut=t=>{if(!t)return;const e=t.match(/\/title\/(\d+)/);return e==null?void 0:e[1]},I=t=>{if(!t)return;const e=t.match(/(19\d{2}|20\d{2})/);if(!e)return;const n=Number(e[1]);if(!Number.isNaN(n))return n},y=t=>{if(!t)return;let e=t;return e=e.replace(/^\s*S\d+\s*:?\s*E\d+\s*/i,""),e=e.replace(/"[^"]*"/g,n=>{const o=n.replace(/"/g,"");return B.test(o)?"":n}),e=e.replace(/Episode\s*\d+/gi,""),e=e.replace(/\bE\d+\b/gi,""),e=e.replace(q,""),e=e.replace(/\s+of\s+\d+\s*(m|min|minutes)?/gi,""),e=e.replace(/\s+/g," ").trim(),e.length?e:void 0},ft=(t,e)=>{const n=t.getAttribute("href")||void 0,o=ut(n),i=x(t.getAttribute("aria-label")||t.textContent);return{netflixTitleId:o,titleText:i,href:n,source:e}},z=t=>{for(const e of rt){const n=t.querySelector(e);if(n&&E(n)){const o=x(n.textContent);if(o)return o}}},qt=t=>{if(t)return z(t)},zt=t=>{if(t)for(const e of rt){const n=Array.from(t.querySelectorAll(e));for(const o of n){if(!E(o))continue;const i=x(o.textContent);if(!i||B.test(i)||q.test(i))continue;const r=y(i);if(r)return r}}},H=t=>{if(!t)return null;const e=[];return at.forEach(n=>{t.querySelectorAll(n).forEach(o=>{E(o)&&e.push(o)})}),e.length?e.reduce((n,o)=>{const i=n.getBoundingClientRect(),r=o.getBoundingClientRect(),a=i.width*i.height;return r.width*r.height>a?o:n}):null},N=t=>{var i;if(!t)return null;const e=[];st.forEach(r=>{t.querySelectorAll(r).forEach(a=>{E(a)&&e.push(a)})});const o=Array.from(new Set(e)).map(r=>{const a=r.querySelectorAll("button, [role='button']").length,s=r.getBoundingClientRect(),l=a*10+s.width;return{el:r,score:l,top:s.top}}).filter(r=>r.score>0);return o.sort((r,a)=>a.score-r.score||a.top-r.top),((i=o[0])==null?void 0:i.el)??null},Ft=t=>{if(!t)return!1;const e=[...lt,...ct].join(",");return Array.from(t.querySelectorAll(e)).some(o=>E(o))},Yt=t=>!!t.closest(dt.join(",")),F=t=>!!t.closest(Pt.join(",")),w=t=>kt.test(t)||It.test(t.trim())||Ht.test(t)||Mt.test(t)?!0:B.test(t)||q.test(t)||/\b\d+\s*of\s*\d+\s*(m|min|minutes)?\b/i.test(t)||/\b\d+\s*(m|min|minutes)\b/i.test(t),Y=(t,e)=>t.closest('[role="progressbar"], [data-uia*="progress"], [class*="progress"]')?!0:e!==void 0?t.getBoundingClientRect().bottom>=e-8:!1,P=(t,e)=>t?e&&(e.contains(t)||t.closest("button, [role='button']"))?!0:!!t.closest("button, [role='button'], [data-uia*='play'], [data-uia*='button']"):!1,Wt=t=>{const e=t.getBoundingClientRect(),n=N(t),o=n?n.getBoundingClientRect().top:void 0,i=Array.from(t.querySelectorAll(M.join(",")));let r,a=0;const s=[];if(i.forEach(c=>{if(!E(c)){a+=1;return}if(F(c)){a+=1;return}if(P(c,n)){a+=1;return}if(Y(c,o)){a+=1;return}const u=x(c.textContent);if(!u||u.length<2||u.length>80){a+=1;return}if(w(u)){s.push(c),a+=1;return}const h=c.getBoundingClientRect(),m=window.getComputedStyle(c),g=parseFloat(m.fontSize)||14,p=m.fontWeight==="bold"?700:Number(m.fontWeight),d=Number.isNaN(p)?400:p,tt=h.left-e.left,Pe=h.top-e.top,ke=Math.hypot(tt,Pe),qe=Yt(c)?120:0,Nt=g*10+d/10+Math.max(0,300-ke)-qe;(!r||Nt>r.score)&&(r={el:c,score:Nt,text:u})}),r)return{title:y(r.text)??r.text,chosen:r.el,rejectedCount:a};for(const c of s){let u=c.parentElement,h=0;for(;u&&h<4;){const m=Array.from(u.querySelectorAll(M.join(","))).filter(g=>g!==c);for(const g of m){if(!E(g)||P(g,n)||Y(g,o))continue;const p=x(g.textContent);if(!(!p||p.length<2||p.length>80)&&!w(p))return{title:y(p)??p,chosen:g,rejectedCount:a}}u=u.parentElement,h+=1}}const l=t.querySelector("a[href^='/title/']");if(l){const c=l.querySelector(M.join(",")),u=x((c==null?void 0:c.textContent)||l.textContent);if(u&&!w(u))return{title:y(u)??u,chosen:c??l,rejectedCount:a};let h=l.parentElement,m=0;for(;h&&m<4;){const g=Array.from(h.querySelectorAll(M.join(",")));for(const p of g){if(!E(p)||P(p,n)||Y(p,o))continue;const d=x(p.textContent);if(!(!d||d.length<2||d.length>80)&&!w(d))return{title:y(d)??d,chosen:p,rejectedCount:a}}h=h.parentElement,m+=1}}return{title:null,rejectedCount:a}},Vt=t=>{const n=Array.from(t.querySelectorAll(dt.join(","))).map(l=>x(l.textContent)).filter(Boolean);if(!n.length){const l=N(t),c=l==null?void 0:l.nextElementSibling,u=x(c==null?void 0:c.textContent);u&&n.push(u)}const o=n.join(" "),i=I(o),r=/\bseasons?\b/i.test(o),a=/\b\d+\s*(m|min|minutes)\b/i.test(o)||/\b\d+\s*h\b/i.test(o);let s;return r?s=!0:a&&(s=!1),{year:i,isSeries:s}},W=t=>{var n,o;const e=[t.getAttribute("aria-label"),t.getAttribute("title"),(n=t.querySelector("img[alt]"))==null?void 0:n.alt,(o=t.querySelector("[aria-label]"))==null?void 0:o.getAttribute("aria-label"),t.textContent];for(const i of e){const r=x(i);if(r&&!w(r))return r}},Xt=t=>{var o,i,r,a,s;const e=t,n=[((o=e.getAttribute)==null?void 0:o.call(e,"aria-label"))??void 0,((i=e.getAttribute)==null?void 0:i.call(e,"data-uia-title"))??void 0,((r=e.getAttribute)==null?void 0:r.call(e,"title"))??void 0,(s=(a=e.querySelector)==null?void 0:a.call(e,"img[alt]"))==null?void 0:s.alt,e.textContent];for(const l of n){const c=x(l);if(c&&!w(c)&&!F(e))return c}},jt=(t,e,n)=>{const i=Array.from(t.querySelectorAll("a[href^='/title/']")).filter(s=>E(s));if(!i.length)return null;const r=e==null?void 0:e.getBoundingClientRect();let a=null;for(const s of i){if(F(s)||P(s,n)||!W(s))continue;const c=s.getBoundingClientRect(),u=c.width*c.height;let h=0;if(r){const m=r.top-220,g=r.bottom+220;if(c.bottom<m||c.top>g)continue}if(e&&(s.contains(e)||e.contains(s))&&(h+=1e3),r){const m=c.left+c.width/2-(r.left+r.width/2),g=c.top+c.height/2-(r.top+r.height/2),p=Math.hypot(m,g);h+=Math.max(0,500-p)}h+=Math.min(u/100,200),h+=50,(!a||h>a.score)&&(a={anchor:s,score:h})}return(a==null?void 0:a.anchor)??null},Ut=t=>{if(t){const e=Kt(t);if(e)return e}return $t()},V=(t,e,n)=>{const o=nt(t);if(!o)return null;const i=(e==null?void 0:e.getAttribute("href"))??null,r=ut(i)??null,{year:a,isSeries:s}=Vt(n);return{rawTitle:t,normalizedTitle:o,year:a??null,isSeries:s,netflixId:r,href:i}},Kt=t=>{const e=Zt(t);let n,o=null;if(e){const a=W(e);a&&(n=y(a)??a,o=e)}if(!n){let a=t,s=0;for(;a&&a!==document.body&&s<8;){const l=Xt(a);if(l){n=y(l)??l;break}a=a.parentElement,s+=1}}if(!n)return null;if(o){const a=te(o);if(a){const s=V(n,o,a);return s?{jawboneEl:a,extracted:s,chosenTitleElement:o}:null}}let i=o??t,r=0;for(;i&&i!==document.body&&r<8;){if(i instanceof HTMLElement){const a=i.getBoundingClientRect();if(a.width>=200&&a.height>=120){const s=V(n,o,i);if(s)return{jawboneEl:i,extracted:s,chosenTitleElement:o??void 0}}}i=i.parentElement,r+=1}return null},$t=()=>{const t=Qt(),e=ee().map(r=>({root:r,preview:H(r)})),n=t?[{root:t.root,preview:t.preview},...e.filter(r=>r.root!==t.root)]:e,o=window.innerWidth*.85,i=window.innerHeight*.6;for(const r of n){const a=r.root,s=a.getBoundingClientRect();if(s.width>o||s.height>i)continue;const l=r.preview??H(a),c=N(a),u=Ft(a);if(!l||!c)continue;const h=jt(a,l,c);let m=null,g=null;if(h){const d=W(h);d&&(m=y(d)??d,g=h)}if(m||(m=Wt(a).title??null),!m&&!u)continue;if(!m&&u){const d=qt(a);d&&!w(d)&&(m=y(d)??d)}if(!m)continue;const p=V(m,g,a);if(p)return{jawboneEl:a,extracted:p,chosenTitleElement:g??void 0}}return{jawboneEl:null,extracted:null}},X=(t,e)=>{const n=zt(t);if(n)return n;const o=y(e);if(o&&!B.test(o))return o;if(e)return y(e)??e},Gt=t=>{const e=Array.from(t.querySelectorAll(it)),n=e.filter(E);return n.length>0?n[0]:e[0]},ht=()=>{const t=k.join(","),e=Array.from(document.querySelectorAll(t)),n=e.filter(E),o=window.innerWidth*.85,i=window.innerHeight*.6,r=n.filter(a=>{const s=a.getBoundingClientRect();return!(s.width===0||s.height===0||s.width<240||s.height<180||s.width>o||s.height>i)});return r.length>0?r.sort((a,s)=>{const l=a.getBoundingClientRect(),c=s.getBoundingClientRect();return c.width*c.height-l.width*l.height}):n.length>0?n:e},Jt=()=>{const t=[];return at.forEach(e=>{document.querySelectorAll(e).forEach(n=>{if(!E(n))return;const o=n.getBoundingClientRect();o.width<200||o.height<120||t.push(n)})}),t},Qt=()=>{const t=Jt();if(!t.length)return null;const e=window.innerWidth*.85,n=window.innerHeight*.6,o=t.sort((i,r)=>{const a=i.getBoundingClientRect(),s=r.getBoundingClientRect();return s.width*s.height-a.width*a.height});for(const i of o){let r=i,a=0;for(;r&&a<8;){if(r instanceof HTMLElement){const s=r.getBoundingClientRect();if(s.width>=240&&s.height>=180&&s.width<=e&&s.height<=n&&N(r))return{root:r,preview:i}}r=r.parentElement,a+=1}}return null},Zt=t=>{var o,i,r;let e=t;for(;e&&e!==document.body;){if(e instanceof HTMLAnchorElement&&((o=e.getAttribute("href"))!=null&&o.startsWith("/title/")))return e;const a=(i=e.querySelector)==null?void 0:i.call(e,":scope > a[href^='/title/']");if(a&&E(a))return a;e=e.parentElement}const n=(r=t.querySelector)==null?void 0:r.call(t,"a[href^='/title/']");return n&&E(n)?n:null},te=t=>{let e=t,n=0;const o=window.innerWidth*.85,i=window.innerHeight*.6;for(;e&&e!==document.body&&n<12;){if(e instanceof HTMLElement){const r=e.getBoundingClientRect();if(r.width>=240&&r.height>=180&&r.width<=o&&r.height<=i){const a=H(e),s=N(e);if(a&&s)return e}}e=e.parentElement,n+=1}return null},ee=()=>{const t=ht();if(t.length)return t;const e=Array.from(document.querySelectorAll(st.join(","))),n=window.innerWidth*.85,o=window.innerHeight*.6,i=new Set;return e.forEach(r=>{let a=r,s=0;for(;a&&s<6;){if(a instanceof HTMLElement){const l=a.getBoundingClientRect();if(l.width>=240&&l.height>=180&&l.width<=n&&l.height<=o&&H(a)){i.add(a);break}}a=a.parentElement,s+=1}}),Array.from(i)},ne=()=>{const t=ht();for(const n of t){const o=Gt(n);if(o){const r=ft(o,"container-anchor");if(r.netflixTitleId||r.titleText){const a=r.titleText??z(n),s=X(n,a??r.titleText);return{candidate:{...r,titleText:s,year:I(s??a)},container:n}}}const i=z(n);if(i){const r=X(n,i);return{candidate:{titleText:r??i,year:I(r??i),source:"container-text"},container:n}}}const e=Array.from(document.querySelectorAll(it)).find(E);if(e){const n=ft(e,"page-anchor"),o=X(e.closest(k.join(","))??e.parentElement,n.titleText);return{candidate:{...n,titleText:o??n.titleText,year:I(o??n.titleText)},container:e.closest(k.join(","))??e.parentElement}}return{candidate:null,container:null}},oe="nxlb-top-section",ie=()=>{const t=document.createElement("div");t.id=oe,t.style.display="block",t.style.width="100%",t.style.pointerEvents="none";const e=t.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=`
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
  `,i.appendChild(r);const a=document.createElement("div");a.className="nxl-body";const s=document.createElement("div");s.className="nxl-rating",s.dataset.field="communityRating",s.textContent="Community rating: —";const l=document.createElement("div");l.className="nxl-match",l.dataset.field="match",l.textContent="Your match: —";const c=document.createElement("div");c.className="nxl-because",c.dataset.field="because",c.textContent="Because you like: —";const u=document.createElement("div");return u.className="nxl-badges",u.dataset.field="badges",a.appendChild(s),a.appendChild(l),a.appendChild(c),a.appendChild(u),o.appendChild(i),o.appendChild(a),e.appendChild(n),e.appendChild(o),t},re=t=>t==null?"":t>=1e6?`${(t/1e6).toFixed(1)}M`:t>=1e3?`${(t/1e3).toFixed(1)}K`:`${t}`,ae=t=>{const e=Math.max(0,Math.min(5,t)),n=Math.floor(e),o=e%1>=.5;return"★".repeat(n)+(o?"½":"")},mt=(t,e)=>{var c,u,h,m,g,p;const n=((c=e.tmdb)==null?void 0:c.voteAverage)??null,o=((u=e.tmdb)==null?void 0:u.voteCount)??null,i=e.letterboxd,r=(h=t.shadowRoot)==null?void 0:h.querySelector("[data-field='communityRating']");if(r)if(n!=null){const d=re(o),tt=n/2;r.innerHTML=`
        Community rating:
        <span class="nxl-star">★</span>
        ${tt.toFixed(1)}${d?` <span class="nxl-meta">${d} ratings</span>`:""}
      `}else r.textContent="Community rating: —";const a=(m=t.shadowRoot)==null?void 0:m.querySelector("[data-field='match']");a&&((i==null?void 0:i.matchPercent)!==null&&(i==null?void 0:i.matchPercent)!==void 0?a.innerHTML=`Your match: <span class="nxl-match-value">${i.matchPercent}%</span>`:a.textContent="Your match: —");const s=(g=t.shadowRoot)==null?void 0:g.querySelector("[data-field='because']");if(s){const d=(i==null?void 0:i.becauseYouLike)??[];s.textContent=d.length>0?`Because you like: ${d.join(", ")}`:"Because you like: —"}const l=(p=t.shadowRoot)==null?void 0:p.querySelector("[data-field='badges']");if(l){if(l.innerHTML="",i!=null&&i.inWatchlist){const d=document.createElement("span");d.className="nxl-badge",d.textContent="On your watchlist",l.appendChild(d)}if((i==null?void 0:i.userRating)!==null&&(i==null?void 0:i.userRating)!==void 0){const d=document.createElement("span");d.className="nxl-badge",d.textContent=`You rated ${ae(i.userRating)}`,l.appendChild(d)}if(!(i!=null&&i.inWatchlist)&&(i==null?void 0:i.userRating)===void 0){const d=document.createElement("span");d.className="nxl-badge",d.textContent="Letterboxd: —",l.appendChild(d)}}},se=()=>{let t=null,e=null,n=null;const o=()=>{e||(e=ie())};return{mount:l=>{o(),e&&t!==l&&(e.remove(),l.insertBefore(e,l.firstChild),t=l,requestAnimationFrame(()=>{e==null||e.classList.add("nxl-visible")}))},update:l=>{n=l,e&&mt(e,l)},unmount:()=>{e&&e.remove(),t=null},renderLast:()=>{e&&n&&mt(e,n)},getLastData:()=>n,getCurrentRoot:()=>t,isMounted:()=>!!(e&&e.isConnected)}},pt="nxlb-status-badge",le=()=>{const t=document.createElement("div");t.id=pt,t.style.position="fixed",t.style.bottom="16px",t.style.right="16px",t.style.zIndex="2147483647",t.style.pointerEvents="none";const e=t.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=`
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
  `,e.appendChild(n),e.appendChild(o),t},R=t=>{const e=document.getElementById(pt);if(!t){e&&(e.remove(),f("OVERLAY_BADGE_REMOVED"));return}if(e)return;const n=le();document.documentElement.appendChild(n),f("OVERLAY_BADGE_MOUNTED")},j={ctrlKey:!0,shiftKey:!0,key:"l"},ce=250,de=2e3,ue=.85,fe=.6,T=se();let v=!0,gt="",bt=null,U,K,Et="",S=null,A=!1,xt=null,O=null;const yt=()=>window,he=t=>{if(!t)return!1;const e=t.getBoundingClientRect();return e.width===0||e.height===0?!1:e.width>window.innerWidth*ue||e.height>window.innerHeight*fe},$=t=>{S&&S!==t&&(S.style.outline="",S.style.outlineOffset="",S=null),t&&(t.style.outline="1px solid rgba(255, 80, 80, 0.85)",t.style.outlineOffset="-1px",S=t)},me=()=>window.location.pathname.includes("/watch/"),Tt=()=>Array.from(document.querySelectorAll("video")).some(e=>{if(e.paused||e.ended)return!1;const n=e.getBoundingClientRect();if(n.width===0||n.height===0)return!1;const o=n.width/window.innerWidth,i=n.height/window.innerHeight;return o>.85||i>.6}),pe=()=>!!document.querySelector("[data-uia*='video-player'], [class*='VideoPlayer'], [class*='watch-video'], [data-uia*='player']"),ge=()=>!!(me()||Tt()||pe()&&Tt()),G=()=>{const t=ge();t!==A&&(A=t,A?(R(!1),f("BADGE_HIDDEN_PLAYBACK"),T.unmount()):v&&(R(!0),f("BADGE_SHOWN"),f("BROWSE_MODE_DETECTED")))},be=()=>{if(!v){R(!1);return}A||(R(!0),f("BADGE_SHOWN"))},Ee=t=>[t.normalizedTitle??"",t.year??"",t.netflixId??"",t.href??""].join("|"),xe=(t,e)=>({title:t,year:e??null,tmdb:{id:null,voteAverage:null,voteCount:null},letterboxd:{inWatchlist:!1,userRating:null,matchPercent:null,becauseYouLike:[]}}),ye=()=>O?O.isConnected?O:(O=null,null):null,J=t=>{if(!v||(G(),A))return;f("OVERLAY_MOUNT_ATTEMPT",{reason:t});const e=Ut(ye()),n=e.jawboneEl,o=e.extracted;if(!n||!o){f("OVERLAY_MOUNT_FAILED",{reason:"no-jawbone"}),T.unmount(),$(null);return}if(he(n)){f("OVERLAY_MOUNT_FAILED",{reason:"hero-sized"}),T.unmount(),$(null);return}f("ACTIVE_JAWBONE_FOUND",{rawTitle:o.rawTitle,netflixId:o.netflixId,year:o.year,isSeries:o.isSeries,rejectedTitleCandidates:e.rejectedCount,chosenTitleElement:e.chosenTitleElement?e.chosenTitleElement.outerHTML.slice(0,200):void 0}),f("EXTRACTED_TITLE_INFO",o);const i=Ee(o);if(i===gt&&n===bt){f("OVERLAY_MOUNT_SUCCESS",{reused:!0});return}gt=i,bt=n,$(n),T.mount(n),T.update(xe(o.rawTitle,o.year??void 0));const r=`req_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;Et=r;const a={type:"RESOLVE_OVERLAY_DATA",requestId:r,payload:o};f("OVERLAY_REQUEST",{titleText:o.rawTitle,normalizedTitle:o.normalizedTitle,href:o.href,year:o.year}),chrome.runtime.sendMessage(a).then(s=>{var l,c,u,h,m;if((s==null?void 0:s.type)==="OVERLAY_DATA_RESOLVED"&&s.requestId===Et){xt=s.payload,f("OVERLAY_RESPONSE",{requestId:r,tmdb:s.payload.tmdb,letterboxd:{inWatchlist:((l=s.payload.letterboxd)==null?void 0:l.inWatchlist)??!1,userRating:((c=s.payload.letterboxd)==null?void 0:c.userRating)??null,matchPercent:((u=s.payload.letterboxd)==null?void 0:u.matchPercent)??null,becauseYouLikeCount:((m=(h=s.payload.letterboxd)==null?void 0:h.becauseYouLike)==null?void 0:m.length)??0}}),T.update(s.payload);{const g=s.payload.letterboxd;if(!g||!g.inWatchlist&&g.userRating===null){const p=Dt(o.rawTitle,o.year??void 0);chrome.storage.local.get([b.LETTERBOXD_INDEX]).then(d=>{d[b.LETTERBOXD_INDEX]?o.year?f("LB_MATCH_NOT_FOUND",{reason:"no-key",key:p}):f("LB_MATCH_NOT_FOUND",{reason:"missing-year",key:p}):f("LB_MATCH_NOT_FOUND",{reason:"no-index",key:p})})}}}}).catch(s=>{f("Title resolve failed",{requestId:r,err:s})})},C=t=>{U&&window.clearTimeout(U),U=window.setTimeout(()=>{J(t)},ce)},Te=()=>{new MutationObserver(()=>{try{C("mutation")}catch(e){f("Mutation observer failed",{error:e})}}).observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class","style","aria-expanded","aria-hidden"]}),document.addEventListener("pointerover",e=>{try{O=e.target,C("pointer")}catch(n){f("Pointer observer failed",{error:n})}},!0),document.addEventListener("focusin",()=>{try{C("focus")}catch(e){f("Focus observer failed",{error:e})}},!0),K&&window.clearInterval(K),K=window.setInterval(()=>{v&&(G(),!A&&(T.isMounted()||J("watchdog")))},de),C("init")},we=async()=>{const e=!((await ot())[b.OVERLAY_ENABLED]??!0);await Bt({[b.OVERLAY_ENABLED]:e}),v=e,e?(be(),C("toggle")):(T.unmount(),R(!1)),f("Overlay toggled",{enabled:e})},ve=t=>{t.ctrlKey===j.ctrlKey&&t.shiftKey===j.shiftKey&&t.key.toLowerCase()===j.key&&(t.preventDefault(),we().catch(e=>f("Toggle failed",e)))},Ae=()=>{chrome.runtime.onMessage.addListener(t=>{if((t==null?void 0:t.type)==="LB_INDEX_UPDATED"){f("LB_INDEX_UPDATED"),C("lb-index-updated");return}(t==null?void 0:t.type)==="LB_INDEX_UPDATED_ACK"&&(f("LB_INDEX_UPDATED_ACK",t.payload),C("lb-index-updated"))})},Ce=()=>{const t=yt();t.__nxlDebug={getLbIndex:async()=>chrome.storage.local.get(b.LETTERBOXD_INDEX),lastOverlayData:()=>xt,forceResolve:()=>J("force")}},_e=async()=>{const t=yt();if(t.__nxlBooted)return;t.__nxlBooted=!0,v=(await ot())[b.OVERLAY_ENABLED]??!0,G(),v&&!A&&(R(!0),f("BADGE_SHOWN"),f("BROWSE_MODE_DETECTED")),Te(),Ae(),Ce(),window.addEventListener("keydown",ve)},wt="nxl-xray-panel";function Re(){const t=document.createElement("div");t.id=wt,t.style.cssText=`
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
  `;const o=document.createElement("div");return o.className="panel",o.innerHTML='<div class="panel-title">In this scene</div><div class="actor-list" data-list></div>',e.appendChild(n),e.appendChild(o),t}let L=null;function Se(){return(!L||!L.isConnected)&&(L=Re(),document.documentElement.appendChild(L)),L}function Q(){var e;return((e=Se().shadowRoot)==null?void 0:e.querySelector("[data-list]"))??null}function vt(t){const e=Q();if(e){if(e.innerHTML="",e.classList.remove("state-loading"),t.length===0){e.innerHTML='<div class="state-message">No faces visible in this frame</div>';return}for(const n of t){const o=document.createElement("div");o.className="actor-card";const i=document.createElement("img");i.className="actor-photo",i.alt=n.name,n.photoUrl?(i.src=n.photoUrl,i.onerror=()=>{i.style.display="none"}):i.style.display="none";const r=document.createElement("div");r.className="actor-info";const a=document.createElement("div");if(a.className="actor-name",a.textContent=n.name,r.appendChild(a),n.character){const s=document.createElement("div");s.className="actor-character",s.textContent=n.character,r.appendChild(s)}if(n.confidence>0&&n.confidence<1){const s=document.createElement("div");s.className="actor-confidence",s.textContent=`${Math.round(n.confidence*100)}% match`,r.appendChild(s)}o.appendChild(i),o.appendChild(r),e.appendChild(o)}}}function Le(){const t=Q();t&&(t.innerHTML='<div class="state-message state-loading">Identifying actors…</div>')}function D(t){const e=Q();e&&(e.innerHTML=`<div class="state-message">${Oe(t)}</div>`)}function Ne(){const t=document.getElementById(wt);t&&t.remove(),L=null}function Oe(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}let _,At=0,Ct=!0;function De(){const t=window.location.pathname.match(/\/watch\/(\d+)/);return t==null?void 0:t[1]}function Be(){var a,s;const{candidate:t,container:e}=ne();if(t!=null&&t.titleText)return{titleText:t.titleText,year:t.year??void 0};const n=document.querySelector("[data-uia='video-title'], .title-title, [class*='title']"),o=(a=n==null?void 0:n.textContent)==null?void 0:a.trim(),i=document.querySelector("[class*='year'], [data-uia*='year']"),r=(s=i==null?void 0:i.textContent)==null?void 0:s.match(/(19\d{2}|20\d{2})/);return{titleText:o??void 0,year:r?Number(r[1]):void 0}}function Me(){if(!Ct)return;const t=De();if(!t){f("X-Ray: no title ID on watch page"),D("Could not detect title");return}const{titleText:e,year:n}=Be(),o={tabId:0,netflixTitleId:t,titleText:e,year:n,timestamp:Math.floor(Date.now()/1e3)};chrome.runtime.sendMessage({type:"ANALYZE_FRAME",requestId:`xray_${Date.now()}`,payload:o},i=>{if(chrome.runtime.lastError){D(chrome.runtime.lastError.message||"Extension error");return}if((i==null?void 0:i.type)!=="XRAY_FRAME_RESULT"){D("No response");return}const{actors:r,noFaces:a,drmBlocked:s,error:l}=i.payload;if(l){D(s?"Capture not available (DRM)":l);return}vt(a?[]:r)})}function _t(){const t=document.querySelectorAll("video");for(const e of t){const n=e.getBoundingClientRect();if(n.width>=window.innerWidth*.5&&n.height>=window.innerHeight*.5)return e}return t[0]??null}function Z(){const t=Date.now();t-At<et||(At=t,_&&window.clearTimeout(_),_=window.setTimeout(()=>{_=void 0,Le(),Me()},et))}function Ie(){_&&(window.clearTimeout(_),_=void 0),Ne()}function Rt(t){t.addEventListener("pause",Z),t.addEventListener("play",Ie)}function St(){return window.location.pathname.includes("/watch/")}async function He(){if(Ct=(await chrome.storage.local.get([b.XRAY_ENABLED]))[b.XRAY_ENABLED]!==!1,!St())return;const e=_t();e&&(Rt(e),e.paused&&Z()),new MutationObserver(()=>{if(!St())return;const o=_t();o&&!o.dataset.nxlObserved&&(o.dataset.nxlObserved="1",Rt(o),o.paused&&Z())}).observe(document.body,{childList:!0,subtree:!0})}const Lt=async()=>{await _e(),await He()};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{Lt().catch(t=>f("Init failed",t))},{once:!0}):Lt().catch(t=>f("Init failed",t))})();
//# sourceMappingURL=index.js.map
