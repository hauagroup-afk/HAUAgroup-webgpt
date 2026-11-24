import { json, isSameOrigin, getAdminContext, authResponse, supabaseRequest, validText } from "../_utils.js";
export async function onRequestGet({request,env}) {
  try {
    const ctx=await getAdminContext(request,env);
    if(ctx.error) return authResponse({error:ctx.error},ctx,ctx.error==="unauthorized"?401:403);
    const params=new URLSearchParams({select:"id,company_id,category_id,slug,name,summary,status,featured,sort_order,updated_at",order:"updated_at.desc",limit:"100"});
    if(ctx.profile.role==="company_admin") params.set("company_id",`eq.${ctx.profile.company_id}`);
    const r=await supabaseRequest(ctx,`/rest/v1/products?${params}`);
    if(!r.ok) return authResponse({error:"Unable to load products."},ctx,502);
    return authResponse({products:await r.json(),profile:ctx.profile},ctx);
  } catch { return json({error:"Admin service unavailable."},503); }
}
export async function onRequestPost({request,env}) {
  if(!isSameOrigin(request)) return json({error:"Request origin rejected."},403);
  let body;try{body=await request.json()}catch{return json({error:"Invalid request."},400)}
  if(!validText(body.slug,100)||!validText(body.name?.en,160)) return json({error:"English product name and slug are required."},400);
  try {
    const ctx=await getAdminContext(request,env);
    if(ctx.error) return authResponse({error:ctx.error},ctx,ctx.error==="unauthorized"?401:403);
    const companyId=ctx.profile.role==="group_admin"?body.company_id:ctx.profile.company_id;
    if(!companyId) return authResponse({error:"Select a company."},ctx,400);
    const payload={company_id:companyId,category_id:body.category_id||null,slug:body.slug.trim().toLowerCase(),name:body.name,summary:body.summary||{},description:body.description||{},specifications:body.specifications||{},image_paths:[],status:"draft",featured:false,sort_order:0};
    const r=await supabaseRequest(ctx,"/rest/v1/products",{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify(payload)});
    if(!r.ok) return authResponse({error:"Unable to create product. Check slug uniqueness and permissions."},ctx,400);
    return authResponse({product:(await r.json())[0]},ctx,201);
  } catch { return json({error:"Admin service unavailable."},503); }
}

export async function onRequestPatch({request,env}) {
  if(!isSameOrigin(request)) return json({error:"Request origin rejected."},403);
  let body;try{body=await request.json()}catch{return json({error:"Invalid request."},400)}
  if(typeof body.id!=="string"||!/^[0-9a-f-]{36}$/i.test(body.id)||!["draft","published","archived"].includes(body.status)) return json({error:"Invalid product update."},400);
  try {
    const ctx=await getAdminContext(request,env);
    if(ctx.error) return authResponse({error:ctx.error},ctx,ctx.error==="unauthorized"?401:403);
    const r=await supabaseRequest(ctx,`/rest/v1/products?id=eq.${encodeURIComponent(body.id)}`,{method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify({status:body.status})});
    if(!r.ok) return authResponse({error:"Unable to update product. Check your access."},ctx,400);
    const rows=await r.json();
    if(!rows.length) return authResponse({error:"Product not found or outside your access scope."},ctx,404);
    return authResponse({product:rows[0]},ctx);
  } catch { return json({error:"Admin service unavailable."},503); }
}
