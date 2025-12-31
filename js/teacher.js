//added+++++++
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function approveStudent(email) {
  const users = getUsers();
  const student = users.find(u => u.email === email && u.role === "student");
  if (!student) return;

  // Mark approved and store which teacher approved
  student.approved = true;
  student.approvedBy = JSON.parse(localStorage.getItem('userData')).name || 'Teacher';

  saveUsers(users);  // Save back to localStorage
  loadStudents();    // Refresh the student list
}

function loadStudents() {
  const users = getUsers();
  const students = users.filter(u => u.role === "student");

  const box = document.getElementById("studentList");
  if (!box) return;

  box.innerHTML = "";

  if (students.length === 0) {
    box.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No students registered yet.</p>';
    return;
  }

 students.forEach(student => {
  const studentDiv = document.createElement('div');
  studentDiv.className = 'student-item';
  studentDiv.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    margin: 10px 0;
    background: ${student.approved ? '#e8f5e9' : '#fff3e0'};
    border-radius: 8px;
    border-left: 4px solid ${student.approved ? '#4CAF50' : '#FF9800'};
  `;

  studentDiv.innerHTML = `
    <div>
      <strong>${student.name}</strong><br>
      <small style="color: #666;">${student.email}</small><br>
      <small>Status: <span style="color: ${student.approved ? 'green' : 'orange'}; font-weight: bold;">
        ${student.approved ? '✅ Approved' : '⏳ Pending'}
      </span></small>
      ${student.approvedBy ? `<br><small style="color: #666; font-size: 11px;">Approved by: ${student.approvedBy}</small>` : ''}
    </div>
    <div>
      ${!student.approved ? `<button onclick="approveStudent('${student.email}')">Approve</button>` : ''}
      <button onclick="toggleApproval('${student.email}')">${student.approved ? 'Block' : 'Block'}</button>
    </div>
  `;
  box.appendChild(studentDiv);
});
}

function toggleApproval(studentEmail) {
  let users = getUsers();
  let studentFound = false;
  
  // Find the student by email
  users = users.map(u => {
    if (u.email === studentEmail && u.role === "student") {
      studentFound = true;
      const newStatus = !u.approved;
      
      // Show confirmation
      if (confirm(`Are you sure you want to ${newStatus ? 'APPROVE' : 'BLOCK'} ${u.name}?`)) {
        u.approved = newStatus;
        return u;
      }
    }
    return u;
  });
  
  if (studentFound) {
    saveUsers(users);
    loadStudents(); // Refresh the list
    
    // Find the student name for the alert
    const updatedStudent = users.find(u => u.email === studentEmail);
    if (updatedStudent) {
      alert(`Student "${updatedStudent.name}" has been ${updatedStudent.approved ? 'APPROVED' : 'BLOCKED'}`);
    }
  } else {
    alert("Student not found!");
  }
}
let teacherStudents = JSON.parse(localStorage.getItem('teacherStudents')) || [];
let teacherResults = JSON.parse(localStorage.getItem('teacherResults')) || [];
let teacherSettings = JSON.parse(localStorage.getItem('teacherSettings')) || {
    defaultTime: 10,
    maxAttempts: 1,
    passingScore: 60,
    randomizeQuestions: false,
    showResults: true
};

function parseUploadedFile() {
    const fileInput = document.getElementById('quizFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert("Please select a file first!");
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const content = e.target.result;
        
        if (file.name.endsWith('.csv')) {
            parseCSV(content);
        } else if (file.name.endsWith('.json')) {
            parseJSON(content);
        } else {
            alert("Please upload CSV or JSON file only!");
        }
    };
    
    reader.readAsText(file);
}

function parseCSV(csvContent) {
    try {
        const lines = csvContent.split('\n');
        const questions = [];
        
        // Skip header line if exists
        let startLine = lines[0].toLowerCase().includes('question') ? 1 : 0;
        
        for (let i = startLine; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const parts = line.split(',').map(p => p.trim());
            
            if (parts.length >= 6) {
                questions.push({
                    text: parts[0],
                    options: [parts[1], parts[2], parts[3], parts[4]],
                    answer: parts[5]
                });
            }
        }
        
        if (questions.length === 0) {
            alert("No valid questions found in CSV!");
            return;
        }
        
        // Auto-fill the questions container
        document.getElementById('questionsContainer').innerHTML = '';
        questionCounter = 0;
        
        questions.forEach((q, index) => {
            questionCounter++;
            const questionHTML = `
                <div class="quiz-question" id="question${questionCounter}">
                    <div class="question-header">
                        <h4>Question ${questionCounter} (From File)</h4>
                        <button class="remove-question" onclick="removeQuestion(${questionCounter})">🗑 Remove</button>
                    </div>
                    <div class="form-group">
                        <input type="text" class="question-text" value="${q.text}" placeholder="Enter question text">
                    </div>
                    <div class="form-group">
                        <label>Options:</label>
                        <div>
                            <input type="radio" name="correct${questionCounter}" value="0" ${q.answer === q.options[0] ? 'checked' : ''}>
                            <input type="text" class="option" value="${q.options[0] || ''}" placeholder="Option A">
                        </div>
                        <div>
                            <input type="radio" name="correct${questionCounter}" value="1" ${q.answer === q.options[1] ? 'checked' : ''}>
                            <input type="text" class="option" value="${q.options[1] || ''}" placeholder="Option B">
                        </div>
                        <div>
                            <input type="radio" name="correct${questionCounter}" value="2" ${q.answer === q.options[2] ? 'checked' : ''}>
                            <input type="text" class="option" value="${q.options[2] || ''}" placeholder="Option C">
                        </div>
                        <div>
                            <input type="radio" name="correct${questionCounter}" value="3" ${q.answer === q.options[3] ? 'checked' : ''}>
                            <input type="text" class="option" value="${q.options[3] || ''}" placeholder="Option D">
                        </div>
                    </div>
                </div>
            `;
            document.getElementById('questionsContainer').innerHTML += questionHTML;
        });
        
        alert(`✅ Successfully imported ${questions.length} questions from CSV!`);
        
    } catch (error) {
        alert("Error parsing CSV file: " + error.message);
        console.error("CSV Parse Error:", error);
    }
}

function parseJSON(jsonContent) {
    try {
        const quizData = JSON.parse(jsonContent);
        
        // Auto-fill form fields
        if (quizData.title) {
            document.getElementById('quizTitle').value = quizData.title;
        }
        if (quizData.description) {
            document.getElementById('quizDescription').value = quizData.description;
        }
        if (quizData.timeLimit) {
            document.getElementById('quizTime').value = quizData.timeLimit;
        }
        
        // Load questions
        if (quizData.questions && quizData.questions.length > 0) {
            document.getElementById('questionsContainer').innerHTML = '';
            questionCounter = 0;
            
            quizData.questions.forEach((q, index) => {
                questionCounter++;
                const questionHTML = `
                    <div class="quiz-question" id="question${questionCounter}">
                        <div class="question-header">
                            <h4>Question ${questionCounter} (From File)</h4>
                            <button class="remove-question" onclick="removeQuestion(${questionCounter})">🗑 Remove</button>
                        </div>
                        <div class="form-group">
                            <input type="text" class="question-text" value="${q.text || ''}" placeholder="Enter question text">
                        </div>
                        <div class="form-group">
                            <label>Options:</label>
                            ${q.options.map((opt, optIndex) => `
                                <div>
                                    <input type="radio" name="correct${questionCounter}" value="${optIndex}" ${q.answer === opt ? 'checked' : ''}>
                                    <input type="text" class="option" value="${opt || ''}" placeholder="Option ${String.fromCharCode(65 + optIndex)}">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                document.getElementById('questionsContainer').innerHTML += questionHTML;
            });
            
            alert(`✅ Successfully imported ${quizData.questions.length} questions from JSON!`);
        } else {
            alert("No questions found in JSON file!");
        }
        
    } catch (error) {
        alert("Error parsing JSON file: " + error.message);
        console.error("JSON Parse Error:", error);
    }
}

function downloadTemplate() {
    const template = `question,optionA,optionB,optionC,optionD,correctAnswer
"What is 2+2?",4,3,5,2,4
"Capital of France?",London,Paris,Berlin,Madrid,Paris
"What is the color of the sky?",Red,Green,Blue,Yellow,Blue
"Largest planet in solar system?",Earth,Mars,Jupiter,Saturn,Jupiter`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    alert("Template downloaded! Fill it with your questions and upload.");
}

function removeQuestion(questionId) {
    const questionElement = document.getElementById(`question${questionId}`);
    if (questionElement) {
        questionElement.remove();
        
        const questions = document.querySelectorAll('.quiz-question');
        questions.forEach((q, index) => {
            q.querySelector('h4').textContent = `Question ${index + 1}`;
            q.id = `question${index + 1}`;
        });
        questionCounter = questions.length;
    }
}
 
window.onload = function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userRole = localStorage.getItem('userRole');
    
    if (!isLoggedIn || isLoggedIn !== 'true' || userRole !== 'teacher') {
        alert("Access denied! Teacher login required.");
        window.location.href = "login.html";
        return;
    }
    
    const userData = localStorage.getItem('userData');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            document.getElementById('teacherName').textContent = `Welcome, ${user.name}`;
        } catch (e) {
            console.log("Could not parse user data");
        }
    }
    

    
    if (teacherResults.length === 0) {
        teacherResults = [
            { studentName: "aneni kidanu", quizTitle: "Math Quiz", score: "85%", date: "2025-01-15", status: "Passed" },
            { studentName: "Bamlak chernet", quizTitle: "Math Quiz", score: "92%", date: "2025-01-15", status: "Passed" },
            { studentName: "Azeb yirga", quizTitle: "Math Quiz", score: "45%", date: "2025-01-15", status: "Failed" }
        ];
        localStorage.setItem('teacherResults', JSON.stringify(teacherResults));
    }


    loadStudents();//added+++
   
    loadSettings();
  
};


function logout() {
    //localStorage.clear();
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userData");
    window.location.href = "login-signup.html";
}


function showModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}


let questionCounter = 0;

function showCreateQuiz() {
    showModal('quizModal');
    document.getElementById('questionsContainer').innerHTML = '';
    questionCounter = 0;
    addQuestion(); 
}

function addQuestion() {
    questionCounter++;
    
    // Create unique ID for the question
    const questionId = `question${questionCounter}`;
    
    const questionHTML = `
        <div class="quiz-question" id="${questionId}">
            <div class="question-header">
                <h4>Question ${questionCounter}</h4>
                <button type="button" class="remove-question" onclick="removeQuestion(${questionCounter})">🗑 Remove</button>
            </div>
            <div class="form-group">
                <input type="text" class="question-text" placeholder="Enter question text" id="qText${questionCounter}">
            </div>
            <div class="form-group">
                <label>Options (select correct answer):</label>
                <div class="option-row">
                    <input type="radio" name="correct${questionCounter}" value="0" checked>
                    <input type="text" class="option" placeholder="Option A" id="q${questionCounter}opt0">
                </div>
                <div class="option-row">
                    <input type="radio" name="correct${questionCounter}" value="1">
                    <input type="text" class="option" placeholder="Option B" id="q${questionCounter}opt1">
                </div>
                <div class="option-row">
                    <input type="radio" name="correct${questionCounter}" value="2">
                    <input type="text" class="option" placeholder="Option C" id="q${questionCounter}opt2">
                </div>
                <div class="option-row">
                    <input type="radio" name="correct${questionCounter}" value="3">
                    <input type="text" class="option" placeholder="Option D" id="q${questionCounter}opt3">
                </div>
            </div>
        </div>
    `;
    
    // Get the container
    const container = document.getElementById('questionsContainer');
    
    // Append new question (don't replace)
    container.insertAdjacentHTML('beforeend', questionHTML);
    
    console.log(`Added question ${questionCounter}. Total questions: ${container.children.length}`);
}


async function saveQuiz() {
  const title = document.getElementById('quizTitle').value;
  const description = document.getElementById('quizDescription').value;
  const timeLimit = document.getElementById('quizTime').value;
  
  if (!title.trim()) {
    alert("Please enter a quiz title");
    return;
  }
  
  const questions = [];
  const questionElements = document.querySelectorAll('.quiz-question');
  
  questionElements.forEach((q, index) => {
    const questionText = q.querySelector('.question-text').value;
    const options = Array.from(q.querySelectorAll('.option')).map(input => input.value);
    const correctIndex = parseInt(q.querySelector(`input[name="correct${index+1}"]:checked`).value);
    
    if (questionText.trim() && options.some(opt => opt.trim())) {
      questions.push({
        text: questionText,
        options: options,
        answer: options[correctIndex],
        correctIndex: correctIndex
      });
    }
  });
  
  if (questions.length === 0) {
    alert("Please add at least one question");
    return;
  }
  
  const newQuiz = {
    id: Date.now(),
    title: title,
    description: description,
    timeLimit: parseInt(timeLimit),
    questions: questions,
    createdDate: new Date().toISOString().split('T')[0],
    studentCount: 0
  };
  
  // Show saving indicator
  const saveBtn = document.querySelector('.save-btn');
  const originalText = saveBtn.textContent;
  saveBtn.textContent = '💾 Saving...';
  saveBtn.disabled = true;
  
  try {
    // Try to save to API
    let saveResult;
    if (window.api && window.api.isAvailable()) {
      saveResult = await window.api.saveQuiz(newQuiz);
    } else {
      saveResult = { success: true, local: true };
    }
    
    // Save to localStorage (always)
    let quizzes = JSON.parse(localStorage.getItem("quizzes")) || [];
    quizzes.push(newQuiz);
    localStorage.setItem("quizzes", JSON.stringify(quizzes));
    
    // Also save to teacherQuizzes
    let teacherQuizzes = JSON.parse(localStorage.getItem("teacherQuizzes")) || [];
    teacherQuizzes.push(newQuiz);
    localStorage.setItem("teacherQuizzes", JSON.stringify(teacherQuizzes));
    
    if (saveResult.local) {
      alert(`Quiz "${title}" saved locally (offline mode). It will sync when online.`);
    } else {
      alert(`Quiz "${title}" created successfully with ${questions.length} questions!`);
    }
    
    closeModal('quizModal');
    
    // Clear form
    document.getElementById('quizTitle').value = '';
    document.getElementById('quizDescription').value = '';
    document.getElementById('quizTime').value = '10';
    
  } catch (error) {
    alert('Error saving quiz: ' + error.message);
    console.error('Save quiz error:', error);
  } finally {
    saveBtn.textContent = originalText;
    saveBtn.disabled = false;
  }
}


function showResults() {
    showModal('resultsModal');
    
    // Get fresh results from localStorage
    const teacherResults = JSON.parse(localStorage.getItem('teacherResults')) || [];
    console.log("Teacher Results:", teacherResults); // Debug log
    
    const resultsTable = document.getElementById('resultsTable');
    if (!resultsTable) {
        console.error("resultsTable element not found!");
        return;
    }
    
    resultsTable.innerHTML = ''; // Clear table
    
    if (teacherResults.length === 0) {
        // Show friendly message when no results
        resultsTable.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 30px; color: #666;">
                    <div style="font-size: 24px;">📭</div>
                    <h3>No Results Yet</h3>
                    <p>Quiz results will appear here when students complete quizzes.</p>
                    <p><small>Make sure students have taken the quiz and submitted their answers.</small></p>
                </td>
            </tr>
        `;
    } else {
        // Display all results
        teacherResults.forEach((result, index) => {
            const row = document.createElement('tr');
            
            // Extract numeric score safely
            let scoreNum = 0;
            let scoreDisplay = "0%";
            if (result.score) {
                const scoreStr = result.score.toString();
                scoreNum = parseInt(scoreStr.replace('%', '')) || 0;
                scoreDisplay = result.score;
            }
            
            // Determine status
            let status = result.status;
            let statusColor = "red";
            if (!status) {
                status = scoreNum >= 60 ? "Passed" : "Failed";
            }
            statusColor = status === "Passed" ? "green" : "red";
            
            row.innerHTML = `
                <td>${result.studentName || "Unknown Student"}</td>
                <td>${result.quizTitle || "Unnamed Quiz"}</td>
                <td><strong>${scoreDisplay}</strong></td>
                <td>${result.date || "Unknown Date"}</td>
                <td><span style="color: ${statusColor}; font-weight: bold;">${status}</span></td>
            `;
            resultsTable.appendChild(row);
        });
    }
    
    // Calculate and display statistics
    calculateAndDisplayStats(teacherResults);
}

// Add this new function for statistics
function calculateAndDisplayStats(results) {
    const statsText = document.getElementById('statsText');
    if (!statsText) return;
    
    if (results.length === 0) {
        statsText.innerHTML = `
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
                <h4>Statistics</h4>
                <p><strong>Total Results:</strong> 0</p>
                <p><strong>Average Score:</strong> 0%</p>
                <p><strong>Pass Rate:</strong> 0%</p>
            </div>
        `;
        return;
    }
    
    // Calculate statistics
    let totalScore = 0;
    let passedCount = 0;
    
    results.forEach(result => {
        // Extract numeric score
        let scoreNum = 0;
        if (result.score) {
            const scoreStr = result.score.toString();
            scoreNum = parseInt(scoreStr.replace('%', '')) || 0;
        }
        
        totalScore += scoreNum;
        
        // Check if passed (score >= 60 or status is Passed)
        if (scoreNum >= 60 || result.status === "Passed") {
            passedCount++;
        }
    });
    
    const averageScore = (totalScore / results.length).toFixed(1);
    const passRate = ((passedCount / results.length) * 100).toFixed(1);
    
    statsText.innerHTML = `
        <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; border-left: 4px solid #4CAF50;">
            <h4 style="margin-top: 0; color: #2e7d32;">📊 Statistics</h4>
            <p><strong>Total Results:</strong> ${results.length}</p>
            <p><strong>Average Score:</strong> ${averageScore}%</p>
            <p><strong>Pass Rate:</strong> ${passRate}%</p>
            <p><strong>Passed:</strong> ${passedCount} students</p>
            <p><strong>Failed:</strong> ${results.length - passedCount} students</p>
            <p><strong>Latest Result:</strong> ${results.length > 0 ? results[results.length - 1].date : "None"}</p>
        </div>
    `;
}

function checkResultsData() {
    console.log("=== CHECKING LOCALSTORAGE DATA ===");
    
    // Check all possible storage locations
    const teacherResults = JSON.parse(localStorage.getItem('teacherResults')) || [];
    const studentResults = JSON.parse(localStorage.getItem('studentResults')) || [];
    const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    console.log("1. teacherResults:", teacherResults);
    console.log("2. studentResults:", studentResults);
    console.log("3. quizzes:", quizzes);
    console.log("4. users:", users);
    
    // Show alert with data count
    alert(`Data check:\n
• Teacher Results: ${teacherResults.length}\n
• Student Results: ${studentResults.length}\n
• Quizzes: ${quizzes.length}\n
• Users: ${users.length}`);
    
    return teacherResults;
}
//added+++++++
function showStudents() {
    showModal('studentsModal');
    loadStudents();
}

function showSettings() {
    showModal('settingsModal');
    document.getElementById('defaultTime').value = teacherSettings.defaultTime;
    document.getElementById('maxAttempts').value = teacherSettings.maxAttempts;
    document.getElementById('passingScore').value = teacherSettings.passingScore;
    document.getElementById('randomizeQuestions').checked = teacherSettings.randomizeQuestions;
    document.getElementById('showResults').checked = teacherSettings.showResults;
}

function loadSettings() {
//added+++++++++
    teacherSettings = JSON.parse(localStorage.getItem('teacherSettings')) || teacherSettings;

    if (Object.keys(teacherSettings).length > 0) {
        document.getElementById('defaultTime').value = teacherSettings.defaultTime;
        document.getElementById('maxAttempts').value = teacherSettings.maxAttempts;
        document.getElementById('passingScore').value = teacherSettings.passingScore;
        document.getElementById('randomizeQuestions').checked = teacherSettings.randomizeQuestions;
        document.getElementById('showResults').checked = teacherSettings.showResults;
    }
}

function saveSettings() {
    // Get values from form
    const defaultTime = document.getElementById('defaultTime').value;
    const maxAttempts = document.getElementById('maxAttempts').value;
    const passingScore = document.getElementById('passingScore').value;
    const randomizeQuestions = document.getElementById('randomizeQuestions').checked;
    const showResults = document.getElementById('showResults').checked;
    
    // Validate
    if (!defaultTime || defaultTime < 1 || defaultTime > 120) {
        alert("Time limit must be between 1-120 minutes");
        return;
    }
    
    // Save to teacherSettings
    teacherSettings = {
        defaultTime: parseInt(defaultTime),
        maxAttempts: parseInt(maxAttempts),
        passingScore: parseInt(passingScore),
        randomizeQuestions: randomizeQuestions,
        showResults: showResults
    };
    
    localStorage.setItem('teacherSettings', JSON.stringify(teacherSettings));
    
    // Also save to quizSettings for timer.js
    const quizSettings = {
        time: defaultTime,
        attempts: maxAttempts,
        passingScore: passingScore
    };
    localStorage.setItem("quizSettings", JSON.stringify(quizSettings));
    
    alert("Settings saved successfully!");
    closeModal('settingsModal');
}
