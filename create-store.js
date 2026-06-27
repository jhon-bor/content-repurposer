const API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiIxZjQ0ZmM4Mzg4YTQ5NTVlZmExNDEzNDU5NWNiZTdkM2ZkYTZlMTQxOGFkNWYxYzAxYmJhYzg2ZTdjZjRkMTJiZmE2MzE2OGRlOGJjOTdlMiIsImlhdCI6MTc4MjQ4MjgzNC43OTA3NzgsIm5iZiI6MTc4MjQ4MjgzNC43OTA3ODEsImV4cCI6MTc5ODI0MzIwMC4wNDAyMTYsInN1YiI6Ijc0NDU4MDkiLCJzY29wZXMiOltdfQ.E_Nz5HxbFibjsHhbF-yBXdiYs5oHw6aLjFyTac9fDYe34PaRqIt5rf7H3o1KYuvM8aoMktKv5EC4xFbaBVX1Dt_VxUNd0BKnfALgDgUNYjrhL0XczTdxzXHKBIHuBJqcCC7tjV3oLBfH8tO9JEiG9lcNZPiiACLig_cxEGfJuCy0jsKyurRNcOab2Djnf9NCnMKGy9Ms-0oOlyHdvhqzUgisFKgutRoLZqSF42_jQm4_kMlr1qQ9mli0SWlNOcY19oJdeu-Zd3wB1N89zxLS2hlGHkXiLCkzX-w2CnT2EmWyaUvHnsHxyjlRuCSdVf9bLEEhGWR1gNi56nHLATkBgKc7ebGD0oQJwe53T3TDxBLeVjXs7ccl4NknF8rPpQDeW1hmfMPbWf0cAnB8hAj5ZYgVHoBdPA65YoMUfBJ0umS4pJ4dj7or8zbXt6AlgINBFJ00Gv71OqPmD64ZAPL_hjjsjZbmUwubhQWySrHOxszNdpOJCfcRpIEInNTtsLfSIqvqO1j1uEK_sadyNulh3letsqJiB2nyRJBTf4H8GT1a2siUmjkPnPgbr0EcRsu64GdukdT-xevfEDzZwmgWr00K44xb5jXN3ZFIGm4fENDmrBmn6AiCAUF6nkBwpqM0kU936S4zBQIa2ubGP3e5iXglGR7yqIy-vQeDpxEqJvc';

async function createNewStore() {
  try {
    const response = await fetch('https://api.lemonsqueezy.com/v1/stores', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        data: {
          type: 'stores',
          attributes: {
            name: 'Content Repurposer',
            country: 'HK',
            currency: 'USD'
          }
        }
      })
    });
    
    const data = await response.json();
    console.log('Create Store Result:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createNewStore();
