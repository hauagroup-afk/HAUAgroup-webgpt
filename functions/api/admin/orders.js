import { json, isSameOrigin, getAdminContext, authResponse, supabaseRequest } from "../_utils.js";
const UUID=/^[0-9a-f-]{36}$/i;
const STATUSES=["pending_confirmation","confirmed","processing","shipped","delivered","cancelled"];
async function readBody(request){
  const length=Number(request.headers.get("Content-Length")||0);
  if(length>8000)return {error:"Request too large.",status:413};
  let body;try{body=await request.json()}catch{return {error:"Invalid request.",status:400}};
  if(!body||typeof body!=="object"||Array.isArray(body)||JSON.stringify(body).length>8000)return {error:"Invalid request.",status:400};
  return {body};
}
export async function onRequestGet({request,env}){
 try{
  const ctx=await getAdminContext(request,env);
  if(ctx.error)return authResponse({error:ctx.error},ctx,ctx.error==="unauthorized"?401:403);
  const params=new URLSearchParams({select:"id,order_number,company_id,customer_id,customer_name,customer_email,customer_phone,shipping_address,customer_note,order_status,payment_method,payment_status,subtotal,delivery_fee,discount,total,created_at,updated_at",order:"created_at.desc",limit:"100"});
  if(ctx.profile.role==="company_admin")params.set("company_id",`eq.${ctx.profile.company_id}`);
  const r=await supabaseRequest(ctx,`/rest/v1/orders?${params}`);
  if(!r.ok)return authResponse({error:"Unable to load orders."},ctx,502);
  return authResponse({orders:await r.json()},ctx);
 }catch{return json({error:"Order service unavailable."},503)}
}
export async function onRequestPatch({request,env}){
 if(!isSameOrigin(request))return json({error:"Request origin rejected."},403);
 const parsed=await readBody(request);if(parsed.error)return json({error:parsed.error},parsed.status);
 const body=parsed.body;
 if(typeof body.id!=="string"||!UUID.test(body.id)||!STATUSES.includes(body.order_status))return json({error:"Invalid order update."},400);
 try{
  const ctx=await getAdminContext(request,env);
  if(ctx.error)return authResponse({error:ctx.error},ctx,ctx.error==="unauthorized"?401:403);
  const filters=new URLSearchParams({id:`eq.${body.id}`});if(ctx.profile.role==="company_admin")filters.set("company_id",`eq.${ctx.profile.company_id}`);const r=await supabaseRequest(ctx,`/rest/v1/orders?${filters}`, {method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify({order_status:body.order_status})});
  if(!r.ok)return authResponse({error:"Unable to update order. Check your access."},ctx,400);
  const rows=await r.json();
  if(!rows.length)return authResponse({error:"Order not found or outside your access scope."},ctx,404);
  return authResponse({order:rows[0]},ctx);
 }catch{return json({error:"Order service unavailable."},503)}
}
