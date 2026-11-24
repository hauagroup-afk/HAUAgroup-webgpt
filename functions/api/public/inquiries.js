import { json, isSameOrigin, validText } from "../_utils.js";
const SLUGS=new Set(["lazeez","rifa-aimans-attire","ruhama-technology","waha-agri"]);
export async function onRequestPost({request,env}) {
  if(!isSameOrigin(request)) return json({error:"Request origin rejected."},403);
  let body;try{body=await request.json()}catch{return json({error:"Invalid request."},400)}
  if(body.website) return json({ok:true});
  if(!validText(body.name,120)||!validText(body.message,4000)) return json({error:"Name and message are required."},400);
  if(body.email && (typeof body.email!=="string"||body.email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))) return json({error:"Enter a valid email address."},400);
  if(body.phone && (typeof body.phone!=="string"||body.phone.length>40)) return json({error:"Phone number is too long."},400);
  if(body.subject && !validText(body.subject,160)) return json({error:"Subject is too long."},400);
  const url=(env.SUPABASE_URL||"").replace(/\/$/,""),key=env.SUPABASE_PUBLISHABLE_KEY;
  if(!url||!key) return json({error:"Inquiry service is not configured."},503);
  let company_id=null;
  if(body.company){
    if(!SLUGS.has(body.company)) return json({error:"Unknown company."},400);
    const cr=await fetch(`${url}/rest/v1/companies?slug=eq.${encodeURIComponent(body.company)}&is_active=eq.true&select=id`,{headers:{apikey:key,Accept:"application/json"}});
    const rows=cr.ok?await cr.json():[];
    if(!rows[0]) return json({error:"Company not found."},404);
    company_id=rows[0].id;
  }
  const insert=await fetch(`${url}/rest/v1/inquiries`,{method:"POST",headers:{apikey:key,"content-type":"application/json",Prefer:"return=minimal"},body:JSON.stringify({company_id,name:body.name.trim(),email:body.email?.trim()||null,phone:body.phone?.trim()||null,subject:body.subject?.trim()||null,message:body.message.trim()})});
  if(!insert.ok) return json({error:"Unable to submit inquiry. Please try again later."},502);
  return json({ok:true},201);
}
