const BASE_URL = "http://localhost:3001/api";

async function run() {
  try {
    console.log("Creating teacher...");
    const createRes = await fetch(`${BASE_URL}/teachers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Teacher",
        email: "test@test.com",
        department: "Computer Science & Engineering",
        employeeId: "TEST001",
        designation: "Lecturer",
        phone: "1234567890",
        qualification: "M.Tech",
        specialization: "Testing",
        joiningDate: "2024-01-01",
        status: "active",
      }),
    });

    if (!createRes.ok) {
      throw new Error(
        `Failed to create teacher: ${createRes.status} ${createRes.statusText}`,
      );
    }

    const teacher = await createRes.json();
    console.log("Created teacher:", teacher.id, teacher.name);

    // Get teacher credentials (via listing)
    const listRes = await fetch(
      `${BASE_URL}/teachers?department=Computer%20Science%20%26%20Engineering`,
    );
    const list = await listRes.json();
    const created = list.teachers.find((t) => t.id === teacher.id);
    console.log("Initial username:", created?.username);

    if (created?.username !== "test_teacher") {
      console.error("Expected username test_teacher, got", created?.username);
    }

    console.log("Updating teacher name...");
    const updateRes = await fetch(`${BASE_URL}/teachers/${teacher.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Renamed" }),
    });

    if (!updateRes.ok) {
      throw new Error(
        `Failed to update teacher: ${updateRes.status} ${updateRes.statusText}`,
      );
    }

    const updated = await updateRes.json();
    console.log("Updated teacher:", updated.name);

    // Wait a moment for DB update propagation if necessary
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check credentials again
    const listRes2 = await fetch(
      `${BASE_URL}/teachers?department=Computer%20Science%20%26%20Engineering`,
    );
    const list2 = await listRes2.json();
    const updatedCred = list2.teachers.find((t) => t.id === teacher.id);
    console.log("Updated username:", updatedCred?.username);

    if (updatedCred?.username !== "test_renamed") {
      console.error(
        "Expected username test_renamed, got",
        updatedCred?.username,
      );
    } else {
      console.log("SUCCESS: Username updated correctly.");
    }

    console.log("Deleting teacher...");
    await fetch(`${BASE_URL}/teachers/${teacher.id}`, { method: "DELETE" });
    console.log("Teacher deleted.");
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
