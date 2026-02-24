const fs = require('fs');

const DEPARTMENTS = [
  { name: 'Computer Science & Engineering', url: 'https://cgec.org.in/1_cgec_cse_.php' },
  { name: 'Electronics & Communication Engineering', url: 'https://cgec.org.in/2_cgec_ece.php' },
  { name: 'Electrical Engineering', url: 'https://cgec.org.in/3_cgec_ee.php' },
  { name: 'Mechanical Engineering', url: 'https://cgec.org.in/4_cgec_me.php' },
  { name: 'Civil Engineering', url: 'https://cgec.org.in/5_cgec_ce.php' },
  { name: 'Basic Science & Humanities', url: 'https://www.cgec.org.in/30_cgec_bsh.php' },
];

async function scrapeTeachers() {
  console.log('Starting scrape...');

  for (const dept of DEPARTMENTS) {
    console.log(`Processing ${dept.name}...`);
    try {
      const response = await fetch(dept.url);
      const html = await response.text();

      // Extract rows from the table
      // We look for <tr> tags that contain <td> tags
      // This is a rough regex approach
      const rowRegex = /<tr>([\s\S]*?)<\/tr>/g;
      let match;
      const teachers = [];

      while ((match = rowRegex.exec(html)) !== null) {
        const rowContent = match[1];
        
        // Check if this row looks like a faculty row (has image, name, etc.)
        // Usually has 6 columns
        const colRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
        const cols = [];
        let colMatch;
        while ((colMatch = colRegex.exec(rowContent)) !== null) {
          cols.push(colMatch[1].trim());
        }

        if (cols.length >= 5) {
          // Extract data
          // Col 0: Image
          // Col 1: Name (inside <a>)
          // Col 2: Experience
          // Col 3: Designation
          // Col 4: Qualification
          // Col 5: Specialization (optional)

          let photo = '';
          const imgMatch = cols[0].match(/src="([^"]+)"/);
          if (imgMatch) {
            let imgSrc = imgMatch[1];
            // Fix relative paths
            if (imgSrc.startsWith('..')) {
               imgSrc = imgSrc.replace('..', '');
            }
            if (!imgSrc.startsWith('http')) {
                imgSrc = `https://cgec.org.in${imgSrc.startsWith('/') ? '' : '/'}${imgSrc}`;
            }
            photo = imgSrc;
          }

          let name = '';
          // Remove tags from name
          name = cols[1].replace(/<[^>]+>/g, '').trim();

          const experience = cols[2].replace(/<[^>]+>/g, '').trim();
          const designation = cols[3].replace(/<[^>]+>/g, '').trim();
          const qualification = cols[4].replace(/<[^>]+>/g, '').trim();
          const specialization = cols[5] ? cols[5].replace(/<[^>]+>/g, '').trim() : '';

          // Filter out header rows or irrelevant rows
          if (name.toLowerCase().includes('faculty name') || name.toLowerCase().includes('sl. no')) continue;
          if (!name) continue;

          // Construct teacher object
          const teacher = {
            name,
            department: dept.name,
            email: '', // Not available in the table usually, maybe in profile link but we skip for now
            employeeId: `EMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Generate dummy ID
            designation,
            qualification,
            specialization,
            joiningDate: new Date().toISOString(), // Unknown
            phone: '', // Not available
            status: 'active',
            photo
          };

          teachers.push(teacher);
        }
      }

      console.log(`Found ${teachers.length} teachers for ${dept.name}`);

      // Post to API
      for (const teacher of teachers) {
        try {
          // Add a small delay to avoid overwhelming the server/db
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const res = await fetch('http://localhost:3000/api/teachers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(teacher)
          });

          if (res.ok) {
            console.log(`Added: ${teacher.name}`);
          } else {
            const errText = await res.text();
            console.error(`Failed to add ${teacher.name}: ${res.status} ${errText}`);
          }
        } catch (err) {
            // If connection refused, maybe server is not running
            if (err.cause && err.cause.code === 'ECONNREFUSED') {
                console.error("Error: Local server is not running on port 3000. Please run 'npm run dev'.");
                process.exit(1);
            }
            console.error(`Error adding ${teacher.name}:`, err.message);
        }
      }

    } catch (error) {
      console.error(`Error scraping ${dept.name}:`, error);
    }
  }
}

scrapeTeachers();
