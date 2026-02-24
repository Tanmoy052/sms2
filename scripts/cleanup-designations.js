const BASE_URL = "http://localhost:3000/api";

const DEPT_MAPPINGS = {
  // Longer specific phrases first to avoid partial matches
  "Computer Science & Engineering Department": "CSE Department",
  "Electronics & Communication Engineering Department": "ECE Department",
  "Electrical Engineering Department": "EE Department",
  "Mechanical Engineering Department": "ME Department",
  "Civil Engineering Department": "CE Department",
  "Basic Science & Humanities Department": "BSH Department",

  // Then standard names
  "Computer Science & Engineering": "CSE",
  "Electronics & Communication Engineering": "ECE",
  "Electrical Engineering": "EE",
  "Mechanical Engineering": "ME",
  "Civil Engineering": "CE",
  "Basic Science & Humanities": "BSH",
};

async function cleanupDesignations() {
  try {
    console.log("Fetching teachers...");
    const res = await fetch(`${BASE_URL}/teachers`);
    if (!res.ok) throw new Error("Failed to fetch teachers");
    const teachers = await res.json();

    let updatedCount = 0;

    for (const teacher of teachers) {
      let newDesignation = teacher.designation;

      // Replace long department names with short codes in designation
      // We iterate through our mappings
      for (const [longName, shortName] of Object.entries(DEPT_MAPPINGS)) {
        if (newDesignation.includes(longName)) {
          newDesignation = newDesignation.replace(longName, shortName);
        }
      }

      // Additional check for "in CSE Department" -> "in CSE" if user prefers just "CSE"
      // The user said "long name change to short name like Computer Science & Engineering to cse"
      // So "Assistant Professor in Computer Science & Engineering Department" -> "Assistant Professor in CSE Department"
      // This is handled by the map above.

      if (newDesignation !== teacher.designation) {
        console.log(
          `Updating ${teacher.name}: "${teacher.designation}" -> "${newDesignation}"`,
        );

        const updateRes = await fetch(`${BASE_URL}/teachers/${teacher.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ designation: newDesignation }),
        });

        if (updateRes.ok) updatedCount++;
        else console.error(`Failed to update ${teacher.name}`);
      }
    }

    console.log(`\nCleanup complete. Updated ${updatedCount} designations.`);
  } catch (error) {
    console.error("Error cleaning designations:", error);
  }
}

cleanupDesignations();
