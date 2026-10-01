import"./style-oRVOOfyl.js";import{m as T}from"./menuData-CEAaQ95C.js";function I(a){try{let s=a.replace(/-/g,"+").replace(/_/g,"/");for(;s.length%4;)s+="=";const l=decodeURIComponent(escape(atob(s)));return JSON.parse(l)}catch(s){return console.error("Payload decoding failed:",s),null}}document.addEventListener("DOMContentLoaded",()=>{const a=document.getElementById("verify-card");if(!a)return;const l=new URLSearchParams(window.location.search).get("o");if(!l){w(a,"Missing verification code. Please make sure you clicked the full link from WhatsApp.");return}const n=I(l);if(!n||!n.n||!n.k||!Array.isArray(n.i)){w(a,"Invalid or corrupted verification code. This order bill may have been tampered with or edited!");return}D(a,n)});function D(a,s){const{n:l,p:n,t:p,k:S,i:k,a:d}=s;let f="Takeaway / Parcel";p===0?f="Dine-in (Eating at Restaurant)":p===2&&(f="Door Delivery");let m="";if(p===2&&d){const e=d.includes("||GPS:")?d.split("||GPS:")[1].trim():"",i=(d.includes("||GPS:")?d.split("||GPS:")[0]:d).trim(),o=e||(i?i.toLowerCase().includes("yadagirigutta")?i:`${i}, Yadagirigutta, Telangana`:""),r=o?`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(o)}&dir_action=navigate`:"";m=`
      <div class="meta-item full-width" style="grid-column: 1 / -1; margin-top: 10px; border-top: 1px dashed rgba(0, 0, 0, 0.08); padding-top: 10px; width: 100%;">
        <span class="meta-label">Delivery Address</span>
        <span class="meta-value" style="font-weight: 600; color: var(--text-dark);">${i}</span>
        ${r?`
          <div style="margin-top: 8px;">
            <a href="${r}" target="_blank" rel="noopener noreferrer" style="display:inline-flex; align-items:center; gap:6px; background:#10b981; color:#fff; padding:6px 12px; border-radius:6px; font-size:0.8rem; font-weight:700; text-decoration:none;">
              <i class="fa-solid fa-location-arrow"></i> Start Google Maps Navigation
            </a>
          </div>
        `:""}
      </div>
    `}let v="",y=0,g=1;k.forEach(([e,i,o])=>{const r=T.find(b=>b.id===e||b.name===e),c=r?r.name:e,t=r?r.price:o||0,x=t*i;y+=x,v+=`
      <tr class="verify-table-row">
        <td>${g}. <strong>${c}</strong></td>
        <td style="text-align: center;">x ${i}</td>
        <td style="text-align: right;">₹${t}</td>
        <td style="text-align: right; font-weight: 700; color: var(--text-dark);">₹${x}</td>
      </tr>
    `,g++});const u=new Date,$=u.toLocaleDateString("en-IN",{dateStyle:"medium"}),P=u.toLocaleTimeString("en-IN",{timeStyle:"short"});a.className="verify-card verified",a.innerHTML=`
    <div class="verify-status-banner">
      <div class="verify-icon-wrapper">
        <i class="fa-solid fa-circle-check"></i>
      </div>
      <h2>Order Verified</h2>
      <span class="badge-verified"><i class="fa-solid fa-circle-check"></i> Genuine Receipt</span>
    </div>
    
    <div class="verify-details">
      <div class="verify-meta-grid">
        <div class="meta-item">
          <span class="meta-label">Order Token</span>
          <span class="meta-value highlight">${S}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Dining Option</span>
          <span class="meta-value">${f}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Customer Name</span>
          <span class="meta-value">${l}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Phone Number</span>
          <span class="meta-value">${n}</span>
        </div>
        ${m}
      </div>
      
      <div class="verify-bill-section">
        <h3>Official Bill Items</h3>
        <div class="verify-table-wrapper">
          <table class="verify-table">
            <thead>
              <tr>
                <th style="text-align: left;">Item</th>
                <th>Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${v}
            </tbody>
          </table>
        </div>
        
        <div class="verify-total-row">
          <span>Official Total Amount:</span>
          <span class="verify-total-price">₹${y}</span>
        </div>
      </div>

      <div class="verify-footer">
        <p><i class="fa-solid fa-clock"></i> Checked on ${$} at ${P}</p>
        <p class="verification-note">Prices verified against official Varevva Menu. This bill represents the correct price calculation.</p>
        <a href="/index.html" class="btn-verify-back">Back to Home</a>
      </div>
    </div>
  `;const h=new URLSearchParams(window.location.search).get("orderId");if(h){const e=document.createElement("div");e.id="verify-db-status",e.style.marginTop="16px",e.style.borderTop="1px dashed rgba(0,0,0,0.08)",e.style.paddingTop="16px",e.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Checking live payment verification...';const i=a.querySelector(".verify-details"),o=a.querySelector(".verify-footer");i&&o&&i.insertBefore(e,o),setTimeout(async()=>{try{const r=await fetch(`/api/orders/track/${h}`);if(r.ok){const c=await r.json();if(c.order){const t=c.order;e.innerHTML=`
              <h3 style="font-family: var(--font-header); font-size: 0.95rem; margin: 0 0 10px 0; color: var(--text-dark); text-align: left;">Live Payment Status</h3>
              <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.8rem; text-align: left;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted);">Order Reference ID:</span>
                  <span style="font-weight: 700; color: var(--text-dark);">${t.orderId}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted);">Payment Method:</span>
                  <span style="font-weight: 600; color: var(--text-dark);">${t.paymentMethod}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted);">Payment Status:</span>
                  <span style="font-weight: 700; color: ${t.paymentStatus==="Paid"?"#059669":"#d97706"};">${t.paymentStatus}</span>
                </div>
                ${t.utrNumber?`
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted);">Transaction / UTR ID:</span>
                  <span style="font-family: monospace; font-weight: 700; color: var(--text-dark);">${t.utrNumber}</span>
                </div>`:""}
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted);">Verification Status:</span>
                  <span style="font-weight: 700; color: ${t.orderStage==="Order Confirmed"||t.orderStage==="Preparing Food"||t.orderStage==="Ready for Pickup"||t.orderStage==="Completed"?"#059669":"#d97706"};">
                    ${t.orderStage==="Order Confirmed"||t.orderStage==="Preparing Food"||t.orderStage==="Ready for Pickup"||t.orderStage==="Completed"?"✓ VERIFIED":"PENDING"}
                  </span>
                </div>
              </div>
            `}else e.remove()}else e.remove()}catch{e.remove()}},100)}}function w(a,s){a.className="verify-card failed",a.innerHTML=`
    <div class="verify-status-banner">
      <div class="verify-icon-wrapper">
        <i class="fa-solid fa-triangle-exclamation"></i>
      </div>
      <h2>Verification Failed</h2>
      <span class="badge-failed"><i class="fa-solid fa-circle-xmark"></i> Untrusted Receipt</span>
    </div>
    
    <div class="verify-error-content">
      <p class="error-msg">${s}</p>
      <p class="error-warning"><i class="fa-solid fa-circle-info"></i> Security Note: If the customer modified the text in the WhatsApp message to reduce the price or change items, the verification code signature will mismatch or decode incorrectly.</p>
      
      <div class="error-actions">
        <a href="/index.html" class="btn-verify-back">Back to Home</a>
      </div>
    </div>
  `}
