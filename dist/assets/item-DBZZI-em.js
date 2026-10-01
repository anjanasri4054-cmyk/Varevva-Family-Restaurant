import"./style-oRVOOfyl.js";import{i as B,f as O,a as R}from"./db-D6wm5-Ip.js";import"./menuData-CEAaQ95C.js";const h=document.getElementById("navbar"),d=document.getElementById("nav-menu"),u=document.getElementById("mobile-nav-toggle"),k=document.getElementById("item-details-container"),w=document.getElementById("related-items-section"),x=document.getElementById("related-items-grid");let p=[],E=[];const D=new URLSearchParams(window.location.search),f=D.get("id");document.addEventListener("DOMContentLoaded",async()=>{if(await B(),p=await O(),E=await R(),P(),A(),f){const e=L(f);e?(q(e),M(e)):$()}else $();C(),z()});function L(e){let t=p.find(a=>a.id===e);return t||(t=E.find(a=>a.id===e),t?{id:t.id,name:t.name,price:t.price.includes("/")?200:parseInt(t.price.replace(/[^\d]/g,""))||200,category:"biryani",type:t.type,image:t.image,description:t.description,popular:!0}:null)}function P(){h&&window.addEventListener("scroll",()=>{window.scrollY>50?h.classList.add("scrolled"):h.classList.remove("scrolled")})}function A(){u&&d&&(u.addEventListener("click",()=>{d.classList.toggle("open");const t=u.querySelector("i");d.classList.contains("open")?t.className="fa-solid fa-xmark":t.className="fa-solid fa-bars"}),d.querySelectorAll("a").forEach(t=>{t.addEventListener("click",()=>{d.classList.remove("open"),u.querySelector("i").className="fa-solid fa-bars"})}))}function q(e){document.title=`${e.name} | Varevva Family Restaurant`;const t=document.querySelector('meta[name="description"]');t&&t.setAttribute("content",`Savor our delicious ${e.name} at Varevva Family Restaurant, Yadagirigutta. ${e.description||""}`);const a=e.type==="veg",s=a?"veg":"non-veg",i=a?"/assets/paneer_butter_masala.png":"/assets/chicken_dum_biryani.png",o=g()[e.name];let c="";e.outOfStock?c=`
      <button class="btn-detail-add btn-detail-add-disabled" disabled style="background-color: #9ca3af; border-color: #9ca3af; color: white; cursor: not-allowed;">
        SOLD OUT
      </button>
    `:o?c=`
      <div class="detail-qty-selector">
        <button class="btn-qty-minus detail-qty-btn" data-name="${e.name}" style="background: none; border: none; font-size: 1.5rem; color: var(--primary-color); font-weight: 700; cursor: pointer; padding: 0 10px;">-</button>
        <span class="qty-value" style="font-family: var(--font-header); font-weight: 700; font-size: 1.2rem;">${o.quantity}</span>
        <button class="btn-qty-plus detail-qty-btn" data-name="${e.name}" style="background: none; border: none; font-size: 1.5rem; color: var(--primary-color); font-weight: 700; cursor: pointer; padding: 0 10px;">+</button>
      </div>
    `:c=`
      <button class="btn-detail-add" data-name="${e.name}" data-price="${e.price}">
        ADD TO ORDER <i class="fa-solid fa-plus"></i>
      </button>
    `;const y=`https://wa.me/917382507237?text=Hi%20Varevva%20Restaurant,%20I%20would%20like%20to%20order%20${encodeURIComponent(e.name)}%20(Price:%20₹${e.price})%20from%20your%20website.`;function m(l,v){if(!l||typeof l!="string")return v;let r=l.trim();return r.startsWith("/public/assets/")?r=r.replace("/public/assets/","/assets/"):r.startsWith("public/assets/")?r=r.replace("public/assets/","/assets/"):r.startsWith("assets/")&&(r="/"+r),r||v}const T=m(e.image,i);k.innerHTML=`
    <div class="item-detail-card">
      
      <!-- Left Column: Product Photo -->
      <div class="item-detail-img-wrapper">
        <img class="item-detail-img" src="${T}" alt="${e.name}" onerror="this.onerror=null; this.src='${i}';">
        <span class="detail-diet-badge ${s}" title="${a?"Vegetarian":"Non-Vegetarian"}">
          <span class="diet-dot"></span>
          ${a?"Veg":"Non-Veg"}
        </span>
        ${e.popular?'<span style="position: absolute; top: 16px; right: 16px; background-color: var(--accent-color); color: white; padding: 6px 12px; border-radius: 8px; font-family: var(--font-header); font-weight: 700; font-size: 0.8rem; box-shadow: var(--shadow-small); display: flex; align-items: center; gap: 6px;"><i class="fa-solid fa-fire"></i> Best Seller</span>':""}
      </div>

      <!-- Right Column: Info & Actions -->
      <div class="item-detail-info">
        <div>
          <span class="item-detail-category">
            ${V(e.category)}
          </span>
          <h2 class="item-detail-title">
            ${e.name}
          </h2>
          <div class="item-detail-price">
            ₹${e.price}
          </div>
          <p class="item-detail-desc">
            ${e.description||"Delicately prepared using age-old traditional recipes with premium freshly sourced ingredients and hand-ground spices. Infused with rich authentic Telangana flavors."}
          </p>
          
          <div class="item-detail-meta-tags">
            <span class="item-detail-meta-tag"><i class="fa-solid fa-clock" style="color: var(--primary-color);"></i> 15-20 Mins Prep Time</span>
            <span class="item-detail-meta-tag"><i class="fa-solid fa-leaf" style="color: #24963f;"></i> No Added Color</span>
            <span class="item-detail-meta-tag"><i class="fa-solid fa-shield-halved" style="color: var(--accent-color);"></i> 100% Hygienic</span>
          </div>
        </div>

        <div class="item-detail-actions-divider">
          <!-- Primary Actions -->
          <div class="item-detail-actions-row">
            ${c}
            
            <a href="${y}" target="_blank" class="btn-whatsapp-direct">
              <i class="fa-brands fa-whatsapp" style="font-size: 1.3rem;"></i> ORDER VIA WHATSAPP
            </a>
          </div>

          <!-- Share Action -->
          <button id="btn-share-dish" class="btn-share-dish">
            <i class="fa-solid fa-share-nodes"></i> Share this dish with friends
          </button>
        </div>

      </div>
    </div>
  `;const b=document.getElementById("btn-share-dish");b&&b.addEventListener("click",()=>{const l=window.location.href;navigator.clipboard.writeText(l).then(()=>{S("Link copied to clipboard!")}).catch(()=>{S("Failed to copy link. Please copy URL manually.")})})}function M(e){const t=p.filter(i=>i.category===e.category&&i.id!==e.id&&!i.outOfStock);if(t.length===0){w.style.display="none";return}w.style.display="block",x.innerHTML="",t.slice(0,3).forEach((i,n)=>{const o=document.createElement("div");o.className="related-item-card",o.style.animationDelay=`${n*.05}s`;const c=i.type==="veg",y=c?"veg":"non-veg",m=c?"/assets/paneer_butter_masala.png":"/assets/chicken_dum_biryani.png";o.innerHTML=`
      <div class="related-item-text">
        <div class="item-meta-row" style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span class="diet-badge-fssai ${y}" title="${c?"Vegetarian":"Non-Vegetarian"}">
            <span class="diet-dot"></span>
          </span>
          ${i.popular?'<span class="popular-pill"><i class="fa-solid fa-fire"></i> Popular</span>':""}
        </div>
        <a href="/item.html?id=${i.id}" style="text-decoration: none; color: inherit;">
          <h3 class="related-item-name">${i.name}</h3>
        </a>
        <span class="related-item-price">₹${i.price}</span>
      </div>
      <div class="related-item-img-box">
        <a href="/item.html?id=${i.id}">
          <img class="related-item-img" src="${cleanPath(i.image,m)}" alt="${i.name}" loading="lazy" onerror="this.onerror=null; this.src='${m}';">
        </a>
      </div>
    `,x.appendChild(o)})}function $(){k.innerHTML=`
    <div style="text-align: center; padding: 80px 24px; background: white; border-radius: 20px; box-shadow: var(--shadow-medium);">
      <i class="fa-solid fa-face-frown fa-4x" style="color: var(--primary-color); margin-bottom: 20px;"></i>
      <h2 style="font-family: var(--font-header); font-size: 2rem; color: var(--secondary-color); margin-bottom: 10px;">Dish Not Found</h2>
      <p style="color: var(--text-muted); font-size: 1.1rem; margin-bottom: 30px;">We couldn't find the dish you are looking for. It might have been updated or removed.</p>
      <a href="/menu.html" class="btn-primary" style="display: inline-block; text-decoration: none; padding: 12px 30px; border-radius: 50px; font-weight: 700;">
        Browse Full Menu
      </a>
    </div>
  `}function S(e){const t=document.querySelector(".share-toast");t&&t.remove();const a=document.createElement("div");a.className="share-toast",a.innerText=e,Object.assign(a.style,{position:"fixed",bottom:"90px",left:"50%",transform:"translateX(-50%)",backgroundColor:"#333",color:"#fff",padding:"12px 24px",borderRadius:"50px",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",zIndex:"9999",fontFamily:"var(--font-header)",fontSize:"0.95rem",fontWeight:"600",opacity:"0",transition:"opacity 0.3s ease"}),document.body.appendChild(a),setTimeout(()=>{a.style.opacity="1"},10),setTimeout(()=>{a.style.opacity="0",setTimeout(()=>{a.remove()},300)},3e3)}function V(e){return{biryani:"Biryani Special",starters:"Starters",curries:"Rich Curries","chinese-rice":"Chinese & Rice",rotis:"Rotis & Breads"}[e]||e}function g(){try{let e=localStorage.getItem("varevva_cart"),t=JSON.parse(e)||{};if(Array.isArray(t)){const a={};t.forEach(s=>{s&&s.name&&(a[s.name]={name:s.name,price:Number(s.price)||0,quantity:Number(s.quantity)||1})}),t=a,localStorage.setItem("varevva_cart",JSON.stringify(t))}if(p.length>0){let a=!1;Object.keys(t).forEach(s=>{const i=p.find(n=>n.name===s);i&&(i.outOfStock?(delete t[s],a=!0):t[s].price=i.price)}),a&&localStorage.setItem("varevva_cart",JSON.stringify(t))}return t}catch{return{}}}function N(e){if(localStorage.setItem("varevva_cart",JSON.stringify(e)),C(),f){const t=L(f);t&&q(t)}}function _(e,t){const a=g();a[e]?a[e].quantity+=1:a[e]={name:e,price:Number(t),quantity:1},N(a)}function I(e,t){const a=g();a[e]&&(a[e].quantity+=t,a[e].quantity<=0&&delete a[e],N(a))}function C(){const e=g(),t=Object.keys(e);let a=document.querySelector(".floating-cart-bar");if(t.length===0){a&&a.remove();return}let s=0,i=0;t.forEach(n=>{s+=e[n].quantity,i+=e[n].price*e[n].quantity}),a||(a=document.createElement("div"),a.className="floating-cart-bar",document.body.appendChild(a)),a.innerHTML=`
    <div class="cart-info">
      <div class="cart-icon-wrapper">
        <i class="fa-solid fa-cart-shopping"></i>
        <span class="cart-badge">${s}</span>
      </div>
      <span>${s} Item${s>1?"s":""} | ₹${i}</span>
    </div>
    <button class="cart-btn-order" id="btn-cart-whatsapp-order">
      <span>View Order & Pay</span>
      <i class="fa-solid fa-arrow-right"></i>
    </button>
  `}function z(){document.body.addEventListener("click",e=>{const t=e.target.closest(".btn-add-zomato, .btn-detail-add");if(t){const n=t.dataset.name,o=t.dataset.price;_(n,o);return}const a=e.target.closest(".btn-qty-minus");if(a){const n=a.dataset.name;I(n,-1);return}const s=e.target.closest(".btn-qty-plus");if(s){const n=s.dataset.name;I(n,1);return}if(e.target.closest("#btn-cart-whatsapp-order")){window.location.href="/menu.html?checkout=true";return}})}
