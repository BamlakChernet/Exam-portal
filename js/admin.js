function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function approveTeacher(email) {
  const users = getUsers();
  const teacher = users.find(u => u.email === email && u.role === "teacher");
  if (!teacher) return;

  teacher.approved = true;
  saveUsers(users);
  render();
}

function deleteUser(email) {
  const users = getUsers();
  const index = users.findIndex(u => u.email === email);

  if (index === -1) return;
  if (users[index].role === "admin") return; // Admin cannot be deleted

  if (!confirm("Delete this user?")) return;

  users.splice(index, 1);
  saveUsers(users);
  render();
}

function render() {
  const users = getUsers();

  const pendingTeachers = document.getElementById("pendingTeachers");
  const allTeachers = document.getElementById("allTeachers");
  const allStudents = document.getElementById("allStudents");

  pendingTeachers.innerHTML = "";
  allTeachers.innerHTML = "";
  allStudents.innerHTML = "";

  users.forEach(u => {
  
    if (u.role === "teacher" && !u.approved) {
      pendingTeachers.innerHTML += `
        <div class="user-card">
          ${u.name} (${u.email}) - Pending
          <button onclick="approveTeacher('${u.email}')">Approve</button>
          <button onclick="deleteUser('${u.email}')">Delete</button>
        </div>`;
    }

  
    if (u.role === "teacher") {
      allTeachers.innerHTML += `
        <div class="user-card">
          ${u.name} (${u.email}) - ${u.approved ? "✅ Approved" : "⏳ Pending"}
          <button onclick="deleteUser('${u.email}')">Delete</button>
        </div>`;
    }


    if (u.role === "student") {
      allStudents.innerHTML += `
        <div class="user-card">
          ${u.name} (${u.email}) - ${u.approved ? "✅ Approved" : "⏳ Pending"}
          <button onclick="deleteUser('${u.email}')">Delete</button>
        </div>`;
    }
  });
}


render();
