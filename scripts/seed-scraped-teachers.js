const fs = require("fs");
const path = require("path");

const BASE_URL = "http://localhost:3000/api";

async function seedTeachers() {
  try {
    const teachersDataPath = path.join(
      __dirname,
      "..",
      "cgec_teachers_data.json",
    );
    if (!fs.existsSync(teachersDataPath)) {
      console.error("Teachers data file not found!");
      return;
    }

    const teachers = JSON.parse(fs.readFileSync(teachersDataPath, "utf8"));
    console.log(`Loaded ${teachers.length} teachers from file.`);

    // First, let's get existing teachers to avoid duplicates (though the API might handle it, better to be safe)
    // Or we can rely on the API's duplicate check if implemented.
    // The fix-data API was created earlier, maybe we can use that logic or just POST and handle errors.

    // Since we want to update photos and IDs, we should probably check if they exist by Name.

    let successCount = 0;
    let failCount = 0;

    // Fetch current teachers to find IDs for updates
    let res = await fetch(`${BASE_URL}/teachers`);
    if (!res.ok) throw new Error("Failed to fetch existing teachers");
    const existingTeachers = await res.json();

    for (const teacher of teachers) {
      // Find if teacher exists (fuzzy match on name)
      const existing = existingTeachers.find(
        (t) =>
          t.name.toLowerCase() === teacher.name.toLowerCase() ||
          t.name.toLowerCase().includes(teacher.name.toLowerCase()) ||
          teacher.name.toLowerCase().includes(t.name.toLowerCase()),
      );

      if (existing) {
        console.log(`Updating ${teacher.name}...`);
        // Update photo and employeeId if missing or different
        const updateData = {};
        if (teacher.photo && existing.photo !== teacher.photo)
          updateData.photo = teacher.photo;
        if (teacher.employeeId && existing.employeeId !== teacher.employeeId)
          updateData.employeeId = teacher.employeeId;
        if (teacher.designation) updateData.designation = teacher.designation;
        if (teacher.qualification)
          updateData.qualification = teacher.qualification;
        if (teacher.specialization)
          updateData.specialization = teacher.specialization;

        if (Object.keys(updateData).length > 0) {
          const updateRes = await fetch(`${BASE_URL}/teachers/${existing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData),
          });
          if (updateRes.ok) successCount++;
          else {
            console.error(`Failed to update ${teacher.name}`);
            failCount++;
          }
        } else {
          console.log(`No changes for ${teacher.name}`);
        }
      } else {
        console.log(`Adding new teacher ${teacher.name}...`);
        // Add new teacher
        const addRes = await fetch(`${BASE_URL}/teachers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(teacher),
        });

        if (addRes.ok) {
          successCount++;
        } else {
          const err = await addRes.json();
          console.error(`Failed to add ${teacher.name}:`, err);
          failCount++;
        }
      }
    }

    console.log(
      `\nSeed complete. Success: ${successCount}, Failed: ${failCount}`,
    );
  } catch (error) {
    console.error("Error seeding teachers:", error);
  }
}

seedTeachers();
