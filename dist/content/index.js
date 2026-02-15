import{g as i}from"../assets/storage-BxG7gY1H.js";const l="nxlb-shadow-root",r=()=>{if(document.getElementById(l))return;const t=document.createElement("div");t.id=l,t.style.position="fixed",t.style.top="16px",t.style.right="16px",t.style.zIndex="2147483647";const d=t.attachShadow({mode:"open"}),s=document.createElement("style");s.textContent=`
    :host {
      all: initial;
      font-family: "Space Grotesk", sans-serif;
    }
    .panel {
      background: rgba(12, 12, 12, 0.9);
      color: #f5f5f5;
      border-radius: 12px;
      padding: 12px 14px;
      min-width: 220px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .title {
      font-size: 13px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 8px;
      opacity: 0.7;
    }
    .status {
      font-size: 14px;
      line-height: 1.4;
    }
  `;const o=document.createElement("div");o.className="panel";const n=document.createElement("div");n.className="title",n.textContent="Letterboxd";const e=document.createElement("div");e.className="status",e.textContent="Loading export status...",o.appendChild(n),o.appendChild(e),d.appendChild(s),d.appendChild(o),document.documentElement.appendChild(t),i().then(a=>{if(!a.letterboxdExport){e.textContent="No export loaded yet.";return}e.textContent=`Export loaded: ${a.letterboxdExport.films.length} films.`}).catch(a=>{e.textContent="Failed to read storage."})};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",r,{once:!0}):r();
//# sourceMappingURL=index.js.map
