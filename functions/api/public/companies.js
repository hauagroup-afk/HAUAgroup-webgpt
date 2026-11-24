import { json } from "../_utils.js";
export async function onRequestGet({ env }) {
  const url=(env.SUPABASE_URL||"").replace(/\/$/,""), key=env.SUPABASE_PUBLISHABLE_KEY;
  if(!url||!key) return json({error:"Public data service is not configured."},503);
  const r=await fetch(`${url}/rest/v1/companies?is_active=eq.true&select=id,slug,name,description,brand_color,logo_path,sort_order&order=sort_order.asc`,{headers:{apikey:key,Accept:"application/json"}});
  if(!r.ok) return json({error:"Unable to load companies."},502);
  return json({companies:await r.json()});
}
