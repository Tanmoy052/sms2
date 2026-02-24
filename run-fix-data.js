
const BASE_URL = 'http://localhost:3001/api';

async function fixData() {
  try {
    console.log('Triggering data fix...');
    const res = await fetch(`${BASE_URL}/admin/fix-data`);
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Failed to fix data: ${res.status} ${res.statusText} - ${errBody}`);
    }
    const data = await res.json();
    console.log('Fix Data Result:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

fixData();
