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
