const API_BASE = "http://localhost/IP2-project/F/Exam-portal-2/public/index.php?url=";

async function apiRequest(path, options = {}) {
  const response = await fetch(API_BASE + path, {
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({
    success: false,
    message: "Invalid server response",
  }));

  if (!response.ok || data.success === false || data.status === "error") {
    throw new Error(data.message || data.error || "Request failed");
  }

  return data;
}

window.api = {

  login(email, password, role) {
    return apiRequest("auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    }).then(res => res.user);
  },

  signup(userData) {
    return apiRequest("auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }).then(res => res.user);
  },

  logout() {
    return apiRequest("auth/logout", { method: "POST" });
  },

  saveQuiz(quizData) {
    return apiRequest("quiz/create", {
      method: "POST",
      body: JSON.stringify(quizData),
    });
  },

  getQuizzes() {
    return apiRequest("quiz/list")
      .then(res => res.quizzes || []);
  },

  submitResult(result) {
    return apiRequest("results/save", {
      method: "POST",
      body: JSON.stringify(result),
    });
  },

  getResults() {
    return apiRequest("results/list")
      .then(res => res.results || []);
  },

  getStudents() {
    return apiRequest("teacher/students")
      .then(res => res.students || []);
  },

  approveStudent(id, approved) {
    return apiRequest("teacher/approve", {
      method: "POST",
      body: JSON.stringify({ id, approved }),
    });
  },

  getUsers() {
    return apiRequest("admin/users")
      .then(res => res.data || []);
  },

  approveTeacher(id, approved) {
    return apiRequest("admin/approve-teacher", {
      method: "POST",
      body: JSON.stringify({ id, approved }),
    });
  },

  deleteUser(id) {
    return apiRequest("admin/delete", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
  },

  getSettings() {
    return apiRequest("settings/get")
      .then(res => res.settings);
  },

  saveSettings(settings) {
    return apiRequest("settings/save", {
      method: "POST",
      body: JSON.stringify(settings),
    });
  },
};