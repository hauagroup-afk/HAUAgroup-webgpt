import { json, getAdminContext, authResponse, supabaseRequest } from "../_utils.js";
export async function onRequestGet({request,env}) {
  try {
    const ctx=await getAdminContext(request,env);
    if(ctx.error) return authResponse({error:ctx.error},ctx,ctx.error==="unauthorized"?401:403);
    const params=new URLSearchParams({select:"id,company_id,name,email,phone,subject,message,status,created_at",order:"created_at.desc",limit:"100"});
    if(ctx.profile.role==="company_admin") params.set("company_id",`eq.${ctx.profile.company_id}`);
    const r=await supabaseRequest(ctx,`/rest/v1/inquiries?${params}`);
    if(!r.ok) return authResponse({error:"Unable to load inquiries."},ctx,502);
    return authResponse({inquiries:await r.json()},ctx);
  } catch { return json({error:"Admin service unavailable."},503); }
}

export async function onRequestPatch({request,env}) {
  if(!request.headers.get("Origin") || request.headers.get("Origin")!==new URL(request.url).origin) return json({error:"Request origin rejected."},403);
  let body;try{body=await request.json()}catch{return json({error:"Invalid request."},400)}
  if(typeof body.id!=="string"||!/^[0-9a-f-]{36}$/i.test(body.id)||!["new","in_progress","closed","spam"].includes(body.status)) return json({error:"Invalid inquiry update."},400);
  try {
    const ctx=await getAdminContext(request,env);
    if(ctx.error) return authResponse({error:ctx.error},ctx,ctx.error==="unauthorized"?401:403);
    const r=await supabaseRequest(ctx,`/rest/v1/inquiries?id=eq.${encodeURIComponent(body.id)}`,{method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify({status:body.status})});
    if(!r.ok) return authResponse({error:"Unable to update inquiry. Check your access."},ctx,400);
    const rows=await r.json();
    if(!rows.length) return authResponse({error:"Inquiry not found or outside your access scope."},ctx,404);
    return authResponse({inquiry:rows[0]},ctx);
  } catch { return json({error:"Admin service unavailable."},503); }
}
