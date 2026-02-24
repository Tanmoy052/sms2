
const BASE_URL = 'http://localhost:3001/api';

async function listTeachers() {
  try {
    const res = await fetch(`${BASE_URL}/teachers`);
    const teachers = await res.json();
    console.log(`Found ${teachers.length} teachers.`);
    teachers.forEach(t => {
        if (t.name.toLowerCase().includes('test') || t.name.toLowerCase().includes('tanmoy')) {
            console.log(`${t.id}: ${t.name} (${t.department})`);
        }
    });
    
    // Also check credentials if possible, but GET /teachers doesn't return them unless filtered by dept.
    // Let's use fix-data logs to see what's happening, or trust the fix-data logic.
  } catch (error) {
    console.error('Error:', error);
  }
}

listTeachers();
