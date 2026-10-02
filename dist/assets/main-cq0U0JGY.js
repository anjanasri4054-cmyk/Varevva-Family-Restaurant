import{i as fe,f as G,a as K,s as ge}from"./db-D6wm5-Ip.js";const Z=document.getElementById("navbar"),J=document.getElementById("nav-menu"),W=document.getElementById("mobile-nav-toggle"),A=document.getElementById("live-menu-grid"),_=document.getElementById("live-specials-grid"),V=document.getElementById("menu-search"),F=document.getElementById("search-clear-btn"),oe=document.querySelectorAll(".btn-filter-diet"),re=document.querySelectorAll(".menu-tab-btn");let ee="all",te="all",R="",T=[],E=[],B=sessionStorage.getItem("varevva_admin_logged_in")==="true";document.addEventListener("DOMContentLoaded",async()=>{await fe(),T=await G(),E=await K(),ye(),be(),ie(),A&&(ve(),he(),ne(),M()),_&&(ne(),z()),Se(),new URLSearchParams(window.location.search).get("checkout")==="true"&&setTimeout(()=>{de()},100)});function ye(){Z&&window.addEventListener("scroll",()=>{window.scrollY>50?Z.classList.add("scrolled"):Z.classList.remove("scrolled")})}function be(){W&&J&&(W.addEventListener("click",()=>{J.classList.toggle("open");const a=W.querySelector("i");J.classList.contains("open")?a.className="fa-solid fa-xmark":a.className="fa-solid fa-bars"}),J.querySelectorAll("a").forEach(a=>{a.addEventListener("click",()=>{J.classList.remove("open"),W.querySelector("i").className="fa-solid fa-bars"})}))}function ve(){re.forEach(e=>{e.addEventListener("click",()=>{re.forEach(a=>a.classList.remove("active")),e.classList.add("active"),ee=e.dataset.category,M()})}),oe.forEach(e=>{e.addEventListener("click",()=>{oe.forEach(a=>a.classList.remove("active")),e.classList.add("active"),te=e.dataset.diet,M()})})}function he(){V&&V.addEventListener("input",e=>{R=e.target.value.toLowerCase().trim(),F&&(R.length>0?F.style.display="block":F.style.display="none"),M()}),F&&V&&F.addEventListener("click",()=>{V.value="",R="",F.style.display="none",V.focus(),M()})}function se(e,a="non-veg"){const t=a==="veg"?"/assets/paneer_butter_masala.png":"/assets/chicken_dum_biryani.png";if(!e||typeof e!="string")return t;let o=e.trim();return o?(o.startsWith("/public/assets/")?o=o.replace("/public/assets/","/assets/"):o.startsWith("public/assets/")?o=o.replace("public/assets/","/assets/"):o.startsWith("assets/")&&(o="/"+o),o):t}function xe(e){return se(e.image,e.type)}function U(){try{let e=localStorage.getItem("varevva_cart"),a=JSON.parse(e)||{};if(Array.isArray(a)){const t={};a.forEach(o=>{o&&o.name&&(t[o.name]={name:o.name,price:Number(o.price)||0,quantity:Number(o.quantity)||1})}),a=t,localStorage.setItem("varevva_cart",JSON.stringify(a))}if(T.length>0){let t=!1;Object.keys(a).forEach(o=>{const r=T.find(n=>n.name===o);r&&(r.outOfStock?(delete a[o],t=!0):a[o].price=r.price)}),t&&localStorage.setItem("varevva_cart",JSON.stringify(a))}return a}catch{return{}}}function le(e){localStorage.setItem("varevva_cart",JSON.stringify(e)),ie()}function we(e,a){const t=U();t[e]?t[e].quantity+=1:t[e]={name:e,price:Number(a),quantity:1},le(t),A&&M(),_&&z()}function X(e,a){const t=U();t[e]&&(t[e].quantity+=a,t[e].quantity<=0&&delete t[e],le(t),A&&M(),_&&z())}function ie(){const e=U(),a=Object.keys(e);let t=document.querySelector(".floating-cart-bar");if(a.length===0){t&&t.remove();return}let o=0,r=0;a.forEach(n=>{o+=e[n].quantity,r+=e[n].price*e[n].quantity}),t||(t=document.createElement("div"),t.className="floating-cart-bar",document.body.appendChild(t)),t.innerHTML=`
    <div class="cart-info">
      <div class="cart-icon-wrapper">
        <i class="fa-solid fa-cart-shopping"></i>
        <span class="cart-badge">${o}</span>
      </div>
      <span>${o} Item${o>1?"s":""} | ₹${r}</span>
    </div>
    <button class="cart-btn-order" id="btn-cart-whatsapp-order">
      <span>View Order & Pay</span>
      <i class="fa-solid fa-arrow-right"></i>
    </button>
  `}function de(){const e=U();if(Object.keys(e).length===0||document.querySelector(".order-modal-overlay"))return;const a=document.createElement("div");a.className="order-modal-overlay",a.innerHTML=`
    <div class="order-modal-card">
      <div class="order-modal-header">
        <h3>Order Details</h3>
        <button class="btn-close-modal" id="btn-close-order-modal">&times;</button>
      </div>
      
      <!-- Order Items Summary Section -->
      <div class="order-modal-summary">
        <label style="font-family: var(--font-header); font-weight: 700; font-size: 0.88rem; color: var(--text-dark); display: block; margin-bottom: 8px;">Order Summary</label>
        <div class="modal-summary-box" id="modal-summary-items-container">
          <!-- Dynamically populated -->
        </div>
      </div>

      <form class="order-modal-form" id="order-details-form">
        <div class="form-group">
          <label for="cust-name">Your Name</label>
          <input type="text" id="cust-name" placeholder="Enter your name" required>
        </div>
        <div class="form-group">
          <label for="cust-phone">Phone Number</label>
          <input type="tel" id="cust-phone" placeholder="Enter 10-digit mobile number" pattern="[0-9]{10}" title="Please enter a valid 10-digit mobile number" required>
        </div>
        <div class="form-group">
          <label for="order-type">Dining Preference</label>
          <select id="order-type">
            <option value="dine-in">Dine-in (Eating at Restaurant)</option>
            <option value="takeaway">Takeaway / Parcel</option>
            <option value="delivery">Door Delivery (within 4km radius)</option>
          </select>
        </div>

        <div class="form-group">
          <label style="font-weight: 700; margin-bottom: 6px; display: block;">Payment Method</label>
          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
            <label style="display: flex; align-items: center; gap: 8px; font-weight: 500; cursor: pointer; font-size: 0.9rem;">
              <input type="radio" name="payment-method-choice" value="online" checked style="width: auto; margin: 0;">
              <span>Pay Online (PhonePe QR & Screenshot Verification)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-weight: 500; cursor: pointer; font-size: 0.9rem;">
              <input type="radio" name="payment-method-choice" value="cod" style="width: auto; margin: 0;">
              <span>Pay at Restaurant / Cash on Delivery</span>
            </label>
          </div>
        </div>

        <div id="delivery-fields" style="display: none; flex-direction: column; gap: 12px; margin-top: 12px; border-top: 1px dashed rgba(0,0,0,0.08); padding-top: 12px;">
          <div class="form-group">
            <label for="cust-address">Delivery Address</label>
            <textarea id="cust-address" placeholder="Enter house no, street, landmark, Yadagirigutta" rows="2" style="padding: 10px 12px; border-radius: var(--border-radius-sm); border: 1px solid rgba(0,0,0,0.1); outline: none; font-family: var(--font-accent); font-size: 0.95rem; transition: var(--transition-smooth); width: 100%; resize: vertical;"></textarea>
          </div>
          <input type="hidden" id="gps-coords" value="">
          <div class="form-group" style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 10px; padding: 12px;">
            <label style="font-weight: 700; color: #166534; display: flex; align-items: center; gap: 6px; font-size: 0.88rem;">
              <i class="fa-solid fa-location-dot"></i> Live GPS Location (For Delivery Navigation)
            </label>
            <div style="display: flex; gap: 10px; align-items: center; margin-top: 8px; flex-wrap: wrap;">
              <button type="button" id="btn-detect-location" style="padding: 8px 14px; font-size: 0.84rem; width: auto; display: inline-flex; align-items: center; gap: 6px; margin: 0; background: #16a34a; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; transition: 0.2s; box-shadow: 0 2px 6px rgba(22,163,74,0.3);">
                <i class="fa-solid fa-crosshairs"></i> Tap to Share Live GPS Location
              </button>
              <span id="location-status" style="font-size: 0.82rem; font-weight: 600; color: #4b5563;">Not shared yet</span>
            </div>
            <p style="font-size: 0.74rem; color: #15803d; margin-top: 8px; line-height: 1.35; margin-bottom: 0;">
              ✨ Sharing your GPS location lets the delivery driver navigate straight to your doorstep on Google Maps!
            </p>
          </div>
        </div>

        <div class="form-group" style="margin-top: 8px;">
          <label for="cust-pickup-time">Pickup / Preferred Time (Optional)</label>
          <input type="text" id="cust-pickup-time" placeholder="e.g. 7:30 PM (Default: ASAP)">
        </div>

        <div class="form-group">
          <label for="cust-instructions">Special Cooking Instructions (Optional)</label>
          <input type="text" id="cust-instructions" placeholder="e.g. Less spicy, extra gravy">
        </div>

        <button type="submit" class="btn-submit-order" id="btn-submit-order" style="margin-top: 14px;">
          <span id="submit-btn-text">Place Order</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </form>
    </div>
  `,document.body.appendChild(a);const t=a.querySelector("#btn-close-order-modal"),o=a.querySelector("#order-details-form"),r=a.querySelector("#order-type");a.querySelector("#submit-btn-text");const n=a.querySelector("#modal-summary-items-container"),x=()=>{const f=U(),s=Object.keys(f);if(s.length===0){Q();return}let i="",g=0;s.forEach(b=>{const c=f[b],$=c.price*c.quantity;g+=$,i+=`
        <div class="modal-summary-item" data-name="${c.name}">
          <div class="summary-item-info">
            <span class="summary-item-name">${c.name}</span>
            <span class="summary-item-price">₹${c.price} each</span>
          </div>
          <div class="summary-item-actions">
            <div class="modal-qty-control">
              <button type="button" class="btn-modal-qty-minus" data-name="${c.name}">-</button>
              <span class="modal-qty-value">${c.quantity}</span>
              <button type="button" class="btn-modal-qty-plus" data-name="${c.name}">+</button>
            </div>
            <span class="summary-item-subtotal">₹${$}</span>
          </div>
        </div>
      `}),n.innerHTML=`
      <div class="modal-items-list">
        ${i}
      </div>
      <div class="modal-summary-total">
        <span>Total Cost:</span>
        <span>₹${g}</span>
      </div>
    `};x(),n.addEventListener("click",f=>{const s=f.target.closest(".btn-modal-qty-minus"),i=f.target.closest(".btn-modal-qty-plus");s?(X(s.dataset.name,-1),x()):i&&(X(i.dataset.name,1),x())});let m=null;r.addEventListener("change",()=>{const f=a.querySelector("#delivery-fields"),s=a.querySelector("#cust-address");r.value==="delivery"?(f.style.display="flex",s.setAttribute("required","true")):(f.style.display="none",s.removeAttribute("required"))});const y=a.querySelector("#btn-detect-location"),d=a.querySelector("#location-status"),w=a.querySelector("#gps-coords");y&&y.addEventListener("click",()=>{if(!navigator.geolocation){d.style.color="#ef4444",d.innerHTML='<i class="fa-solid fa-circle-exclamation"></i> GPS not supported on this device.';return}d.style.color="#1e293b",d.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Pinning GPS location...';const f=i=>{const g=i.coords.latitude,b=i.coords.longitude;w&&(w.value=`${g},${b}`);const c=a.querySelector("#cust-address");c&&!c.value.trim()&&fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${g}&lon=${b}`).then(l=>l.json()).then(l=>{l&&l.display_name&&!c.value.trim()&&(c.value=l.display_name)}).catch(()=>{});const $=`https://router.project-osrm.org/route/v1/driving/${b},${g};78.9440528,17.5700914?overview=false`;fetch($).then(l=>l.json()).then(l=>{let v=0;l.code==="Ok"&&l.routes&&l.routes[0]?v=l.routes[0].distance/1e3:v=Ae(17.5700914,78.9440528,g,b),m=v.toFixed(2),v<=4?(d.style.color="#16a34a",d.innerHTML=`<i class="fa-solid fa-circle-check"></i> GPS Pinned (${m} km) ✓`):(d.style.color="#ef4444",d.innerHTML=`<i class="fa-solid fa-circle-xmark"></i> ${m} km (Outside 4km range)`,alert(`Delivery address is outside our 4km range (${m} km). Please choose Dine-in or Takeaway.`))}).catch(()=>{d.style.color="#16a34a",d.innerHTML='<i class="fa-solid fa-circle-check"></i> Live GPS Pinned ✓'})},s=()=>{navigator.geolocation.getCurrentPosition(f,()=>{d.style.color="#d97706",d.innerHTML='<i class="fa-solid fa-triangle-exclamation"></i> GPS timed out. Manual address used.'},{enableHighAccuracy:!1,timeout:15e3,maximumAge:6e4})};navigator.geolocation.getCurrentPosition(f,s,{enableHighAccuracy:!0,timeout:1e4,maximumAge:3e4})}),t.addEventListener("click",Q),a.addEventListener("click",f=>{f.target===a&&Q()}),o.addEventListener("submit",async f=>{f.preventDefault();const s=o.querySelector('button[type="submit"]'),i=s?s.innerHTML:"Proceed to Payment";try{const g=o.querySelector("#cust-name").value.trim(),b=o.querySelector("#cust-phone").value.trim(),c=r.options[r.selectedIndex].text,$="cod",l=r.value==="delivery"?o.querySelector("#cust-address").value.trim():"",v=o.querySelector("#gps-coords")?o.querySelector("#gps-coords").value.trim():"",q=o.querySelector("#cust-pickup-time")?o.querySelector("#cust-pickup-time").value.trim():"",h=o.querySelector("#cust-instructions")?o.querySelector("#cust-instructions").value.trim():"";if(r.value==="delivery"&&!l&&!v){alert("Please enter your delivery address or share your live GPS location.");return}let u="";r.value==="delivery"&&(l&&v?u=`${l}||GPS:${v}`:v?u=`Live GPS Location||GPS:${v}`:u=l);const p=o.querySelector('input[name="payment-method-choice"]:checked').value;let k=p==="online"?"UPI QR Payment":"Cash on Delivery";const P=U();let S=0;const C=Object.keys(P).map(I=>{const O=P[I].price*P[I].quantity;return S+=O,{name:P[I].name,quantity:P[I].quantity,price:P[I].price,subtotal:O}});localStorage.setItem("varevva_last_order_items",JSON.stringify(C)),localStorage.setItem("varevva_last_total",String(S)),s&&(s.disabled=!0,s.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Processing Order...');let L=null;const N={customerName:g,customerPhone:b,pickupTime:q,specialInstructions:h,diningPreference:c,deliveryAddress:u,items:C,totalAmount:S,paymentMethod:k};localStorage.setItem("varevva_last_order_payload",JSON.stringify(N));const H="/api/orders";for(let I=1;I<=2;I++)try{const O=await fetch(H,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(N)});if(O.ok){const D=await O.json();if(D.order&&D.order.orderId){L=D.order.orderId,Array.isArray(D.order.items)&&localStorage.setItem("varevva_last_order_items",JSON.stringify(D.order.items)),D.order.totalAmount!==void 0&&localStorage.setItem("varevva_last_total",String(D.order.totalAmount));break}}}catch(O){console.warn(`Order creation attempt ${I} failed:`,O),I<2&&await new Promise(D=>setTimeout(D,1e3))}if(L||(L=`VRV${Math.floor(1001+Math.random()*9e3)}`),localStorage.setItem("varevva_last_order_id",L),localStorage.removeItem("varevva_cart"),Q(),ie(),p==="online")window.location.href=`payment.html?orderId=${L}&t=${Date.now()}`;else{let I=`*🍽️ VAREVYA TELANGANA RUCHULU - NEW ORDER*

`;I+=`*Order ID:* ${L}
`,I+=`*Customer:* ${g}
`,I+=`*Phone:* ${b}
`,I+=`*Option:* ${c}
`,l&&(I+=`*Delivery Address:* ${l}
`);const O=v||(l?l.toLowerCase().includes("yadagirigutta")?l:`${l}, Yadagirigutta, Telangana`:"");if(O){const j=`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(O)}&dir_action=navigate`;I+=`*🗺️ Start Google Maps Navigation:*
${j}
`}I+=`
-------------------------
*Items Ordered:*
`,C.forEach((j,me)=>{I+=`${me+1}. ${j.name} x ${j.quantity} - ₹${j.subtotal}
`}),I+=`-------------------------
`,I+=`*Total Amount:* ₹${S}

`;const D=`${window.location.origin}/verify.html?orderId=${L}`;I+=`*Verify Bill & Live Status:*
${D}

`,I+="Please confirm my order. Thank you!";const ue=`https://wa.me/917382507237?text=${encodeURIComponent(I)}`;try{window.open(ue,"_blank")}catch(j){console.warn("Popup blocked:",j)}window.location.href=`track.html?orderId=${L}`}}catch(g){console.error("Order submission error:",g),alert("An unexpected error occurred while placing your order. Please try again."),s&&(s.disabled=!1,s.innerHTML=i)}})}function Q(){const e=document.querySelector(".order-modal-overlay");e&&e.remove()}function Se(){document.body.addEventListener("click",e=>{const a=e.target.closest(".btn-add-zomato");if(a){const d=a.dataset.name,w=a.dataset.price;we(d,w);return}const t=e.target.closest(".btn-qty-minus");if(t){const d=t.dataset.name;X(d,-1);return}const o=e.target.closest(".btn-qty-plus");if(o){const d=o.dataset.name;X(d,1);return}if(e.target.closest("#btn-cart-whatsapp-order")){de();return}const n=e.target.closest(".btn-admin-stock");if(n){if(n.dataset.id){const d=n.dataset.id;Le(d)}return}const x=e.target.closest(".btn-admin-edit");if(x){if(x.dataset.id){const d=x.dataset.id,w=T.find(f=>f._id===d);w&&w.category==="specials"?Te(d):Ce(d)}return}const m=e.target.closest(".btn-admin-edit-image");if(m){if(m.dataset.id){const d=m.dataset.id,w=T.find(s=>s._id===d)||E.find(s=>s._id===d||s.id===d),f=w&&w.category==="specials";Me(d,f)}return}const y=e.target.closest(".btn-admin-delete");if(y){if(y.dataset.id){const d=y.dataset.id,w=T.find(f=>f._id===d)||E.find(f=>f._id===d||f.id===d);w&&w.category==="specials"?De(d):Ie(d)}return}})}function M(){if(!A)return;if(A.innerHTML="",B){const t=document.createElement("div");t.className="admin-toolbar",t.innerHTML=`
      <div class="admin-toolbar-title">
        <i class="fa-solid fa-user-shield" style="color: var(--primary-color);"></i>
        <span>Owner Portal Active</span>
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="btn-admin-add-item" id="btn-admin-add-dish">
          <i class="fa-solid fa-plus"></i> Add New Dish
        </button>
        <button class="btn-admin-add-item" id="btn-admin-orders-view" style="background-color: #10b981; border-color: #10b981;">
          <i class="fa-solid fa-receipt"></i> Online Payments & Orders
        </button>
        <button class="btn-admin-add-item" id="btn-admin-firebase-settings" style="background-color: #f59e0b; border-color: #f59e0b;">
          <i class="fa-solid fa-database"></i> Database Sync
        </button>
      </div>
    `,A.appendChild(t),t.querySelector("#btn-admin-add-dish").addEventListener("click",Pe),t.querySelector("#btn-admin-orders-view").addEventListener("click",pe),t.querySelector("#btn-admin-firebase-settings").addEventListener("click",ce)}const e=T.filter(t=>{const o=ee==="all"||t.category===ee,r=te==="all"||t.type===te,n=R===""||t.name.toLowerCase().includes(R)||t.description.toLowerCase().includes(R);return o&&r&&n});if(e.length===0&&!B){ke();return}const a=U();e.forEach((t,o)=>{const r=document.createElement("div");r.className=`menu-item-card ${t.outOfStock?"out-of-stock":""}`,r.style.animationDelay=`${o*.02}s`;const n=t.type==="veg",x=n?"veg":"non-veg",m=a[t.name];let y="";t.outOfStock?y=`
        <button class="btn-add-zomato" disabled style="background-color: #9ca3af; border-color: #9ca3af; color: white; cursor: not-allowed;">
          SOLD OUT
        </button>
      `:m?y=`
        <div class="qty-selector-zomato">
          <button class="btn-qty-minus" data-name="${t.name}">-</button>
          <span class="qty-value">${m.quantity}</span>
          <button class="btn-qty-plus" data-name="${t.name}">+</button>
        </div>
      `:y=`
        <button class="btn-add-zomato" data-name="${t.name}" data-price="${t.price}" title="Add ${t.name} to order">
          ADD <i class="fa-solid fa-plus" style="font-size: 0.75rem; margin-left: 2px;"></i>
        </button>
      `;const d=B?`
      <div class="admin-card-controls">
        <button class="btn-admin-stock ${t.outOfStock?"btn-stock-out":"btn-stock-in"}" data-id="${t._id}">
          <i class="fa-solid ${t.outOfStock?"fa-eye":"fa-eye-slash"}"></i>
          <span>${t.outOfStock?"Mark In Stock":"Mark Out of Stock"}</span>
        </button>
        <button class="btn-admin-edit" data-id="${t._id}">
          <i class="fa-solid fa-pen-to-square"></i>
          <span>Edit</span>
        </button>
        <button class="btn-admin-edit-image" data-id="${t._id}">
          <i class="fa-solid fa-image"></i>
          <span>Edit Image</span>
        </button>
        <button class="btn-admin-delete" data-id="${t._id}">
          <i class="fa-solid fa-trash-can"></i>
          <span>Remove</span>
        </button>
      </div>
    `:"";r.innerHTML=`
      <div class="menu-item-main-row">
        <div class="menu-item-text">
          <div class="item-meta-row">
            <span class="diet-badge-fssai ${x}" title="${n?"Vegetarian":"Non-Vegetarian"}">
              <span class="diet-dot"></span>
            </span>
            ${t.popular?'<span class="popular-pill"><i class="fa-solid fa-fire"></i> Highly Reordered</span>':""}
            ${t.outOfStock?'<span class="badge-out-of-stock"><i class="fa-solid fa-circle-xmark"></i> Out of Stock</span>':""}
          </div>
          <a href="/item.html?id=${t.id}" class="item-name-link" style="text-decoration: none; color: inherit;">
            <h3 class="item-name">${t.name}</h3>
          </a>
          <span class="item-price">₹${t.price}</span>
          <p class="item-desc">${t.description||"Delicately cooked using traditional recipes with freshly ground spices."}</p>
          <span class="item-category-tag-desktop">${$e(t.category)}</span>
        </div>
        <div class="menu-item-action-side">
          <div class="menu-item-image-wrapper">
            <a href="/item.html?id=${t.id}" style="display: block; width: 100%; height: 100%;">
              <img class="menu-item-img" src="${xe(t)}" alt="${t.name}" loading="lazy" onerror="this.onerror=null; this.src='${t.type==="veg"?"/assets/paneer_butter_masala.png":"/assets/chicken_dum_biryani.png"}';">
            </a>
            <div class="menu-item-action-button-container">
              ${y}
            </div>
          </div>
          <span class="item-disclaimer-zomato">customisable</span>
        </div>
      </div>
      ${d}
    `,A.appendChild(r)})}function ke(){A&&(A.innerHTML=`
    <div class="menu-empty">
      <i class="fa-solid fa-utensils"></i>
      <h3>No Dishes Found</h3>
      <p>We couldn't find any dishes matching "${R}". Try adjusting your filters or search keywords.</p>
    </div>
  `)}function $e(e){return{biryani:"Biryani Special",starters:"Starters",curries:"Rich Curries","chinese-rice":"Chinese & Rice",rotis:"Rotis & Breads"}[e]||e}function ne(){const e=document.getElementById("btn-admin-login-trigger");e&&(ae(),e.addEventListener("click",()=>{B?confirm("Are you sure you want to log out from the Owner Portal?")&&(B=!1,sessionStorage.removeItem("varevva_admin_logged_in"),ae(),A&&M(),_&&z()):qe()}))}function ae(){const e=document.getElementById("btn-admin-login-trigger");e&&(B?(e.className="btn-admin-portal logged-in",e.innerHTML='<i class="fa-solid fa-right-from-bracket"></i> <span>Owner Logout</span>'):(e.className="btn-admin-portal",e.innerHTML='<i class="fa-solid fa-user-lock"></i> <span>Owner Login</span>'))}function qe(){if(document.querySelector(".admin-login-overlay"))return;const e=document.createElement("div");e.className="order-modal-overlay admin-login-overlay",e.innerHTML=`
    <div class="order-modal-card">
      <div class="order-modal-header">
        <h3>Owner Login</h3>
        <button class="btn-close-modal" id="btn-close-admin-login">&times;</button>
      </div>
      <form class="admin-modal-form" id="admin-login-form">
        <div class="form-group">
          <label for="admin-username">Email Address</label>
          <input type="email" id="admin-username" placeholder="Enter email address" required autocomplete="email">
        </div>
        <div class="form-group">
          <label for="admin-password">Password</label>
          <input type="password" id="admin-password" placeholder="Enter password" required autocomplete="current-password">
        </div>
        <div id="admin-login-error" style="color: #ef4444; font-size: 0.85rem; display: none; text-align: center;">
          <i class="fa-solid fa-circle-exclamation"></i> Invalid email or password!
        </div>
        <button type="submit" class="btn-admin-submit">Login</button>
      </form>
    </div>
  `,document.body.appendChild(e);const a=e.querySelector("#btn-close-admin-login"),t=e.querySelector("#admin-login-form"),o=()=>e.remove();a.addEventListener("click",o),e.addEventListener("click",r=>{r.target===e&&o()}),t.addEventListener("submit",async r=>{r.preventDefault();const n=t.querySelector("#admin-username").value.trim(),x=t.querySelector("#admin-password").value,m=t.querySelector("#admin-login-error");try{const y=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:n,password:x})}),d=await y.json();y.ok?(B=!0,sessionStorage.setItem("varevva_admin_logged_in","true"),sessionStorage.setItem("varevva_admin_token",d.token),ae(),o(),A&&M(),_&&z()):(m.textContent=d.message||"Invalid email or password!",m.style.display="block",t.querySelector("#admin-password").value="",t.querySelector("#admin-password").focus())}catch{m.textContent="Failed to connect to authentication server.",m.style.display="block",t.querySelector("#admin-password").value="",t.querySelector("#admin-password").focus()}})}function Pe(){if(document.querySelector(".admin-add-item-overlay"))return;const e=document.createElement("div");e.className="order-modal-overlay admin-add-item-overlay",e.innerHTML=`
    <div class="order-modal-card">
      <div class="order-modal-header">
        <h3>Add New Dish</h3>
        <button class="btn-close-modal" id="btn-close-admin-add-item">&times;</button>
      </div>
      <form class="admin-modal-form" id="admin-add-item-form">
        <div class="form-group">
          <label for="dish-name">Dish Name</label>
          <input type="text" id="dish-name" placeholder="e.g. Gongura Chicken Fry" required>
          <div id="dish-name-error" style="color: #ef4444; font-size: 0.8rem; display: none; margin-top: 4px;">
            <i class="fa-solid fa-circle-exclamation"></i> A dish with this name already exists!
          </div>
        </div>
        
        <div class="form-row-grid">
          <div class="form-group">
            <label for="dish-price">Price (₹)</label>
            <input type="number" id="dish-price" placeholder="e.g. 250" min="1" required>
          </div>
          <div class="form-group">
            <label for="dish-category">Category</label>
            <select id="dish-category" required>
              <option value="biryani">Biryani Specials</option>
              <option value="starters">Starters</option>
              <option value="curries">Rich Curries</option>
              <option value="chinese-rice">Chinese & Rice</option>
              <option value="rotis">Rotis & Breads</option>
            </select>
          </div>
        </div>

        <div class="form-row-grid">
          <div class="form-group">
            <label for="dish-diet">Diet Type</label>
            <select id="dish-diet" required>
              <option value="non-veg">Non-Vegetarian</option>
              <option value="veg">Vegetarian</option>
            </select>
          </div>
          <div class="form-group checkbox-group" style="margin-top: 24px;">
            <input type="checkbox" id="dish-popular">
            <label for="dish-popular">Highly Reordered</label>
          </div>
        </div>

        <div class="form-group">
          <label>Dish Image</label>
          <input type="file" id="dish-image-file" accept="image/png, image/jpeg, image/webp" style="margin-bottom: 8px;" required>
          <input type="hidden" id="dish-image-url">
          <input type="hidden" id="dish-image-public-id">
          
          <div id="dish-upload-progress-container" style="display: none; margin-bottom: 10px;">
            <div style="font-size: 0.8rem; color: #666; margin-bottom: 4px; display: flex; justify-content: space-between;">
              <span>Uploading image...</span>
              <span id="dish-upload-percent">0%</span>
            </div>
            <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px; overflow: hidden;">
              <div id="dish-upload-progress-bar" style="width: 0%; height: 100%; background-color: var(--primary-color); transition: width 0.1s ease;"></div>
            </div>
          </div>

          <div id="dish-image-preview" style="width: 100%; height: 160px; border: 2px dashed #ccc; border-radius: 8px; display: flex; justify-content: center; align-items: center; overflow: hidden; background-color: #f9fafb;">
            <span style="color: #9ca3af; font-size: 0.9rem;">No image selected (WEBP, PNG, JPG up to 5MB)</span>
          </div>
          <div id="dish-image-type-error" style="color: #ef4444; font-size: 0.8rem; display: none; margin-top: 4px;">
            <i class="fa-solid fa-circle-exclamation"></i> Only JPG, PNG, or WEBP up to 5MB allowed!
          </div>
        </div>

        <div class="form-group">
          <label for="dish-description">Description</label>
          <textarea id="dish-description" placeholder="Brief description of the dish..." rows="3" required></textarea>
        </div>

        <button type="submit" class="btn-admin-submit">Add to Menu</button>
      </form>
    </div>
  `,document.body.appendChild(e);const a=e.querySelector("#btn-close-admin-add-item"),t=e.querySelector("#admin-add-item-form"),o=e.querySelector("#dish-name"),r=e.querySelector("#dish-name-error"),n=e.querySelector("#dish-image-file"),x=e.querySelector("#dish-image-url"),m=e.querySelector("#dish-image-public-id"),y=e.querySelector("#dish-upload-progress-container"),d=e.querySelector("#dish-upload-progress-bar"),w=e.querySelector("#dish-upload-percent"),f=e.querySelector("#dish-image-preview"),s=e.querySelector("#dish-image-type-error"),i=t.querySelector('button[type="submit"]'),g=()=>e.remove();a.addEventListener("click",g),e.addEventListener("click",b=>{b.target===e&&g()}),n.addEventListener("change",b=>{const c=b.target.files[0];if(!c)return;if(!["image/jpeg","image/jpg","image/png","image/webp"].includes(c.type)){s.style.display="block",n.value="";return}if(c.size>5*1024*1024){s.style.display="block",n.value="";return}s.style.display="none";const l=new FileReader;l.onload=u=>{f.innerHTML=`<img src="${u.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`},l.readAsDataURL(c),i.disabled=!0,i.textContent="Uploading Image...",y.style.display="block";const v=new FormData;v.append("image",c);const q=sessionStorage.getItem("varevva_admin_token"),h=new XMLHttpRequest;h.open("POST","/api/upload",!0),h.setRequestHeader("Authorization",`Bearer ${q}`),h.upload.onprogress=u=>{if(u.lengthComputable){const p=Math.round(u.loaded/u.total*100);d.style.width=`${p}%`,w.textContent=`${p}%`}},h.onload=()=>{if(i.disabled=!1,i.textContent="Add to Menu",h.status===200){const u=JSON.parse(h.responseText);x.value=u.image,m.value=u.imagePublicId,w.textContent="Upload complete!"}else alert("Image upload failed. Please try again."),y.style.display="none",f.innerHTML='<span style="color: #ef4444; font-size: 0.9rem;">Upload failed!</span>'},h.onerror=()=>{i.disabled=!1,i.textContent="Add to Menu",alert("Network error occurred during upload."),y.style.display="none"},h.send(v)}),t.addEventListener("submit",async b=>{b.preventDefault();const c=o.value.trim(),$=Number(t.querySelector("#dish-price").value),l=t.querySelector("#dish-category").value,v=t.querySelector("#dish-diet").value,q=t.querySelector("#dish-description").value.trim(),h=t.querySelector("#dish-popular").checked,u=x.value,p=m.value;if(!u||!p){alert("Please select and upload a dish image first!");return}if(T.find(S=>S.name.toLowerCase()===c.toLowerCase())){r.style.display="block",o.focus();return}const P=sessionStorage.getItem("varevva_admin_token");try{const S=await fetch("/api/menu",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${P}`},body:JSON.stringify({name:c,price:$,category:l,subCategory:v,description:q,image:u,imagePublicId:p,availability:!0,featured:h})});if(S.ok)T=await G(),g(),M();else{const C=await S.json();alert(`Failed to save menu item: ${C.message}`)}}catch{alert("Connection error occurred while saving menu item.")}}),o.addEventListener("input",()=>{r.style.display="none"})}async function Le(e){if(!e){console.error("toggleStockStatus error: missing _id"),alert("Operation failed: This item has no valid database ID.");return}const a=T.find(r=>r._id===e);if(!a)return;const t=a.outOfStock,o=sessionStorage.getItem("varevva_admin_token");try{(await fetch(`/api/menu/${e}`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${o}`},body:JSON.stringify({availability:t})})).ok?(T=await G(),M()):(console.error("toggleStockStatus failed: API error response"),alert("Failed to update stock status on database."))}catch(r){console.error("toggleStockStatus network error:",r),alert("Connection error occurred while updating stock status.")}}async function Ie(e){if(!e){console.error("deleteMenuItem error: missing _id"),alert("Operation failed: This item has no valid database ID.");return}const a=T.find(o=>o._id===e);if(!a||!confirm(`Are you sure you want to remove "${a.name}" from the menu?`))return;const t=sessionStorage.getItem("varevva_admin_token");try{(await fetch(`/api/menu/${e}`,{method:"DELETE",headers:{Authorization:`Bearer ${t}`}})).ok?(T=await G(),M()):(console.error("deleteMenuItem failed: API error response"),alert("Failed to delete menu item."))}catch(o){console.error("deleteMenuItem network error:",o),alert("Connection error occurred while deleting item.")}}function Ce(e){if(!e){console.error("openAdminEditItemModal error: missing _id"),alert("Operation failed: This item has no valid database ID.");return}const a=T.find($=>$._id===e);if(!a||document.querySelector(".admin-edit-item-overlay"))return;const t=document.createElement("div");t.className="order-modal-overlay admin-edit-item-overlay",t.innerHTML=`
    <div class="order-modal-card">
      <div class="order-modal-header">
        <h3>Edit Dish: ${a.name}</h3>
        <button class="btn-close-modal" id="btn-close-admin-edit-item">&times;</button>
      </div>
      <form class="admin-modal-form" id="admin-edit-item-form">
        <div class="form-group">
          <label for="dish-name">Dish Name</label>
          <input type="text" id="dish-name" placeholder="e.g. Gongura Chicken Fry" value="${a.name}" required>
          <div id="dish-name-error" style="color: #ef4444; font-size: 0.8rem; display: none; margin-top: 4px;">
            <i class="fa-solid fa-circle-exclamation"></i> A dish with this name already exists!
          </div>
        </div>
        
        <div class="form-row-grid">
          <div class="form-group">
            <label for="dish-price">Price (₹)</label>
            <input type="number" id="dish-price" placeholder="e.g. 250" min="1" value="${a.price}" required>
          </div>
          <div class="form-group">
            <label for="dish-category">Category</label>
            <select id="dish-category" required>
              <option value="biryani" ${a.category==="biryani"?"selected":""}>Biryani Specials</option>
              <option value="starters" ${a.category==="starters"?"selected":""}>Starters</option>
              <option value="curries" ${a.category==="curries"?"selected":""}>Rich Curries</option>
              <option value="chinese-rice" ${a.category==="chinese-rice"?"selected":""}>Chinese & Rice</option>
              <option value="rotis" ${a.category==="rotis"?"selected":""}>Rotis & Breads</option>
            </select>
          </div>
        </div>

        <div class="form-row-grid">
          <div class="form-group">
            <label for="dish-diet">Diet Type</label>
            <select id="dish-diet" required>
              <option value="non-veg" ${a.type==="non-veg"?"selected":""}>Non-Vegetarian</option>
              <option value="veg" ${a.type==="veg"?"selected":""}>Vegetarian</option>
            </select>
          </div>
          <div class="form-group checkbox-group" style="margin-top: 24px;">
            <input type="checkbox" id="dish-popular" ${a.popular?"checked":""}>
            <label for="dish-popular">Highly Reordered</label>
          </div>
        </div>

        <div class="form-group">
          <label>Dish Image</label>
          <input type="file" id="dish-image-file" accept="image/png, image/jpeg, image/webp" style="margin-bottom: 8px;">
          <input type="hidden" id="dish-image-url" value="${a.image||""}">
          <input type="hidden" id="dish-image-public-id" value="${a.imagePublicId||""}">
          
          <div id="dish-upload-progress-container" style="display: none; margin-bottom: 10px;">
            <div style="font-size: 0.8rem; color: #666; margin-bottom: 4px; display: flex; justify-content: space-between;">
              <span>Uploading image...</span>
              <span id="dish-upload-percent">0%</span>
            </div>
            <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px; overflow: hidden;">
              <div id="dish-upload-progress-bar" style="width: 0%; height: 100%; background-color: var(--primary-color); transition: width 0.1s ease;"></div>
            </div>
          </div>

          <div id="dish-image-preview" style="width: 100%; height: 160px; border: 2px dashed #ccc; border-radius: 8px; display: flex; justify-content: center; align-items: center; overflow: hidden; background-color: #f9fafb;">
            ${a.image?`<img src="${a.image}" style="width: 100%; height: 100%; object-fit: cover;">`:'<span style="color: #9ca3af; font-size: 0.9rem;">No image selected (WEBP, PNG, JPG up to 5MB)</span>'}
          </div>
          <div id="dish-image-type-error" style="color: #ef4444; font-size: 0.8rem; display: none; margin-top: 4px;">
            <i class="fa-solid fa-circle-exclamation"></i> Only JPG, PNG, or WEBP up to 5MB allowed!
          </div>
        </div>

        <div class="form-group">
          <label for="dish-description">Description</label>
          <textarea id="dish-description" placeholder="Brief description of the dish..." rows="3" required>${a.description||""}</textarea>
        </div>

        <button type="submit" class="btn-admin-submit">Save Changes</button>
      </form>
    </div>
  `,document.body.appendChild(t);const o=t.querySelector("#btn-close-admin-edit-item"),r=t.querySelector("#admin-edit-item-form"),n=t.querySelector("#dish-name"),x=t.querySelector("#dish-name-error"),m=t.querySelector("#dish-image-file"),y=t.querySelector("#dish-image-url"),d=t.querySelector("#dish-image-public-id"),w=t.querySelector("#dish-upload-progress-container"),f=t.querySelector("#dish-upload-progress-bar"),s=t.querySelector("#dish-upload-percent"),i=t.querySelector("#dish-image-preview"),g=t.querySelector("#dish-image-type-error"),b=r.querySelector('button[type="submit"]'),c=()=>t.remove();o.addEventListener("click",c),t.addEventListener("click",$=>{$.target===t&&c()}),m.addEventListener("change",$=>{const l=$.target.files[0];if(!l)return;if(!["image/jpeg","image/jpg","image/png","image/webp"].includes(l.type)){g.style.display="block",m.value="";return}if(l.size>5*1024*1024){g.style.display="block",m.value="";return}g.style.display="none";const q=new FileReader;q.onload=k=>{i.innerHTML=`<img src="${k.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`},q.readAsDataURL(l),b.disabled=!0,b.textContent="Uploading Image...",w.style.display="block";const h=new FormData;h.append("image",l);const u=sessionStorage.getItem("varevva_admin_token"),p=new XMLHttpRequest;p.open("POST","/api/upload",!0),p.setRequestHeader("Authorization",`Bearer ${u}`),p.upload.onprogress=k=>{if(k.lengthComputable){const P=Math.round(k.loaded/k.total*100);f.style.width=`${P}%`,s.textContent=`${P}%`}},p.onload=()=>{if(b.disabled=!1,b.textContent="Save Changes",p.status===200){const k=JSON.parse(p.responseText);y.value=k.image,d.value=k.imagePublicId,s.textContent="Upload complete!"}else alert("Image upload failed. Please try again."),w.style.display="none",i.innerHTML='<span style="color: #ef4444; font-size: 0.9rem;">Upload failed!</span>'},p.onerror=()=>{b.disabled=!1,b.textContent="Save Changes",alert("Network error occurred during upload."),w.style.display="none"},p.send(h)}),r.addEventListener("submit",async $=>{$.preventDefault();const l=n.value.trim(),v=Number(r.querySelector("#dish-price").value),q=r.querySelector("#dish-category").value,h=r.querySelector("#dish-diet").value,u=r.querySelector("#dish-description").value.trim(),p=r.querySelector("#dish-popular").checked,k=y.value,P=d.value;if(!k){alert("Please upload an image first!");return}if(T.find(L=>L.name.toLowerCase()===l.toLowerCase()&&L._id!==e)){x.style.display="block",n.focus();return}const C=sessionStorage.getItem("varevva_admin_token");try{const L=await fetch(`/api/menu/${e}`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${C}`},body:JSON.stringify({name:l,price:v,category:q,subCategory:h,description:u,image:k,imagePublicId:P,availability:!a.outOfStock,featured:p})});if(L.ok)T=await G(),c(),M();else{const N=await L.json();alert(`Failed to save menu changes: ${N.message}`)}}catch{alert("Connection error occurred while saving changes.")}}),n.addEventListener("input",()=>{x.style.display="none"})}function z(){if(_){if(_.innerHTML="",B){const e=document.createElement("div");e.className="admin-toolbar",e.innerHTML=`
      <div class="admin-toolbar-title">
        <i class="fa-solid fa-user-shield" style="color: var(--primary-color);"></i>
        <span>Owner Portal Active</span>
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="btn-admin-add-item" id="btn-admin-add-special-trigger">
          <i class="fa-solid fa-plus"></i> Add New Special
        </button>
        <button class="btn-admin-add-item" id="btn-admin-orders-view-specials" style="background-color: #10b981; border-color: #10b981;">
          <i class="fa-solid fa-receipt"></i> Online Payments & Orders
        </button>
        <button class="btn-admin-add-item" id="btn-admin-firebase-settings-special" style="background-color: #f59e0b; border-color: #f59e0b;">
          <i class="fa-solid fa-database"></i> Database Sync
        </button>
      </div>
    `,_.appendChild(e),e.querySelector("#btn-admin-add-special-trigger").addEventListener("click",Ee),e.querySelector("#btn-admin-orders-view-specials").addEventListener("click",pe),e.querySelector("#btn-admin-firebase-settings-special").addEventListener("click",ce)}E.forEach(e=>{const a=document.createElement("div");a.className=`special-card card-${e.type}`;const t=B?`
      <div class="special-card-admin-actions" style="margin-top: 15px; border-top: 1px dashed rgba(0, 0, 0, 0.08); padding-top: 15px; display: flex; flex-wrap: wrap; gap: 12px; width: 100%;">
        <button class="btn-admin-edit" data-id="${e.id}" style="flex: 1; min-width: 70px;">
          <i class="fa-solid fa-pen-to-square"></i> Edit
        </button>
        <button class="btn-admin-edit-image" data-id="${e.id}" style="flex: 1; min-width: 100px;">
          <i class="fa-solid fa-image"></i> Image
        </button>
        <button class="btn-admin-delete" data-id="${e.id}">
          <i class="fa-solid fa-trash-can"></i> Remove
        </button>
      </div>
    `:"",o=e.type==="veg"?"veg":"nonveg",r=e.type==="veg"?"Veg":"Non-Veg";a.innerHTML=`
      <div class="special-img-wrapper" style="position: relative; overflow: hidden; height: 230px;">
        <a href="/item.html?id=${e.id}" style="display: block; width: 100%; height: 100%;">
          <img src="${e.image||"/assets/chicken_dum_biryani.png"}" alt="${e.name}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; transition: var(--transition-smooth);" onerror="this.onerror=null; this.src='${e.type==="veg"?"/assets/paneer_butter_masala.png":"/assets/chicken_dum_biryani.png"}';">
        </a>
        <span class="diet-badge ${o}"><span class="dot"></span>${r}</span>
      </div>
      <div class="special-body" style="padding: 24px;">
        <div class="special-meta" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span class="special-price" style="margin-bottom: 0;">${e.price}</span>
        </div>
        <a href="/item.html?id=${e.id}" class="special-name-link" style="text-decoration: none; color: inherit;">
          <h3 style="margin-top: 0; font-size: 1.3rem; transition: var(--transition-smooth);">${e.name}</h3>
        </a>
        <p style="margin-bottom: 20px;">${e.description}</p>
        <div class="special-footer">
          <span class="special-tag"><i class="fa-solid ${e.tagIcon||"fa-fire"}"></i> ${e.tag}</span>
          <a href="https://wa.me/917382507237?text=Hi%20Varevva%20Restaurant,%20I%20would%20like%20to%20order%20${encodeURIComponent(e.name)}" target="_blank" class="btn-icon-order" title="Order via WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
        </div>
        ${t}
      </div>
    `,_.appendChild(a)})}}function Te(e){const a=E.find(x=>x.id===e);if(!a||document.querySelector(".admin-edit-special-overlay"))return;const t=document.createElement("div");t.className="order-modal-overlay admin-edit-special-overlay",t.innerHTML=`
    <div class="order-modal-card">
      <div class="order-modal-header">
        <h3>Edit Special: ${a.name}</h3>
        <button class="btn-close-modal" id="btn-close-admin-edit-special">&times;</button>
      </div>
      <form class="admin-modal-form" id="admin-edit-special-form">
        <div class="form-group">
          <label for="special-name">Special Name</label>
          <input type="text" id="special-name" placeholder="e.g. Special Chicken Dum Biryani" value="${a.name}" required>
        </div>
        
        <div class="form-row-grid">
          <div class="form-group">
            <label for="special-price">Price Display (e.g. ₹200 / ₹350)</label>
            <input type="text" id="special-price" placeholder="e.g. ₹200 / ₹350" value="${a.price}" required>
          </div>
          <div class="form-group">
            <label for="special-diet">Diet Type</label>
            <select id="special-diet" required>
              <option value="non-veg" ${a.type==="non-veg"?"selected":""}>Non-Vegetarian</option>
              <option value="veg" ${a.type==="veg"?"selected":""}>Vegetarian</option>
            </select>
          </div>
        </div>

        <div class="form-row-grid">
          <div class="form-group">
            <label for="special-tag-text">Badge Tag Text</label>
            <input type="text" id="special-tag-text" placeholder="e.g. Best Seller" value="${a.tag}" required>
          </div>
          <div class="form-group">
            <label for="special-tag-icon">Badge Icon</label>
            <select id="special-tag-icon" required>
              <option value="fa-fire" ${a.tagIcon==="fa-fire"?"selected":""}>Fire</option>
              <option value="fa-pepper-hot" ${a.tagIcon==="fa-pepper-hot"?"selected":""}>Pepper</option>
              <option value="fa-leaf" ${a.tagIcon==="fa-leaf"?"selected":""}>Leaf</option>
              <option value="fa-star" ${a.tagIcon==="fa-star"?"selected":""}>Star</option>
              <option value="fa-thumbs-up" ${a.tagIcon==="fa-thumbs-up"?"selected":""}>Thumbs Up</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="special-image">Special Image URL / Path (Optional)</label>
          <input type="text" id="special-image" placeholder="e.g. /assets/chicken_dum_biryani.png or any online URL" value="${a.image||""}">
        </div>

        <div class="form-group">
          <label for="special-description">Description</label>
          <textarea id="special-description" placeholder="Aromatic description..." rows="3" required>${a.description||""}</textarea>
        </div>

        <button type="submit" class="btn-admin-submit">Save Special Changes</button>
      </form>
    </div>
  `,document.body.appendChild(t);const o=t.querySelector("#btn-close-admin-edit-special"),r=t.querySelector("#admin-edit-special-form"),n=()=>t.remove();o.addEventListener("click",n),t.addEventListener("click",x=>{x.target===t&&n()}),r.addEventListener("submit",x=>{x.preventDefault(),a.name=r.querySelector("#special-name").value.trim(),a.price=r.querySelector("#special-price").value.trim(),a.type=r.querySelector("#special-diet").value,a.tag=r.querySelector("#special-tag-text").value.trim(),a.tagIcon=r.querySelector("#special-tag-icon").value,a.image=r.querySelector("#special-image").value.trim(),a.description=r.querySelector("#special-description").value.trim(),ge(E),n(),z()})}function Me(e,a){if(console.log("openAdminEditImageModal: selected id =",e),console.log("openAdminEditImageModal: isSpecial =",a),console.log("openAdminEditImageModal: currentMenu =",T),console.log("openAdminEditImageModal: currentSpecials =",E),!e){console.error("openAdminEditImageModal error: missing _id"),alert("Operation failed: This item has no valid database ID.");return}const t=a?E.find(b=>b._id===e||b.id===e):T.find(b=>b._id===e);if(console.log("openAdminEditImageModal: matched item =",t),!t){console.error("openAdminEditImageModal error: item not found for id",e),alert("Operation failed: Item not found in current list.");return}if(document.querySelector(".admin-edit-image-overlay"))return;const o=se(t.image,t.type),r=t.type==="veg"?"/assets/paneer_butter_masala.png":"/assets/chicken_dum_biryani.png",n=document.createElement("div");n.className="order-modal-overlay admin-edit-image-overlay",n.innerHTML=`
    <div class="order-modal-card" style="max-width: 520px;">
      <div class="order-modal-header">
        <h3>Edit Image: ${t.name}</h3>
        <button class="btn-close-modal" id="btn-close-admin-edit-image">&times;</button>
      </div>
      <form class="admin-modal-form" id="admin-edit-image-form">
        <div class="form-group">
          <label>Select Image File</label>
          <input type="file" id="edit-image-file" accept="image/png, image/jpeg, image/webp" style="margin-bottom: 8px;" required>
          
          <div id="edit-upload-progress-container" style="display: none; margin-bottom: 10px;">
            <div style="font-size: 0.8rem; color: #666; margin-bottom: 4px; display: flex; justify-content: space-between;">
              <span id="edit-upload-status-text">Uploading image...</span>
              <span id="edit-upload-percent">0%</span>
            </div>
            <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px; overflow: hidden;">
              <div id="edit-upload-progress-bar" style="width: 0%; height: 100%; background-color: var(--primary-color); transition: width 0.1s ease;"></div>
            </div>
          </div>

          <div id="edit-image-type-error" style="color: #ef4444; font-size: 0.8rem; display: none; margin-top: 4px;">
            <i class="fa-solid fa-circle-exclamation"></i> Only JPG, PNG, or WEBP up to 5MB allowed!
          </div>
        </div>

        <div class="image-preview-box" style="margin-bottom: 20px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 12px; text-align: center;">
          <div style="font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
            <i class="fa-solid fa-eye"></i> Current Image Preview
          </div>
          <div id="edit-image-preview-div" style="width: 100%; height: 180px; border-radius: 8px; overflow: hidden; background: #e2e8f0; position: relative; display: flex; justify-content: center; align-items: center;">
            <img id="edit-image-preview-img" src="${o}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; object-position: center; display: block;" onerror="this.onerror=null; this.src='${r}';">
          </div>
        </div>
      </form>
    </div>
  `,document.body.appendChild(n);const x=n.querySelector("#btn-close-admin-edit-image");n.querySelector("#admin-edit-image-form");const m=n.querySelector("#edit-image-file"),y=n.querySelector("#edit-upload-progress-container"),d=n.querySelector("#edit-upload-progress-bar"),w=n.querySelector("#edit-upload-percent"),f=n.querySelector("#edit-upload-status-text"),s=n.querySelector("#edit-image-preview-div"),i=n.querySelector("#edit-image-type-error"),g=()=>n.remove();x.addEventListener("click",g),n.addEventListener("click",b=>{b.target===n&&g()}),m.addEventListener("change",b=>{const c=b.target.files[0];if(!c)return;if(console.log("--- FRONTEND IMAGE UPLOAD PIPELINE STARTED ---"),console.log("Selected file properties:",{name:c.name,type:c.type,size:`${(c.size/1024/1024).toFixed(2)} MB`}),!["image/jpeg","image/jpg","image/png","image/webp"].includes(c.type)){console.warn("Validation failed: invalid file format",c.type),i.style.display="block",m.value="";return}if(c.size>5*1024*1024){console.warn("Validation failed: file size exceeds 5MB limit",c.size),i.style.display="block",m.value="";return}i.style.display="none";const l=new FileReader;l.onload=p=>{s.innerHTML=`<img id="edit-image-preview-img" src="${p.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`},l.readAsDataURL(c),m.disabled=!0,y.style.display="block",f.textContent="Uploading to Cloudinary...";const v=new FormData;v.append("image",c),console.log('FormData constructed with key "image"');const q=sessionStorage.getItem("varevva_admin_token");console.log("Authorization Token:",q?`Bearer ${q.substring(0,20)}...`:"MISSING");const h="/api/upload";console.log("Initiating POST request to:",h);const u=new XMLHttpRequest;u.open("POST",h,!0),u.setRequestHeader("Authorization",`Bearer ${q}`),console.log('Request Header "Authorization" set to Bearer token'),u.upload.onprogress=p=>{if(p.lengthComputable){const k=Math.round(p.loaded/p.total*100);console.log(`Upload progress: ${k}% (${p.loaded}/${p.total} bytes)`),d.style.width=`${k}%`,w.textContent=`${k}%`}},u.onload=async()=>{if(console.log("POST /api/upload finished. HTTP Status:",u.status),console.log("Response content:",u.responseText),u.status===200)try{const p=JSON.parse(u.responseText),k=p.image,P=p.imagePublicId;if(console.log("Upload success. Parsed values:",{secure_url:k,public_id:P}),!k||!P){console.error("Cloudinary response verification failed: secure_url or public_id missing"),alert("Cloudinary upload failed: secure_url or public_id missing in response."),m.disabled=!1,y.style.display="none";return}f.textContent="Updating MongoDB...",w.textContent="Saving...",console.log("Initiating PUT request to update MongoDB for item:",e),console.log("PUT URL:",`/api/menu/${e}`);const S=await fetch(`/api/menu/${e}`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${q}`},body:JSON.stringify({image:k,imagePublicId:P})});if(console.log("PUT response status:",S.status),S.ok)console.log("MongoDB update succeeded. Reloading data..."),f.textContent="Saved successfully!",w.textContent="100%",a?(E=await K(),z()):(T=await G(),M()),setTimeout(()=>{g()},800);else{const C=await S.json(),L=C.message||"Unknown database error";console.error("MongoDB PUT update failed:",C),alert(`MongoDB database update failed: ${L}`),m.disabled=!1,y.style.display="none"}}catch(p){console.error("Error processing success payload:",p),alert(`Failed to save: ${p.message}`),m.disabled=!1,y.style.display="none"}else{let p="Unknown error";try{p=JSON.parse(u.responseText).message||p}catch{p=u.responseText||p}console.error("Image upload endpoint returned error status:",u.status,p),alert(`Image upload failed: ${p}`),m.disabled=!1,y.style.display="none",s.innerHTML=`<span style="color: #ef4444; font-size: 0.9rem;">Upload failed: ${p}</span>`}},u.onerror=p=>{console.error("XMLHttpRequest network error:",p),alert("Network error occurred during image upload."),m.disabled=!1,y.style.display="none"},u.send(v)})}function Ee(){if(document.querySelector(".admin-add-special-overlay"))return;const e=document.createElement("div");e.className="order-modal-overlay admin-add-special-overlay",e.innerHTML=`
    <div class="order-modal-card">
      <div class="order-modal-header">
        <h3>Add New Special</h3>
        <button class="btn-close-modal" id="btn-close-admin-add-special">&times;</button>
      </div>
      <form class="admin-modal-form" id="admin-add-special-form">
        <div class="form-group">
          <label for="special-name">Special Name</label>
          <input type="text" id="special-name" placeholder="e.g. Special Chicken Dum Biryani" required>
          <div id="special-name-error" style="color: #ef4444; font-size: 0.8rem; display: none; margin-top: 4px;">
            <i class="fa-solid fa-circle-exclamation"></i> A special with this name already exists!
          </div>
        </div>
        
        <div class="form-row-grid">
          <div class="form-group">
            <label for="special-price">Price Display (e.g. ₹200 / ₹350)</label>
            <input type="text" id="special-price" placeholder="e.g. ₹200 / ₹350" required>
          </div>
          <div class="form-group">
            <label for="special-diet">Diet Type</label>
            <select id="special-diet" required>
              <option value="non-veg">Non-Vegetarian</option>
              <option value="veg">Vegetarian</option>
            </select>
          </div>
        </div>

        <div class="form-row-grid">
          <div class="form-group">
            <label for="special-tag-text">Badge Tag Text</label>
            <input type="text" id="special-tag-text" placeholder="e.g. Best Seller" required>
          </div>
          <div class="form-group">
            <label for="special-tag-icon">Badge Icon</label>
            <select id="special-tag-icon" required>
              <option value="fa-fire">Fire</option>
              <option value="fa-pepper-hot">Pepper</option>
              <option value="fa-leaf">Leaf</option>
              <option value="fa-star">Star</option>
              <option value="fa-thumbs-up">Thumbs Up</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Special Image</label>
          <input type="file" id="special-image-file" accept="image/png, image/jpeg, image/webp" style="margin-bottom: 8px;" required>
          <input type="hidden" id="special-image-url">
          <input type="hidden" id="special-image-public-id">
          
          <div id="special-upload-progress-container" style="display: none; margin-bottom: 10px;">
            <div style="font-size: 0.8rem; color: #666; margin-bottom: 4px; display: flex; justify-content: space-between;">
              <span>Uploading image...</span>
              <span id="special-upload-percent">0%</span>
            </div>
            <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px; overflow: hidden;">
              <div id="special-upload-progress-bar" style="width: 0%; height: 100%; background-color: var(--primary-color); transition: width 0.1s ease;"></div>
            </div>
          </div>

          <div id="special-image-preview" style="width: 100%; height: 160px; border: 2px dashed #ccc; border-radius: 8px; display: flex; justify-content: center; align-items: center; overflow: hidden; background-color: #f9fafb;">
            <span style="color: #9ca3af; font-size: 0.9rem;">No image selected (WEBP, PNG, JPG up to 5MB)</span>
          </div>
          <div id="special-image-type-error" style="color: #ef4444; font-size: 0.8rem; display: none; margin-top: 4px;">
            <i class="fa-solid fa-circle-exclamation"></i> Only JPG, PNG, or WEBP up to 5MB allowed!
          </div>
        </div>

        <div class="form-group">
          <label for="special-description">Description</label>
          <textarea id="special-description" placeholder="Aromatic description..." rows="3" required></textarea>
        </div>

        <button type="submit" class="btn-admin-submit">Add Special</button>
      </form>
    </div>
  `,document.body.appendChild(e);const a=e.querySelector("#btn-close-admin-add-special"),t=e.querySelector("#admin-add-special-form"),o=e.querySelector("#special-name"),r=e.querySelector("#special-name-error"),n=e.querySelector("#special-image-file"),x=e.querySelector("#special-image-url"),m=e.querySelector("#special-image-public-id"),y=e.querySelector("#special-upload-progress-container"),d=e.querySelector("#special-upload-progress-bar"),w=e.querySelector("#special-upload-percent"),f=e.querySelector("#special-image-preview"),s=e.querySelector("#special-image-type-error"),i=t.querySelector('button[type="submit"]'),g=()=>e.remove();a.addEventListener("click",g),e.addEventListener("click",b=>{b.target===e&&g()}),n.addEventListener("change",b=>{const c=b.target.files[0];if(!c)return;if(!["image/jpeg","image/jpg","image/png","image/webp"].includes(c.type)){s.style.display="block",n.value="";return}if(c.size>5*1024*1024){s.style.display="block",n.value="";return}s.style.display="none";const l=new FileReader;l.onload=u=>{f.innerHTML=`<img src="${u.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`},l.readAsDataURL(c),i.disabled=!0,i.textContent="Uploading Image...",y.style.display="block";const v=new FormData;v.append("image",c);const q=sessionStorage.getItem("varevva_admin_token"),h=new XMLHttpRequest;h.open("POST","/api/upload",!0),h.setRequestHeader("Authorization",`Bearer ${q}`),h.upload.onprogress=u=>{if(u.lengthComputable){const p=Math.round(u.loaded/u.total*100);d.style.width=`${p}%`,w.textContent=`${p}%`}},h.onload=()=>{if(i.disabled=!1,i.textContent="Add Special",h.status===200){const u=JSON.parse(h.responseText);x.value=u.image,m.value=u.imagePublicId,w.textContent="Upload complete!"}else alert("Image upload failed. Please try again."),y.style.display="none",f.innerHTML='<span style="color: #ef4444; font-size: 0.9rem;">Upload failed!</span>'},h.onerror=()=>{i.disabled=!1,i.textContent="Add Special",alert("Network error occurred during upload."),y.style.display="none"},h.send(v)}),t.addEventListener("submit",async b=>{b.preventDefault();const c=o.value.trim(),$=t.querySelector("#special-price").value.trim(),l=t.querySelector("#special-diet").value,v=t.querySelector("#special-tag-text").value.trim(),q=t.querySelector("#special-tag-icon").value,h=x.value,u=m.value,p=t.querySelector("#special-description").value.trim();if(!h||!u){alert("Please select and upload a special image first!");return}if(E.find(S=>S.name.toLowerCase()===c.toLowerCase())){r.style.display="block",o.focus();return}const P=sessionStorage.getItem("varevva_admin_token");try{const S=await fetch("/api/menu",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${P}`},body:JSON.stringify({name:c,price:0,category:"specials",subCategory:l,description:p,image:h,imagePublicId:u,availability:!0,featured:!0,customPriceDisplay:$,tagText:v,tagIcon:q})});if(S.ok)E=await K(),g(),z();else{const C=await S.json();alert(`Failed to save special: ${C.message}`)}}catch{alert("Connection error occurred while saving special.")}}),o.addEventListener("input",()=>{r.style.display="none"})}async function De(e){const a=E.find(o=>o.id===e);if(!a||!confirm(`Are you sure you want to remove "${a.name}" from specials recommendations?`))return;const t=sessionStorage.getItem("varevva_admin_token");try{(await fetch(`/api/menu/${a._id}`,{method:"DELETE",headers:{Authorization:`Bearer ${t}`}})).ok?(E=await K(),z()):alert("Failed to delete special item.")}catch{alert("Connection error occurred while deleting special item.")}}function Ae(e,a,t,o){const n=Y(t-e),x=Y(o-a),m=Math.sin(n/2)*Math.sin(n/2)+Math.cos(Y(e))*Math.cos(Y(t))*Math.sin(x/2)*Math.sin(x/2);return 6371*(2*Math.atan2(Math.sqrt(m),Math.sqrt(1-m)))}function Y(e){return e*(Math.PI/180)}async function ce(){if(document.querySelector(".admin-firebase-config-overlay"))return;let e={apiKey:"",databaseURL:"",projectId:""};try{const n=await fetch("/firebase-config.json");n.ok&&(e=await n.json())}catch{console.log("No existing firebase configuration found.")}const a=document.createElement("div");a.className="order-modal-overlay admin-firebase-config-overlay",a.innerHTML=`
    <div class="order-modal-card" style="max-width: 500px;">
      <div class="order-modal-header">
        <h3>Database Sync Configuration</h3>
        <button class="btn-close-modal" id="btn-close-admin-firebase-config">&times;</button>
      </div>
      <form class="admin-modal-form" id="admin-firebase-config-form">
        <div class="form-group">
          <label for="fb-api-key">Firebase Web API Key</label>
          <input type="text" id="fb-api-key" placeholder="AIzaSy..." value="${e.apiKey||""}" required>
        </div>
        <div class="form-group">
          <label for="fb-db-url">Firebase Database URL</label>
          <input type="url" id="fb-db-url" placeholder="https://your-db.firebaseio.com" value="${e.databaseURL||""}" required>
        </div>
        <div class="form-group">
          <label for="fb-project-id">Firebase Project ID</label>
          <input type="text" id="fb-project-id" placeholder="varevva-family-restaurant" value="${e.projectId||""}" required>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin: 8px 0 16px; line-height: 1.4;">
          <i class="fa-solid fa-circle-info"></i> Connecting to Firebase Realtime Database allows changes made on one device to sync to all customers' browsers and all devices instantly!
        </p>
        <button type="submit" class="btn-admin-submit" style="background-color: #f59e0b;">Link Database</button>
      </form>
    </div>
  `,document.body.appendChild(a);const t=a.querySelector("#btn-close-admin-firebase-config"),o=a.querySelector("#admin-firebase-config-form"),r=()=>a.remove();t.addEventListener("click",r),a.addEventListener("click",n=>{n.target===a&&r()}),o.addEventListener("submit",async n=>{n.preventDefault();const x=o.querySelector("#fb-api-key").value.trim(),m=o.querySelector("#fb-db-url").value.trim(),y=o.querySelector("#fb-project-id").value.trim(),d={apiKey:x,databaseURL:m,projectId:y};if(window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1")try{const w=await fetch("/api/save-firebase-config",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({config:d})});if(w.ok)alert(`Firebase Database Configuration saved successfully!

To apply this sync to the live website, please build and deploy using anti-gravity command (e.g. vercel deploy).`),r(),window.location.reload();else{const f=await w.json();alert(`Failed to save: ${f.message}`)}}catch(w){alert(`API Error: ${w.message}`)}else alert(`WARNING: You are currently on the live site.

To save database settings permanently, please run the website locally on your laptop (localhost), open the owner portal, click "Database Sync" to link the database, and redeploy to Vercel.`),r()})}async function pe(){if(document.querySelector(".admin-orders-overlay"))return;const e=document.createElement("div");e.className="order-modal-overlay admin-orders-overlay",e.innerHTML=`
    <div class="order-modal-card admin-orders-card" style="max-width: 1180px; width: 95%;">
      <div class="order-modal-header" style="border-bottom: 1px solid rgba(0,0,0,0.08); padding-bottom: 14px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-receipt" style="color: var(--accent-color); font-size: 1.4rem;"></i>
          <h3 style="margin: 0; font-size: 1.25rem; font-family: var(--font-header);">Orders & Payment Dashboard</h3>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 0.76rem; font-weight: 700; color: #059669; background: #ecfdf5; padding: 4px 10px; border-radius: 12px; border: 1px solid #10b98140;">
            <i class="fa-solid fa-circle fa-beat" style="font-size: 0.6rem; color: #10b981;"></i> Live Auto Sync Active
          </span>
          <button class="btn-close-modal" id="btn-close-admin-orders">&times;</button>
        </div>
      </div>

      <!-- Top Search & Filter Toolbar -->
      <div style="display: flex; gap: 12px; margin: 16px 0; flex-wrap: wrap; justify-content: space-between; align-items: center;">
        
        <!-- Filter Tabs -->
        <div class="admin-orders-tabs" style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button class="admin-tab-btn active" data-filter="all">All Orders</button>
          <button class="admin-tab-btn" data-filter="Pending">Pending</button>
          <button class="admin-tab-btn" data-filter="UPI QR Payment">UPI Payments</button>
          <button class="admin-tab-btn" data-filter="Cash on Delivery">Cash on Delivery</button>
          <button class="admin-tab-btn" data-filter="Preparing Food">Preparing</button>
          <button class="admin-tab-btn" data-filter="Ready for Pickup">Ready for Pickup</button>
          <button class="admin-tab-btn" data-filter="Completed">Completed</button>
        </div>

        <!-- Live Search Box -->
        <div style="position: relative; width: 280px; max-width: 100%;">
          <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 0.85rem;"></i>
          <input type="text" id="admin-orders-search" placeholder="Search Order ID, Name, Mobile, UTR..." style="width: 100%; padding: 8px 12px 8px 34px; border-radius: 20px; border: 1.5px solid rgba(0,0,0,0.12); font-size: 0.82rem;">
        </div>
      </div>

      <!-- Table Container -->
      <div id="admin-orders-table-wrapper" style="max-height: 65vh; overflow-y: auto; overflow-x: auto; border: 1px solid rgba(0,0,0,0.08); border-radius: 12px;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.82rem;">
          <thead style="background: var(--light-bg); border-bottom: 2px solid rgba(0,0,0,0.08); position: sticky; top: 0; z-index: 5;">
            <tr>
              <th style="padding: 12px; font-weight: 700;">Order ID</th>
              <th style="padding: 12px; font-weight: 700;">Customer</th>
              <th style="padding: 12px; font-weight: 700;">Mobile</th>
              <th style="padding: 12px; font-weight: 700;">Type / Address</th>
              <th style="padding: 12px; font-weight: 700;">Items</th>
              <th style="padding: 12px; font-weight: 700;">Amount</th>
              <th style="padding: 12px; font-weight: 700;">Payment Method</th>
              <th style="padding: 12px; font-weight: 700;">Screenshot</th>
              <th style="padding: 12px; font-weight: 700;">Analysis Result</th>
              <th style="padding: 12px; font-weight: 700;">Risk Level</th>
              <th style="padding: 12px; font-weight: 700;">Submission Time</th>
              <th style="padding: 12px; font-weight: 700;">Token</th>
              <th style="padding: 12px; font-weight: 700;">Status</th>
              <th style="padding: 12px; font-weight: 700; text-align: center;">Actions</th>
            </tr>
          </thead>
          <tbody id="admin-orders-table-body">
            <tr>
              <td colspan="13" style="text-align: center; padding: 40px; color: var(--text-muted);">
                <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem; margin-bottom: 8px;"></i>
                <p style="margin: 0;">Loading payment records...</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,document.body.appendChild(e);const a=e.querySelector("#btn-close-admin-orders"),t=e.querySelector("#admin-orders-table-body"),o=e.querySelector("#admin-orders-search"),r=e.querySelectorAll(".admin-tab-btn");let n=null;const x=()=>{n&&clearInterval(n),e.remove()};a.addEventListener("click",x),e.addEventListener("click",s=>{s.target===e&&x()});let m=[],y="all",d="";const w=()=>{let s=m;if(y==="UPI QR Payment"?s=s.filter(i=>i.paymentMethod==="UPI QR Payment"):y==="Cash on Delivery"?s=s.filter(i=>i.paymentMethod==="Cash on Delivery"):y!=="all"&&(s=s.filter(i=>i.orderStage===y||i.paymentStatus===y)),d.trim()){const i=d.toLowerCase().trim();s=s.filter(g=>g.orderId&&g.orderId.toLowerCase().includes(i)||g.customerName&&g.customerName.toLowerCase().includes(i)||g.customerPhone&&g.customerPhone.includes(i)||g.utrNumber&&g.utrNumber.toLowerCase().includes(i))}if(s.length===0){t.innerHTML=`
        <tr>
          <td colspan="13" style="text-align: center; padding: 40px; color: var(--text-muted);">
            <i class="fa-solid fa-folder-open" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.5;"></i>
            <p style="margin: 0; font-weight: 600;">No orders found matching this filter.</p>
          </td>
        </tr>
      `;return}t.innerHTML=s.map(i=>{const g=(i.items||[]).map(S=>{let C=S.name||S.title||"Meal Item";return/^[a-f0-9]{24}$/i.test(C.trim())&&(C=S.title||"Special Dish"),`${C} (${S.quantity||1})`}).join(", "),b=new Date(i.updatedAt||i.createdAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})+", "+new Date(i.updatedAt||i.createdAt).toLocaleDateString();i.paymentStatus;const $=!!i.paymentScreenshot?`<a href="${i.paymentScreenshot}" target="_blank" style="color: var(--accent-color); font-weight: 700; text-decoration: underline;"><i class="fa-solid fa-image"></i> View Proof</a>`:'<span style="color:#94a3b8">None</span>',l=i.analysisResult||(i.paymentMethod==="Cash on Delivery"?"COD":"-"),v=l.includes("✓")||l==="COD"?`<span style="color: #059669; font-weight: 700;">${l}</span>`:l.includes("✕")?`<span style="color: #dc2626; font-weight: 700;">${l}</span>`:`<span style="color: #d97706; font-weight: 700;">${l}</span>`,q=i.riskLevel||(i.paymentMethod==="Cash on Delivery"?"-":"Low");let h="background-color: #ecfdf5; color: #059669; border: 1px solid rgba(16, 185, 129, 0.2);";q==="Medium"?h="background-color: #fffbeb; color: #d97706; border: 1px solid rgba(245, 158, 11, 0.2);":q==="High"&&(h="background-color: #fef2f2; color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.2);");const u=i.paymentMethod==="Cash on Delivery"?'<span style="color:#94a3b8">-</span>':`<span style="${h} padding: 2px 6px; border-radius: 4px; font-size: 0.72rem; font-weight: 700;">${q} Risk</span>`,p=i.orderStatus==="CANCELLED"||(i.auditLogs||[]).some(S=>S.action==="PAYMENT_REJECTED");let k="";p?k=`
          <span style="background-color: #fef2f2; color: #dc2626; border: 1px solid #ef444440; padding: 3px 8px; border-radius: 12px; font-size: 0.74rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
            <i class="fa-solid fa-ban"></i> Cancelled
          </span>
        `:i.paymentStatus==="Pending"?k=`
          <span style="background-color: #fffbeb; color: #d97706; border: 1px solid #f59e0b40; padding: 3px 8px; border-radius: 12px; font-size: 0.74rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
            <i class="fa-solid fa-clock"></i> Pending Payment
          </span>
        `:i.paymentStatus==="Proof Submitted"?k=`
          <span style="background-color: #eff6ff; color: #2563eb; border: 1px solid #3b82f640; padding: 3px 8px; border-radius: 12px; font-size: 0.74rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
            <i class="fa-solid fa-receipt"></i> Proof Submitted
          </span>
        `:i.paymentMethod==="Cash on Delivery"?k=`
          <span style="background-color: #f8fafc; color: #334155; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 12px; font-size: 0.74rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
            <i class="fa-solid fa-money-bill-wave"></i> COD Confirmed
          </span>
        `:k=`
          <span style="background-color: #ecfdf5; color: #059669; border: 1px solid #10b98140; padding: 3px 8px; border-radius: 12px; font-size: 0.74rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
            <i class="fa-solid fa-circle-check"></i> ${i.paymentStatus||"Order Confirmed"}
          </span>
        `;let P='<span style="color:#94a3b8">-</span>';return p?P='<span style="color: #ef4444; font-weight: 700; font-size: 0.76rem; display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-ban"></i> Cancelled</span>':i.paymentMethod==="UPI QR Payment"&&(i.paymentStatus==="Proof Submitted"||i.paymentStatus==="Pending")?P=`
          <div style="display: flex; gap: 6px; justify-content: center; align-items: center;">
            <button class="btn-admin-approve-payment" data-id="${i.orderId}" style="background: #10b981; color: white; border: none; padding: 5px 10px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 0.74rem; transition: 0.2s; white-space: nowrap; display: inline-flex; align-items: center; gap: 4px;" title="Approve payment & confirm order">
              <i class="fa-solid fa-check"></i> Approve
            </button>
            <button class="btn-admin-reject-payment" data-id="${i.orderId}" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 0.74rem; transition: 0.2s; white-space: nowrap; display: inline-flex; align-items: center; gap: 4px;" title="Reject or cancel order">
              <i class="fa-solid fa-xmark"></i> Reject
            </button>
          </div>
        `:i.orderStage==="Order Confirmed"?P=`
          <button class="btn-admin-update-stage" data-id="${i.orderId}" data-stage="Preparing Food" style="background: #f59e0b; color: white; border: none; padding: 5px 10px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 0.74rem; transition: 0.2s; white-space: nowrap; display: inline-flex; align-items: center; gap: 4px;">
            <i class="fa-solid fa-fire-burner"></i> Start Cooking
          </button>
        `:i.orderStage==="Preparing Food"?P=`
          <button class="btn-admin-update-stage" data-id="${i.orderId}" data-stage="Ready for Pickup" style="background: #3b82f6; color: white; border: none; padding: 5px 10px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 0.74rem; transition: 0.2s; white-space: nowrap; display: inline-flex; align-items: center; gap: 4px;">
            <i class="fa-solid fa-bell-concierge"></i> Mark Ready
          </button>
        `:i.orderStage==="Ready for Pickup"?P=`
          <button class="btn-admin-update-stage" data-id="${i.orderId}" data-stage="Completed" style="background: #10b981; color: white; border: none; padding: 5px 10px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 0.74rem; transition: 0.2s; white-space: nowrap; display: inline-flex; align-items: center; gap: 4px;">
            <i class="fa-solid fa-check"></i> Complete Order
          </button>
        `:i.orderStage==="Completed"&&(P='<span style="color: #059669; font-weight: 700; font-size: 0.76rem;"><i class="fa-solid fa-circle-check"></i> Finished</span>'),`
        <tr style="border-bottom: 1px solid rgba(0,0,0,0.06); transition: background 0.15s ease;" onmouseover="this.style.background='var(--light-bg)'" onmouseout="this.style.background='transparent'">
          <td style="padding: 10px 12px; font-weight: 700; color: var(--text-dark);">${i.orderId}</td>
          <td style="padding: 10px 12px; font-weight: 600;">${i.customerName}</td>
          <td style="padding: 10px 12px; color: var(--text-muted);">${i.customerPhone}</td>
          <td style="padding: 10px 12px; max-width: 220px;">
            ${(i.diningPreference||"").toLowerCase().includes("door")||(i.diningPreference||"").toLowerCase().includes("delivery")?(()=>{const S=i.deliveryAddress||"",C=S.includes("||GPS:")?S.split("||GPS:")[1].trim():"",L=(S.includes("||GPS:")?S.split("||GPS:")[0]:S).trim();let N="";C?N=C:L&&(N=L.toLowerCase().includes("yadagirigutta")?L:`${L}, Yadagirigutta, Telangana`);const H=N?`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(N)}&dir_action=navigate`:"";return`<div style="display: flex; flex-direction: column; gap: 4px;">
                    <span style="background:#fff7ed; color:#c2410c; border:1px solid #fed7aa; padding:2px 7px; border-radius:5px; font-size:0.72rem; font-weight:700; display:inline-flex; align-items:center; gap:4px; width: fit-content;">
                      <i class="fa-solid fa-truck-fast"></i> Door Delivery
                    </span>
                    ${L?H?`<a href="${H}" target="_blank" rel="noopener noreferrer" style="font-size:0.78rem; color:#1e293b; font-weight:600; line-height:1.35; margin-top:2px; text-decoration:none;" title="Click to open Google Maps navigation">
                              <i class="fa-solid fa-location-dot" style="color:#ef4444; margin-right:3px;"></i>${L}
                             </a>`:`<div style="font-size:0.76rem; color:#1e293b; font-weight:600; line-height:1.35; margin-top:2px;">
                              <i class="fa-solid fa-location-dot" style="color:#ef4444; margin-right:3px;"></i>${L}
                             </div>`:'<div style="font-size:0.74rem; color:#94a3b8;">No address entered</div>'}
                    ${C?`<div style="font-size:0.69rem; color:#059669; font-weight:700; display:inline-flex; align-items:center; gap:3px;">
                          <i class="fa-solid fa-satellite-dish"></i> GPS: ${C}
                         </div>`:""}
                    ${H?`<a href="${H}" target="_blank" rel="noopener noreferrer" style="display:inline-flex; align-items:center; gap:5px; margin-top:4px; background:#10b981; color:#ffffff; padding:5px 10px; border-radius:6px; font-size:0.75rem; font-weight:700; text-decoration:none; box-shadow:0 1px 3px rgba(16,185,129,0.3); width: fit-content; transition:0.2s;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">
                          <i class="fa-solid fa-location-arrow"></i> Start Navigation
                         </a>`:'<span style="font-size:0.72rem; color:#94a3b8; font-style:italic;">No location available</span>'}
                  </div>`})():`<span style="background:var(--light-bg); color:var(--text-dark); padding:2px 7px; border-radius:5px; font-size:0.74rem; font-weight:600;">${i.diningPreference||"Takeaway"}</span>`}
          </td>
          <td style="padding: 10px 12px; max-width: 170px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${g}">${g||"Meal Order"}</td>
          <td style="padding: 10px 12px; font-weight: 700; color: var(--accent-color);">₹${i.totalAmount}</td>
          <td style="padding: 10px 12px;">
            <span style="background: var(--light-bg); padding: 3px 8px; border-radius: 6px; font-size: 0.76rem; font-weight: 600; color: var(--text-dark);">
              ${i.paymentMethod==="UPI QR Payment"?'<i class="fa-solid fa-qrcode" style="color:#059669"></i> UPI QR':'<i class="fa-solid fa-money-bill-wave"></i> Cash'}
            </span>
          </td>
          <td style="padding: 10px 12px;">${$}</td>
          <td style="padding: 10px 12px;">${v}</td>
          <td style="padding: 10px 12px;">${u}</td>
          <td style="padding: 10px 12px; font-size: 0.76rem; color: var(--text-muted);">${b}</td>
          <td style="padding: 10px 12px; text-align: center;">${i.pickupToken?`<span style="background: #065f46; color: #fff; padding: 3px 9px; border-radius: 6px; font-weight: 800; font-size: 0.8rem; letter-spacing: 0.5px;">${i.pickupToken}</span>`:'<span style="color:#94a3b8">-</span>'}</td>
          <td style="padding: 10px 12px;">${k}</td>
          <td style="padding: 10px 12px; text-align: center;">${P}</td>
        </tr>
      `}).join("")},f=async()=>{try{const i=await fetch("/api/orders");i.ok&&(m=(await i.json()).orders||[],w())}catch(s){console.warn("Backend orders fetch error:",s)}};await f(),n=setInterval(f,3e3),o.addEventListener("input",s=>{d=s.target.value,w()}),r.forEach(s=>{s.addEventListener("click",()=>{r.forEach(i=>i.classList.remove("active")),s.classList.add("active"),y=s.dataset.filter,w()})}),t.addEventListener("click",async s=>{const i=s.target.closest(".btn-admin-approve-payment"),g=s.target.closest(".btn-admin-reject-payment"),b=sessionStorage.getItem("varevva_admin_token");if(i){const $=i.dataset.id;if(confirm(`Are you sure you want to approve payment for order ${$}?`))try{const l=`/api/payments/${$}/approve`,v=await fetch(l,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${b}`}});if(v.ok)alert(`Payment for order ${$} approved successfully!`),f();else{const q=await v.json();alert(`Approval failed: ${q.message}`)}}catch(l){alert(`Connection error: ${l.message}`)}}else if(g){const $=g.dataset.id,l=prompt("Please enter the reason for rejecting this payment proof:");if(l===null)return;if(!l.trim()){alert("Rejection reason is required.");return}try{const v=`/api/payments/${$}/reject`,q=await fetch(v,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${b}`},body:JSON.stringify({reason:l.trim()})});if(q.ok)alert(`Payment for order ${$} rejected successfully.`),f();else{const h=await q.json();alert(`Rejection failed: ${h.message}`)}}catch(v){alert(`Connection error: ${v.message}`)}}const c=s.target.closest(".btn-admin-update-stage");if(c){const $=c.dataset.id,l=c.dataset.stage;try{const v=`/api/orders/${$}/stage`,q=await fetch(v,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${b}`},body:JSON.stringify({orderStage:l})});if(q.ok)f();else{const h=await q.json();alert(`Stage update failed: ${h.message}`)}}catch(v){alert(`Connection error: ${v.message}`)}}})}
