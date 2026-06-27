const REFRESH_TOKEN = 'CY5Pki0Dz7PLI49sySPcY6dO2-N58y3mJStpmzfLnv7';

async function refreshToken() {
  try {
    const response = await fetch('https://backboard.railway.com/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: REFRESH_TOKEN
      })
    });
    
    const data = await response.json();
    console.log('Token refresh result:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

refreshToken();
