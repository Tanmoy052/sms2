
const BASE_URL = 'http://localhost:3001/api';

async function cleanup() {
  const staleId = '699cc333ce4867ddb35ce729';
  console.log(`Deleting stale teacher ${staleId}...`);
  try {
    const res = await fetch(`${BASE_URL}/teachers/${staleId}`, { method: 'DELETE' });
    if (res.ok) {
        console.log('Stale teacher deleted.');
    } else {
        console.log('Failed to delete stale teacher:', res.status);
    }

    // Check Tanmoy Pal
    const listRes = await fetch(`${BASE_URL}/teachers?department=Computer%20Science%20%26%20Engineering`);
    const list = await listRes.json();
    const tanmoy = list.teachers.find(t => t.name.includes('Tanmoy'));
    console.log('Tanmoy Pal:', tanmoy);

  } catch (error) {
    console.error('Error:', error);
  }
}

cleanup();
