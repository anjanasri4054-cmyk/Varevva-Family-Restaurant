import"./style-oRVOOfyl.js";const S=new URLSearchParams(window.location.search),p=S.get("orderId")||localStorage.getItem("varevva_last_order_id")||"VRV1001",x=document.getElementById("track-order-id"),P=document.getElementById("track-customer-name"),T=document.getElementById("track-total-amount"),u=document.getElementById("track-items-summary"),f=document.getElementById("token-card-section"),b=document.getElementById("display-pickup-token"),I=document.getElementById("display-prep-time");x.textContent=p;const l=["Order Placed","Payment Proof Submitted","Order Confirmed","Preparing Food","Ready for Pickup","Completed"];async function g(){try{const t=`/api/orders/track/${p}`,c=await fetch(t);if(c.ok){const o=await c.json();o.order&&C(o.order)}}catch(t){console.warn("Live tracking fetch error:",t)}}function C(t){P.textContent=`Customer: ${t.customerName} (${t.customerPhone})`,T.textContent=`₹${t.totalAmount}`;const c=document.getElementById("btn-track-whatsapp");if(c){let e=`*🍽️ VAREVYA TELANGANA RUCHULU - ORDER TRACKING*

`;if(e+=`*Order ID:* ${t.orderId}
`,t.pickupToken&&(e+=`*Token:* ${t.pickupToken}
`),e+=`*Customer:* ${t.customerName} (${t.customerPhone})
`,e+=`*Option:* ${t.diningPreference||"Takeaway"}
`,e+=`*Status / Stage:* ${t.orderStage||"Order Placed"}
`,e+=`*Total Amount:* ₹${t.totalAmount}
`,t.deliveryAddress){const i=t.deliveryAddress,n=i.includes("||GPS:")?i.split("||GPS:")[1].trim():"",a=(i.includes("||GPS:")?i.split("||GPS:")[0]:i).trim();a&&(e+=`*Delivery Address:* ${a}
`);const r=n||(a?a.toLowerCase().includes("yadagirigutta")?a:`${a}, Yadagirigutta, Telangana`:"");if(r){const k=`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(r)}&dir_action=navigate`;e+=`*🗺️ Start Google Maps Navigation:*
${k}
`}}e+=`
*Track Live:* ${window.location.href}`,c.href=`https://wa.me/917382507237?text=${encodeURIComponent(e)}`}u&&t.items&&t.items.length>0&&(u.innerHTML=`
          <table style="width: 100%; border-collapse: collapse; font-size: 0.84rem;">
            <thead style="border-bottom: 1.5px solid rgba(0,0,0,0.1); color: var(--text-muted);">
              <tr>
                <th style="text-align: left; padding: 6px 0;">Item Name</th>
                <th style="text-align: center; padding: 6px 0;">Qty</th>
                <th style="text-align: right; padding: 6px 0;">Unit Price</th>
                <th style="text-align: right; padding: 6px 0;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${t.items.map(e=>{let i=e.name||e.title||"Menu Item";/^[a-f0-9]{24}$/i.test(i.trim())&&(i=e.title||"Special Dish");const n=e.quantity||1,a=e.price||(e.subtotal?Math.round(e.subtotal/n):0),r=e.subtotal||a*n;return`
                  <tr style="border-bottom: 1px dashed rgba(0,0,0,0.06);">
                    <td style="padding: 6px 0; font-weight: 600;">${i}</td>
                    <td style="padding: 6px 0; text-align: center; font-weight: 700;">${n}</td>
                    <td style="padding: 6px 0; text-align: right; color: var(--text-muted);">₹${a}</td>
                    <td style="padding: 6px 0; text-align: right; font-weight: 700; color: var(--accent-color);">₹${r}</td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        `);const o=t.orderStage||"Order Placed",y=t.paymentStatus!=="Paid"&&t.orderStatus==="CANCELLED",s=(t.auditLogs||[]).slice().reverse().find(e=>e.action==="PAYMENT_REJECTED"),d=document.getElementById("rejection-alert"),h=document.getElementById("rejection-reason");if(y&&s){d.style.display="flex",h.textContent=s.reason||"Invalid screenshot or transaction mismatch.";const e=document.getElementById("btn-reupload-proof");e.onclick=()=>{window.location.href=`payment.html?orderId=${t.orderId}`}}else d.style.display="none";t.pickupToken?(f.style.display="flex",b.textContent=t.pickupToken,I.textContent=`Estimated Preparation Time: ${t.estimatedPrepTime||"15 Minutes"}`):f.style.display="none";const m=l.indexOf(o)!==-1?l.indexOf(o):0;document.querySelectorAll(".timeline-step").forEach(e=>{const i=e.dataset.stage,n=l.indexOf(i);n<m?(e.className="timeline-step done",e.querySelector(".timeline-icon-circle").innerHTML='<i class="fa-solid fa-circle-check"></i>'):n===m?(e.className="timeline-step preparing",i==="Order Placed"?e.querySelector(".timeline-icon-circle").innerHTML='<i class="fa-solid fa-circle-check fa-bounce"></i>':i==="Payment Proof Submitted"?e.querySelector(".timeline-icon-circle").innerHTML='<i class="fa-solid fa-receipt fa-bounce"></i>':i==="Order Confirmed"?e.querySelector(".timeline-icon-circle").innerHTML='<i class="fa-solid fa-check-double fa-bounce"></i>':i==="Preparing Food"?e.querySelector(".timeline-icon-circle").innerHTML='<i class="fa-solid fa-fire-burner fa-bounce"></i>':i==="Ready for Pickup"?e.querySelector(".timeline-icon-circle").innerHTML='<i class="fa-solid fa-bell-concierge fa-bounce"></i>':i==="Completed"&&(e.className="timeline-step done",e.querySelector(".timeline-icon-circle").innerHTML='<i class="fa-solid fa-house-flag"></i>')):(e.className="timeline-step pending",i==="Order Placed"?e.querySelector(".timeline-icon-circle").innerHTML='<i class="fa-solid fa-circle-check"></i>':i==="Payment Proof Submitted"?e.querySelector(".timeline-icon-circle").innerHTML='<i class="fa-solid fa-receipt"></i>':i==="Order Confirmed"?e.querySelector(".timeline-icon-circle").innerHTML='<i class="fa-solid fa-check-double"></i>':i==="Preparing Food"?e.querySelector(".timeline-icon-circle").innerHTML='<i class="fa-solid fa-fire-burner"></i>':i==="Ready for Pickup"?e.querySelector(".timeline-icon-circle").innerHTML='<i class="fa-solid fa-bell-concierge"></i>':i==="Completed"&&(e.querySelector(".timeline-icon-circle").innerHTML='<i class="fa-solid fa-house-flag"></i>'))})}g();setInterval(g,3e3);
