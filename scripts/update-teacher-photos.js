const BASE_URL = "http://localhost:3000/api";

const TEACHER_UPDATES = [
  {
    name: "Mr. Gyan Tshering Lepcha",
    photo: "https://cgec.org.in/img/Faculty/ME_GTL.jpg",
  },
];

async function updateTeacherPhotos() {
  try {
    console.log("Starting photo updates...");

    // Fetch all teachers first
    const res = await fetch(`${BASE_URL}/teachers`);
    if (!res.ok) throw new Error("Failed to fetch teachers");
    const teachers = await res.json();

    let successCount = 0;

    for (const update of TEACHER_UPDATES) {
      // Fuzzy find teacher by name
      const teacher = teachers.find(
        (t) =>
          t.name.toLowerCase().includes(update.name.toLowerCase()) ||
          update.name.toLowerCase().includes(t.name.toLowerCase()),
      );

      if (teacher) {
        console.log(`Found ${teacher.name}. Updating photo...`);

        const updateRes = await fetch(`${BASE_URL}/teachers/${teacher.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photo: update.photo }),
        });

        if (updateRes.ok) {
          console.log(`✅ Updated photo for ${teacher.name}`);
          successCount++;
        } else {
          console.error(`❌ Failed to update ${teacher.name}`);
        }
      } else {
        console.warn(`⚠️ Teacher not found for update: ${update.name}`);
      }
    }

    console.log(
      `\nPhoto update complete. Updated ${successCount}/${TEACHER_UPDATES.length} teachers.`,
    );
  } catch (error) {
    console.error("Error updating photos:", error);
  }
}

updateTeacherPhotos();
