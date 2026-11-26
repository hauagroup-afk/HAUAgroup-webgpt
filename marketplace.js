/* HAUA marketplace catalogue enhancement: search, category filters, rich product details. */
(() => {
  const original = window.renderProducts;
  // Reuse the existing data-fetch flow but enhance the panel after each branch render.
  const panel = document.getElementById("panel");
  if (!panel) return;
  let lastData = null;
  const observer = new MutationObserver(() => {
    if (!document.getElementById("branch")?.classList.contains("active")) return;
    const heading = panel.querySelector("h3");
    if (!heading || heading.textContent !== (window.tr ? window.tr("products") : "Product Catalogue")) return;
    // Enhancement is only applied when product tiles are present or empty state is rendered.
    if (panel.dataset.marketEnhanced === "1") return;
    panel.dataset.marketEnhanced = "1";
    const tiles = [...panel.querySelectorAll(".product-tile")];
    const data = window.branchData?.[window.currentBranch];
    if (!data) { panel.dataset.marketEnhanced=""; return; }
    panel.dataset.marketEnhanced="";
    renderMarket(data);
  });
  observer.observe(panel, {childList:true,subtree:true});
  function text(v){if(v&&typeof v==="object")return v[window.currentLang]||v.en||v.bn||v.ar||"";return typeof v==="string"?v:"";}
  function renderMarket(data){
    panel.replaceChildren();
    const title=document.createElement("h3");title.textContent=window.tr("products");panel.append(title);
    const tools=document.createElement("div");tools.className="market-tools";
    const search=document.createElement("input");search.type="search";search.placeholder=window.currentLang==="bn"?"পণ্য খুঁজুন…":window.currentLang==="ar"?"ابحث عن منتج…":"Search products…";search.setAttribute("aria-label",search.placeholder);
    const select=document.createElement("select");select.setAttribute("aria-label","Filter category");
    const all=document.createElement("option");all.value="";all.textContent=window.currentLang==="bn"?"সব ক্যাটাগরি":window.currentLang==="ar"?"كل الفئات":"All categories";select.append(all);
    (data.categories||[]).forEach(c=>{const o=document.createElement("option");o.value=c.id;o.textContent=text(c.name);select.append(o)});
    tools.append(search,select);panel.append(tools);
    const grid=document.createElement("div");grid.className="catalogue-grid";panel.append(grid);
    const products=data.products||[];
    function draw(){
      grid.replaceChildren();
      const term=search.value.trim().toLocaleLowerCase();
      const matches=products.filter(p=>(!select.value||p.category_id===select.value)&&(!term||[text(p.name),text(p.summary),text(p.description),p.slug].join(" ").toLocaleLowerCase().includes(term)));
      if(!matches.length){const empty=document.createElement("p");empty.textContent=window.currentLang==="bn"?"কোনো পণ্য পাওয়া যায়নি।":"No products match your search.";grid.append(empty);return}
      matches.forEach(p=>{
        const card=document.createElement("article");card.className="product-tile market-tile";
        const media=document.createElement("div");media.className="market-media";
        const image=(p.image_paths||[]).find(x=>typeof x==="string"&&/^\/(?!\/)|^https:\/\//.test(x));
        if(image){const img=document.createElement("img");img.loading="lazy";img.alt=text(p.name);img.src=image;media.append(img)}else{media.textContent=window.currentBranch==="ruhama"?"APP":window.currentBranch==="waha"?"AGRI":window.currentBranch==="attire"?"STYLE":"FOOD";media.className+=" market-placeholder"}
        const h=document.createElement("h4");h.textContent=text(p.name)||p.slug;
        const summary=document.createElement("p");summary.textContent=text(p.summary);
        card.append(media,h,summary);
        if(p.unit_price!=null){const price=document.createElement("p");price.className="market-price";price.textContent=Number(p.unit_price).toLocaleString(window.currentLang==="bn"?"bn-BD":"en-BD",{minimumFractionDigits:2,maximumFractionDigits:2})+" BDT";card.append(price)}
        const detail=document.createElement("button");detail.type="button";detail.className="market-detail";detail.textContent=window.currentLang==="bn"?"বিস্তারিত":window.currentLang==="ar"?"التفاصيل":"Details";detail.addEventListener("click",()=>showDetails(p));card.append(detail);grid.append(card);
      });
    }
    search.addEventListener("input",draw);select.addEventListener("change",draw);draw();
  }
  function showDetails(p){
    const modal=document.createElement("div");modal.className="market-modal";
    const box=document.createElement("section");box.className="market-modal-card";box.setAttribute("role","dialog");box.setAttribute("aria-modal","true");
    const close=document.createElement("button");close.className="market-close";close.textContent="×";close.setAttribute("aria-label","Close");close.addEventListener("click",()=>modal.remove());
    const h=document.createElement("h2");h.textContent=text(p.name);
    const desc=document.createElement("p");desc.textContent=text(p.description)||text(p.summary);
    box.append(close,h,desc);
    if(p.unit_price!=null){const price=document.createElement("p");price.className="market-price";price.textContent=Number(p.unit_price).toLocaleString(window.currentLang==="bn"?"bn-BD":"en-BD",{minimumFractionDigits:2,maximumFractionDigits:2})+" BDT";box.append(price)}
    if(p.specifications){const specs=document.createElement("pre");specs.className="market-specs";specs.textContent=typeof p.specifications==="string"?p.specifications:JSON.stringify(p.specifications,null,2);box.append(specs)}
    modal.append(box);modal.addEventListener("click",e=>{if(e.target===modal)modal.remove()});document.body.append(modal);close.focus();
  }
})();
