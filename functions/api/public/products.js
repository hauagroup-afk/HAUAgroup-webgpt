import { json } from "../_utils.js";
const SLUGS=new Set(["lazeez","rifa-aimans-attire","ruhama-technology","waha-agri"]);
export async function onRequestGet({ request, env }) {
  const slug=new URL(request.url).searchParams.get("company");
  if(!SLUGS.has(slug)) return json({error:"Unknown company."},404);
  const url=(env.SUPABASE_URL||"").replace(/\/$/,""),key=env.SUPABASE_PUBLISHABLE_KEY;
  if(!url||!key) return json({error:"Catalogue service is not configured."},503);
  const headers={apikey:key,Accept:"application/json"};
  const companyRes=await fetch(`${url}/rest/v1/companies?slug=eq.${encodeURIComponent(slug)}&is_active=eq.true&select=id,slug,name,description,brand_color,logo_path`,{headers});
  if(!companyRes.ok) return json({error:"Unable to load company."},502);
  const companies=await companyRes.json(),company=companies[0];
  if(!company) return json({error:"Company not found."},404);
  const [productsRes,categoriesRes,contentRes]=await Promise.all([
    fetch(`${url}/rest/v1/products?company_id=eq.${company.id}&status=eq.published&select=id,slug,name,summary,description,specifications,image_paths,featured,sort_order,category_id,unit_price,currency&order=sort_order.asc`,{headers}),
    fetch(`${url}/rest/v1/categories?company_id=eq.${company.id}&is_active=eq.true&select=id,slug,name,description,sort_order&order=sort_order.asc`,{headers}),
    fetch(`${url}/rest/v1/site_content?company_id=eq.${company.id}&is_published=eq.true&select=content_key,content`,{headers})
  ]);
  if(!productsRes.ok||!categoriesRes.ok||!contentRes.ok) return json({error:"Unable to load catalogue."},502);
  return json({company,products:await productsRes.json(),categories:await categoriesRes.json(),content:await contentRes.json()});
}
