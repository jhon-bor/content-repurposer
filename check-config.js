const API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiIxZjQ0ZmM4Mzg4YTQ5NTVlZmExNDEzNDU5NWNiZTdkM2ZkYTZlMTQxOGFkNWYxYzAxYmJhYzg2ZTdjZjRkMTJiZmE2MzE2OGRlOGJjOTdlMiIsImlhdCI6MTc4MjQ4MjgzNC43OTA3NzgsIm5iZiI6MTc4MjQ4MjgzNC43OTA3ODEsImV4cCI6MTc5ODI0MzIwMC4wNDAyMTYsInN1YiI6Ijc0NDU4MDkiLCJzY29wZXMiOltdfQ.E_Nz5HxbFibjsHhbF-yBXdiYs5oHw6aLjFyTac9fDYe34PaRqIt5rf7H3o1KYuvM8aoMktKv5EC4xFbaBVX1Dt_VxUNd0BKnfALgDgUNYjrhL0XczTdxzXHKBIHuBJqcCC7tjV3oLBfH8tO9JEiG9lcNZPiiACLig_cxEGfJuCy0jsKyurRNcOab2Djnf9NCnMKGy9Ms-0oOlyHdvhqzUgisFKgutRoLZqSF42_jQm4_kMlr1qQ9mli0SWlNOcY19oJdeu-Zd3wB1N89zxLS2hlGHkXiLCkzX-w2CnT2EmWyaUvHnsHxyjlRuCSdVf9bLEEhGWR1gNi56nHLATkBgKc7ebGD0oQJwe53T3TDxBLeVjXs7ccl4NknF8rPpQDeW1hmfMPbWf0cAnB8hAj5ZYgVHoBdPA65YoMUfBJ0umS4pJ4dj7or8zbXt6AlgINBFJ00Gv71OqPmD64ZAPL_hjjsjZbmUwubhQWySrHOxszNdpOJCfcRpIEInNTtsLfSIqvqO1j1uEK_sadyNulh3letsqJiB2nyRJBTf4H8GT1a2siUmjkPnPgbr0EcRsu64GdukdT-xevfEDzZwmgWr00K44xb5jXN3ZFIGm4fENDmrBmn6AiCAUF6nkBwpqM0kU936S4zBQIa2ubGP3e5iXglGR7yqIy-vQeDpxEqJvc';

async function makeRequest(method, endpoint, data = null) {
  const options = {
    method,
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      'Authorization': `Bearer ${API_KEY}`
    }
  };
  
  if (data) {
    options.body = JSON.stringify({ data });
  }
  
  const response = await fetch(`https://api.lemonsqueezy.com/v1${endpoint}`, options);
  const json = await response.json();
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}\n${JSON.stringify(json, null, 2)}`);
  }
  
  return json;
}

async function main() {
  console.log('🔍 检查当前配置...\n');
  
  try {
    console.log('📦 获取产品列表:');
    const products = await makeRequest('GET', '/products?filter[store_id]=414952');
    products.data.forEach(p => {
      console.log(`  - ${p.attributes.name} (ID: ${p.id})`);
    });
    
    console.log('\n🪝 获取 Webhook 列表:');
    const webhooks = await makeRequest('GET', '/webhooks?filter[store_id]=414952');
    webhooks.data.forEach(w => {
      console.log(`  - ${w.attributes.url}`);
      console.log(`    Events: ${w.attributes.events.join(', ')}`);
    });
    
    console.log('\n✅ 配置检查完成!');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  }
}

main();
