/* HAUA marketplace catalogue enhancement: search, category filters, rich product details. */
(() => {
  // Reuse the existing data-fetch flow but enhance the panel after each branch render.
  const panel = document.getElementById("panel");
  if (!panel) return;
  let lastData = null;
  const observer = new MutationObserver(() => {
    if (!document.getElementById("branch")?.classList.contains("active")) return;
    const heading = panel.querySelector("h3");
    if (!heading || heading.textContent !== tr("products")) return;
    const data = branchData?.[currentBranch];
    if (!data) return;
    const signature = currentBranch + ":" + (data.products||[]).map(x=>x.id).join(",");
    if (panel.dataset.marketSignature === signature) return;
    panel.dataset.marketSignature = signature;
    renderMarket(data);
  });
  observer.observe(panel, {childList:true,subtree:true});
  function text(v){if(v&&typeof v==="object")return v[currentLang]||v.en||v.bn||v.ar||"";return typeof v==="string"?v:"";}
  function renderMarket(data){
    panel.replaceChildren();
    const title=document.createElement("h3");title.textContent=tr("products");panel.append(title);
    const tools=document.createElement("div");tools.className="market-tools";
    const search=document.createElement("input");search.type="search";search.placeholder=currentLang==="bn"?"পণ্য খুঁজুন…":currentLang==="ar"?"ابحث عن منتج…":"Search products…";search.setAttribute("aria-label",search.placeholder);
    const select=document.createElement("select");select.setAttribute("aria-label","Filter category");
    const all=document.createElement("option");all.value="";all.textContent=currentLang==="bn"?"সব ক্যাটাগরি":currentLang==="ar"?"كل الفئات":"All categories";select.append(all);
    (data.categories||[]).forEach(c=>{const o=document.createElement("option");o.value=c.id;o.textContent=text(c.name);select.append(o)});
    tools.append(search,select);panel.append(tools);
    const grid=document.createElement("div");grid.className="catalogue-grid";panel.append(grid);
    const products=data.products||[];
    function draw(){
      grid.replaceChildren();
      const term=search.value.trim().toLocaleLowerCase();
      const matches=products.filter(p=>(!select.value||p.category_id===select.value)&&(!term||[text(p.name),text(p.summary),text(p.description),p.slug].join(" ").toLocaleLowerCase().includes(term)));
      if(!matches.length){const empty=document.createElement("p");empty.textContent=currentLang==="bn"?"কোনো পণ্য পাওয়া যায়নি।":"No products match your search.";grid.append(empty);return}
      matches.forEach(p=>{
        const card=document.createElement("article");card.className="product-tile market-tile";
        const media=document.createElement("div");media.className="market-media";
        const image=(p.image_paths||[]).find(x=>typeof x==="string"&&/^\/(?!\/)|^https:\/\//.test(x));
        if(image){const img=document.createElement("img");img.loading="lazy";img.alt=text(p.name);img.src=image;media.append(img)}else{media.textContent=currentBranch==="ruhama"?"APP":currentBranch==="waha"?"AGRI":currentBranch==="attire"?"STYLE":"FOOD";media.className+=" market-placeholder"}
        const h=document.createElement("h4");h.textContent=text(p.name)||p.slug;
        const summary=document.createElement("p");summary.textContent=text(p.summary);
        card.append(media,h,summary);
        if(p.unit_price!=null){const price=document.createElement("p");price.className="market-price";price.textContent=Number(p.unit_price).toLocaleString(currentLang==="bn"?"bn-BD":"en-BD",{minimumFractionDigits:2,maximumFractionDigits:2})+" BDT";card.append(price)}
        const detail=document.createElement("button");detail.type="button";detail.className="market-detail";detail.textContent=currentLang==="bn"?"বিস্তারিত":currentLang==="ar"?"التفاصيل":"Details";detail.addEventListener("click",()=>showDetails(p));card.append(detail);grid.append(card);
      });
    }
    search.addEventListener("input",draw);select.addEventListener("change",draw);draw();
  }
  function showDetails(p){
    const previousFocus=document.activeElement;
    const modal=document.createElement("div");modal.className="market-modal";
    const box=document.createElement("section");box.className="market-modal-card";box.setAttribute("role","dialog");box.setAttribute("aria-modal","true");
    const close=document.createElement("button");close.className="market-close";close.textContent="×";close.setAttribute("aria-label","Close");close.addEventListener("click",()=>modal.remove());
    const h=document.createElement("h2");h.textContent=text(p.name);
    const desc=document.createElement("p");desc.textContent=text(p.description)||text(p.summary);
    box.append(close,h);
    const image=(p.image_paths||[]).find(x=>typeof x==="string"&&/^\/(?!\/)|^https:\/\//.test(x));
    if(image){const visual=document.createElement("div");visual.className="market-media";visual.style.height="220px";const img=document.createElement("img");img.src=image;img.alt=text(p.name);img.loading="lazy";visual.append(img);box.append(visual)}
    box.append(desc);
    if(p.unit_price!=null){const price=document.createElement("p");price.className="market-price";price.textContent=Number(p.unit_price).toLocaleString(currentLang==="bn"?"bn-BD":"en-BD",{minimumFractionDigits:2,maximumFractionDigits:2})+" BDT";box.append(price)}
    if(p.specifications){const specs=document.createElement("pre");specs.className="market-specs";specs.textContent=typeof p.specifications==="string"?p.specifications:JSON.stringify(p.specifications,null,2);box.append(specs)}
    function dismiss(){modal.remove();document.removeEventListener("keydown",onKey);if(previousFocus&&previousFocus.focus)previousFocus.focus();}
    close.addEventListener("click",dismiss);
    function onKey(e){if(e.key==="Escape")dismiss();if(e.key==="Tab"){const focusable=[close];if(e.shiftKey&&document.activeElement===close){e.preventDefault();close.focus()}}}
    modal.append(box);modal.addEventListener("click",e=>{if(e.target===modal)dismiss()});document.body.append(modal);document.addEventListener("keydown",onKey);close.focus();
  }
})();
