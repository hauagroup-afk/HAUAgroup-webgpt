import { json, isSameOrigin, validText } from "../_utils.js";

const SLUGS = new Set(["lazeez", "rifa-aimans-attire", "ruhama-technology", "waha-agri"]);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function money(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.round(number * 100) : null;
}
function orderNumber() {
  return "HAU-" + crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
}
function headers(key, extra = {}) {
  return { apikey: key, "content-type": "application/json", ...extra };
}

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) return json({ error: "Request origin rejected." }, 403);

  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid request." }, 400); }
  if (body.website) return json({ ok: true }, 201);

  const slug = body.company;
  if (!SLUGS.has(slug)) return json({ error: "Unknown company." }, 400);
  if (!validText(body.customer?.name, 120) || !validText(body.customer?.phone, 40)) {
    return json({ error: "Name and phone number are required." }, 400);
  }
  const email = typeof body.customer.email === "string" ? body.customer.email.trim() : "";
  if (email && (email.length > 254 || !EMAIL.test(email))) return json({ error: "Enter a valid email address." }, 400);
  if (!body.customer.address || typeof body.customer.address !== "object" || Array.isArray(body.customer.address)) {
    return json({ error: "A delivery address is required." }, 400);
  }
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 30) {
    return json({ error: "An order must contain 1 to 30 products." }, 400);
  }
  if (body.note != null && (typeof body.note !== "string" || body.note.length > 1000)) {
    return json({ error: "Order note is too long." }, 400);
  }

  const url = (env.SUPABASE_URL || "").replace(/\/$/, "");
  const publishableKey = env.SUPABASE_PUBLISHABLE_KEY;
  const secretKey = env.SUPABASE_SECRET_KEY;
  if (!url || !publishableKey || !secretKey) {
    return json({ error: "Order service is not configured. Ask the administrator to finish server setup." }, 503);
  }

  // Optional customer session: verify it with Supabase Auth before attaching the order.
  let customerId = null;
  const authorization = request.headers.get("Authorization") || "";
  if (authorization) {
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    if (!match) return json({ error: "Invalid customer session." }, 401);
    const userResponse = await fetch(url + "/auth/v1/user", {
      headers: { apikey: publishableKey, Authorization: "Bearer " + match[1] }
    });
    if (!userResponse.ok) return json({ error: "Customer session expired. Please sign in again." }, 401);
    const user = await userResponse.json();
    customerId = user.id;
    if (user.email && email && user.email.toLowerCase() !== email.toLowerCase()) {
      return json({ error: "Use the email address linked to your customer account." }, 400);
    }
  }

  const adminHeaders = headers(secretKey);
  try {
    const companyResponse = await fetch(
      url + "/rest/v1/companies?slug=eq." + encodeURIComponent(slug) + "&is_active=eq.true&select=id",
      { headers: { apikey: secretKey, Accept: "application/json" } }
    );
    if (!companyResponse.ok) return json({ error: "Unable to verify the selected brand." }, 502);
    const companies = await companyResponse.json();
    if (!companies[0]) return json({ error: "Brand is not available." }, 404);
    const companyId = companies[0].id;

    const quantities = new Map();
    for (const item of body.items) {
      if (!item || typeof item.product_id !== "string" || !/^[0-9a-f-]{36}$/i.test(item.product_id)) {
        return json({ error: "Invalid product in order." }, 400);
      }
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return json({ error: "Product quantity must be between 1 and 99." }, 400);
      }
      quantities.set(item.product_id, (quantities.get(item.product_id) || 0) + quantity);
      if (quantities.get(item.product_id) > 99) return json({ error: "Product quantity is too high." }, 400);
    }

    const ids = [...quantities.keys()];
    const productResponse = await fetch(
      url + "/rest/v1/products?id=in.(" + ids.map(encodeURIComponent).join(",") + ")&company_id=eq." +
      encodeURIComponent(companyId) + "&status=eq.published&select=id,name,slug,unit_price,currency",
      { headers: { apikey: secretKey, Accept: "application/json" } }
    );
    if (!productResponse.ok) return json({ error: "Unable to verify products." }, 502);
    const products = await productResponse.json();
    if (products.length !== ids.length || products.some(p => p.unit_price == null || p.currency !== "BDT")) {
      return json({ error: "One or more products are unavailable or not yet priced." }, 400);
    }

    const items = products.map(product => {
      const quantity = quantities.get(product.id);
      const unitCents = money(product.unit_price);
      return {
        product_id: product.id,
        product_name: product.name,
        sku: product.slug,
        quantity,
        unit_price: (unitCents / 100).toFixed(2),
        line_total: ((unitCents * quantity) / 100).toFixed(2)
      };
    });
    const subtotalCents = items.reduce((sum, item) => sum + money(item.line_total), 0);
    const deliveryCents = body.delivery_fee == null ? 0 : money(body.delivery_fee);
    if (deliveryCents === null || deliveryCents > 10000000) return json({ error: "Invalid delivery fee." }, 400);
    const totalCents = subtotalCents + deliveryCents;
    if (totalCents > 1000000000) return json({ error: "Order total is too high." }, 400);

    const order = {
      order_number: orderNumber(),
      company_id: companyId,
      customer_id: customerId,
      customer_name: body.customer.name.trim(),
      customer_email: email || null,
      customer_phone: body.customer.phone.trim(),
      shipping_address: body.customer.address,
      customer_note: body.note?.trim() || null,
      order_status: "pending_confirmation",
      payment_method: "cod",
      payment_status: "pending",
      subtotal: (subtotalCents / 100).toFixed(2),
      delivery_fee: (deliveryCents / 100).toFixed(2),
      discount: "0.00",
      total: (totalCents / 100).toFixed(2)
    };

    const orderResponse = await fetch(url + "/rest/v1/orders", {
      method: "POST",
      headers: headers(secretKey, { Prefer: "return=representation" }),
      body: JSON.stringify(order)
    });
    if (!orderResponse.ok) return json({ error: "Unable to create order. Please try again later." }, 502);
    const created = (await orderResponse.json())[0];

    const itemResponse = await fetch(url + "/rest/v1/order_items", {
      method: "POST",
      headers: headers(secretKey, { Prefer: "return=minimal" }),
      body: JSON.stringify(items.map(item => ({ ...item, order_id: created.id })))
    });
    if (!itemResponse.ok) {
      await fetch(url + "/rest/v1/orders?id=eq." + encodeURIComponent(created.id), {
        method: "DELETE", headers: { apikey: secretKey }
      });
      return json({ error: "Unable to save order items. Please try again." }, 502);
    }

    if (customerId) {
      await fetch(url + "/rest/v1/customer_profiles", {
        method: "POST",
        headers: headers(secretKey, { Prefer: "resolution=merge-duplicates,return=minimal" }),
        body: JSON.stringify({
          id: customerId,
          display_name: body.customer.name.trim(),
          phone: body.customer.phone.trim(),
          default_address: body.customer.address
        })
      });
    }

    return json({
      ok: true,
      order: {
        order_number: created.order_number,
        status: created.order_status,
        payment_method: created.payment_method,
        payment_status: created.payment_status,
        total: created.total,
        currency: "BDT"
      }
    }, 201);
  } catch {
    return json({ error: "Order service temporarily unavailable." }, 503);
  }
}
