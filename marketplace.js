/* HAUA multi-platform catalog, discovery and COD cart. */
(() => {
 const panel=document.getElementById("panel"); if(!panel)return;
 let cart=[], lastData=null;
 const slugMap={lazeez:"lazeez",attire:"rifa-aimans-attire",ruhama:"ruhama-technology",waha:"waha-agri"};
 const words={
  en:{cart:"Cart",add:"Add to cart",checkout:"Checkout · Cash on delivery",empty:"Your cart is empty.",name:"Full name",phone:"Phone",email:"Email (optional)",address:"Delivery address",city:"City",note:"Order note (optional)",submit:"Place COD order",thanks:"Order received. Order reference: ",apps:"Apps & UI models",exclusive:"Exclusive developer: HAUA GROUP",video:"Video & sponsored placements",benefits:"Benefits & cautions",promo:"Sponsored / featured",units:"items"},
  bn:{cart:"কার্ট",add:"কার্টে যোগ করুন",checkout:"চেকআউট · ক্যাশ অন ডেলিভারি",empty:"কার্ট খালি।",name:"পূর্ণ নাম",phone:"ফোন",email:"ইমেইল (ঐচ্ছিক)",address:"ডেলিভারি ঠিকানা",city:"শহর",note:"অর্ডার নোট (ঐচ্ছিক)",submit:"COD অর্ডার করুন",thanks:"অর্ডার গ্রহণ করা হয়েছে। অর্ডার রেফারেন্স: ",apps:"অ্যাপ ও UI মডেল",exclusive:"একক ডেভেলপার: HAUA GROUP",video:"ভিডিও ও স্পন্সর বিজ্ঞাপন",benefits:"উপকারিতা ও সতর্কতা",promo:"স্পন্সরড / ফিচার্ড",units:"টি পণ্য"},
  ar:{cart:"السلة",add:"أضف إلى السلة",checkout:"إتمام الطلب · الدفع عند الاستلام",empty:"السلة فارغة.",name:"الاسم الكامل",phone:"الهاتف",email:"البريد (اختياري)",address:"عنوان التسليم",city:"المدينة",note:"ملاحظات (اختياري)",submit:"تأكيد الطلب",thanks:"تم استلام الطلب. المرجع: ",apps:"التطبيقات ونماذج UI",exclusive:"المطور الحصري: HAUA GROUP",video:"فيديو وإعلانات ممولة",benefits:"الفوائد والتنبيهات",promo:"مميز / ممول",units:"منتجات"}
 };
 function w(k){return(words[currentLang]||words.en)[k]||words.en[k]}
 function val(x){if(x&&typeof x==="object")return x[currentLang]||x.en||x.bn||x.ar||"";return typeof x==="string"?x:""}
 function productImage(p){return(p.image_paths||[]).find(x=>typeof x==="string"&&/^\/(?!\/)|^https:\/\//.test(x))}
 function price(p){return Number(p.unit_price||0).toLocaleString(currentLang==="bn"?"bn-BD":"en-BD",{minimumFractionDigits:2,maximumFractionDigits:2})+" BDT"}
 function announce(msg){const n=document.createElement("p");n.className="market-status";n.setAttribute("aria-live","polite");n.textContent=msg;panel.append(n)}
 const obs=new MutationObserver(()=>{if(!document.getElementById("branch")?.classList.contains("active"))return;const h=panel.querySelector("h3");if(!h||h.textContent!==tr("products"))return;const d=branchData?.[currentBranch];if(!d)return;const sig=currentBranch+":"+(d.products||[]).map(x=>x.id).join(",");if(panel.dataset.marketSignature===sig)return;panel.dataset.marketSignature=sig;render(d)});
 obs.observe(panel,{childList:true,subtree:true});
 function render(data){
  panel.replaceChildren();const title=document.createElement("h3");title.textContent=tr("products");panel.append(title);
  const entries=(data.content||[]).filter(x=>x.is_published&&x.content&&typeof x.content==="object");
  if(entries.length){const showcase=document.createElement("div");showcase.className="catalogue-grid market-content-grid";entries.forEach(entry=>{const c=entry.content||{},card=document.createElement("article");card.className="product-tile market-tile";const h=document.createElement("h4");h.textContent=val(c.title)||entry.content_key;const desc=document.createElement("p");desc.textContent=val(c.description)||val(c.summary)||entry.content_key;card.append(h,desc);const url=c.download_url||c.url||c.link;if(typeof url==="string"&&/^https:\/\//i.test(url)){const a=document.createElement("a");a.href=url;a.target="_blank";a.rel="noopener noreferrer";a.className="market-detail";a.textContent=currentBranch==="ruhama"?(currentLang==="bn"?"ডাউনলোড / বিস্তারিত":"Download / details"):(currentLang==="bn"?"বিস্তারিত":"Details");card.append(a)}if(c.video_url&&/^https:\/\//i.test(c.video_url)){const a=document.createElement("a");a.href=c.video_url;a.target="_blank";a.rel="noopener noreferrer";a.className="market-detail";a.textContent=currentLang==="bn"?"ভিডিও দেখুন":"Watch video";card.append(a)}if(c.version){let v=document.createElement("small");v.textContent="Version "+c.version;card.append(v)}if(c.benefits||c.cautions){let note=document.createElement("p");note.textContent=(val(c.benefits)?(currentLang==="bn"?"উপকারিতা: ":"Benefits: ")+val(c.benefits)+" ":"")+(val(c.cautions)?(currentLang==="bn"?"সতর্কতা: ":"Cautions: ")+val(c.cautions):"");card.append(note)}showcase.append(card)});panel.append(showcase)}
  const toolbar=document.createElement("div");toolbar.className="market-tools";
  const search=document.createElement("input");search.type="search";search.placeholder=currentLang==="bn"?"খুঁজুন…":"Search…";search.setAttribute("aria-label",search.placeholder);
  const select=document.createElement("select");select.setAttribute("aria-label","Filter category");const all=document.createElement("option");all.value="";all.textContent=currentLang==="bn"?"সব ক্যাটাগরি":"All categories";select.append(all);
  (data.categories||[]).forEach(c=>{let o=document.createElement("option");o.value=c.id;o.textContent=val(c.name);select.append(o)});
  toolbar.append(search,select);panel.append(toolbar);
  const grid=document.createElement("div");grid.className="catalogue-grid";panel.append(grid);
  const products=data.products||[];
  const cartBar=document.createElement("div");cartBar.className="market-cartbar";panel.append(cartBar);
  function cartUpdate(){cartBar.replaceChildren();const b=document.createElement("button");b.className="market-detail";b.textContent=w("cart")+" · "+cart.reduce((a,x)=>a+x.quantity,0);b.addEventListener("click",cartView);cartBar.append(b)}
  function draw(){
   grid.replaceChildren();let term=search.value.trim().toLocaleLowerCase();
   let found=products.filter(p=>(!select.value||p.category_id===select.value)&&(!term||[val(p.name),val(p.summary),val(p.description),p.slug].join(" ").toLowerCase().includes(term)));
   if(!found.length){let p=document.createElement("p");p.textContent=currentLang==="bn"?"কোনো পণ্য পাওয়া যায়নি।":"No products match.";grid.append(p)}
   found.forEach(p=>{
    const card=document.createElement("article");card.className="product-tile market-tile";
    const media=document.createElement("div");media.className="market-media";let imgsrc=productImage(p);
    if(imgsrc){let img=document.createElement("img");img.loading="lazy";img.alt=val(p.name);img.src=imgsrc;media.append(img)}else{media.textContent=currentBranch==="ruhama"?"APP / UI":currentBranch==="waha"?"AGRI":currentBranch==="attire"?"STYLE":"FOOD";media.className+=" market-placeholder"}
    const h=document.createElement("h4");h.textContent=val(p.name)||p.slug;const desc=document.createElement("p");desc.textContent=val(p.summary);
    card.append(media,h,desc);
    if(p.unit_price!=null){let pr=document.createElement("p");pr.className="market-price";pr.textContent=price(p);card.append(pr)}
    let detail=document.createElement("button");detail.className="market-detail";detail.textContent=currentLang==="bn"?"বিস্তারিত":"Details";detail.addEventListener("click",()=>details(p));card.append(detail);
    if(p.unit_price!=null){let add=document.createElement("button");add.className="market-detail market-add";add.textContent=w("add");add.addEventListener("click",()=>{let item=cart.find(x=>x.product_id===p.id);if(item)item.quantity=Math.min(99,item.quantity+1);else cart.push({product_id:p.id,quantity:1,product:p});cartUpdate()});card.append(add)}
    grid.append(card)
   });cartUpdate();
  }
  search.addEventListener("input",draw);select.addEventListener("change",draw);draw();
 }
 function details(p){
  const prev=document.activeElement,modal=document.createElement("div");modal.className="market-modal";const box=document.createElement("section");box.className="market-modal-card";box.setAttribute("role","dialog");box.setAttribute("aria-modal","true");
  const close=document.createElement("button");close.className="market-close";close.textContent="×";close.setAttribute("aria-label","Close");
  const h=document.createElement("h2");h.textContent=val(p.name);box.append(close,h);
  let imgsrc=productImage(p);if(imgsrc){let m=document.createElement("div");m.className="market-media";let img=document.createElement("img");img.src=imgsrc;img.alt=val(p.name);img.loading="lazy";m.append(img);box.append(m)}
  let d=document.createElement("p");d.textContent=val(p.description)||val(p.summary);box.append(d);
  if(p.unit_price!=null){let pr=document.createElement("p");pr.className="market-price";pr.textContent=price(p);box.append(pr)}
  if(p.specifications){let specs=document.createElement("pre");specs.className="market-specs";specs.textContent=typeof p.specifications==="string"?p.specifications:JSON.stringify(p.specifications,null,2);box.append(specs)}
  if(currentBranch==="waha"){let advisory=document.createElement("aside");advisory.className="market-note";advisory.textContent=currentLang==="bn"?"পুষ্টি ও স্বাস্থ্যসংক্রান্ত তথ্য সাধারণ নির্দেশনা; ব্যক্তিগত স্বাস্থ্য সিদ্ধান্তের জন্য নির্ভরযোগ্য উৎস/বিশেষজ্ঞের পরামর্শ নিন।":"Nutrition and health notes are general information, not medical advice.";box.append(advisory)}
  if(p.unit_price!=null){let add=document.createElement("button");add.className="market-detail market-add";add.textContent=w("add");add.addEventListener("click",()=>{let item=cart.find(x=>x.product_id===p.id);if(item)item.quantity=Math.min(99,item.quantity+1);else cart.push({product_id:p.id,quantity:1,product:p});dismiss();render(branchData[currentBranch])});box.append(add)}
  function dismiss(){modal.remove();document.removeEventListener("keydown",onKey);if(prev?.focus)prev.focus()}
  close.addEventListener("click",dismiss);function onKey(e){if(e.key==="Escape")dismiss();if(e.key==="Tab"){let fs=[...box.querySelectorAll("button")];if(fs.length&&e.shiftKey&&document.activeElement===fs[0]){e.preventDefault();fs[fs.length-1].focus()}else if(fs.length&&!e.shiftKey&&document.activeElement===fs[fs.length-1]){e.preventDefault();fs[0].focus()}}}
  modal.append(box);modal.addEventListener("click",e=>{if(e.target===modal)dismiss()});document.body.append(modal);document.addEventListener("keydown",onKey);close.focus();
 }
 function cartView(){
  const modal=document.createElement("div");modal.className="market-modal";const box=document.createElement("section");box.className="market-modal-card";box.setAttribute("role","dialog");box.setAttribute("aria-modal","true");
  const close=document.createElement("button");close.className="market-close";close.textContent="×";close.addEventListener("click",()=>modal.remove());const h=document.createElement("h2");h.textContent=w("cart");box.append(close,h);
  if(!cart.length){let p=document.createElement("p");p.textContent=w("empty");box.append(p)}else{
   const list=document.createElement("div");list.className="market-cartlist";let total=0;
   cart.forEach(item=>{const row=document.createElement("div");row.className="market-cartitem";let title=document.createElement("strong");title.textContent=val(item.product.name);let qty=document.createElement("input");qty.type="number";qty.min="1";qty.max="99";qty.value=item.quantity;qty.setAttribute("aria-label","Quantity");qty.addEventListener("change",()=>{item.quantity=Math.max(1,Math.min(99,Number(qty.value)||1));cartView()});let subtotal=item.quantity*Number(item.product.unit_price);total+=subtotal;let amount=document.createElement("span");amount.textContent=subtotal.toLocaleString("en-BD",{minimumFractionDigits:2})+" BDT";let rm=document.createElement("button");rm.className="market-detail";rm.textContent="Remove";rm.addEventListener("click",()=>{cart=cart.filter(x=>x.product_id!==item.product_id);cartView()});row.append(title,qty,amount,rm);list.append(row)});box.append(list);
   let sum=document.createElement("p");sum.className="market-price";sum.textContent="Subtotal: "+total.toLocaleString("en-BD",{minimumFractionDigits:2})+" BDT";box.append(sum);
   const form=document.createElement("form");form.className="market-checkout";
   function field(label,type,name,required=true){let l=document.createElement("label");l.textContent=label;let i=document.createElement(type==="textarea"?"textarea":"input");if(type!=="textarea")i.type=type;i.name=name;i.required=required;i.maxLength=type==="textarea"?1000:300;l.append(i);form.append(l)}
   field(w("name"),"text","name");field(w("phone"),"tel","phone");field(w("email"),"email","email",false);field(w("address"),"textarea","address");field(w("city"),"text","city");field(w("note"),"textarea","note",false);
   let submit=document.createElement("button");submit.className="market-detail market-add";submit.textContent=w("submit");form.append(submit);let status=document.createElement("p");status.setAttribute("aria-live","polite");form.append(status);
   form.addEventListener("submit",async e=>{e.preventDefault();submit.disabled=true;status.textContent=currentLang==="bn"?"অর্ডার পাঠানো হচ্ছে…":"Submitting…";const fd=new FormData(form);let payload={company:slugMap[currentBranch],customer:{name:fd.get("name"),phone:fd.get("phone"),email:fd.get("email")||"",address:{street:fd.get("address"),city:fd.get("city")}},items:cart.map(x=>({product_id:x.product_id,quantity:x.quantity})),note:fd.get("note")||""};try{const response=await fetch("/api/public/orders",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});let result=await response.json();if(!response.ok)throw new Error(result.error||"Order failed");status.textContent=w("thanks")+(result.order?.order_number||"");cart=[];submit.disabled=true; }catch(err){status.textContent=err.message||"Order failed";submit.disabled=false}});
   box.append(form);
  }
  modal.append(box);modal.addEventListener("click",e=>{if(e.target===modal)modal.remove()});document.body.append(modal);
 }
})();
