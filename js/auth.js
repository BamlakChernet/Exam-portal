(function seedAdminAlways() {
  let users = JSON.parse(localStorage.getItem("users")) || [];

  const adminEmail = "admin@gmail.com";

  if (!users.some(u => u.email === adminEmail)) {
    users.push({
      name: "Admin admins",
      email: adminEmail,
      password: "123456",
      role: "admin",
      approved: true
    });
    localStorage.setItem("users", JSON.stringify(users));
  }
})();
 function showLogin() {
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('signupForm').classList.add('hidden');
}

function showSignup() {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('signupForm').classList.remove('hidden');
}
window.onload = function () {
  const showForm = localStorage.getItem('showForm');

  if (showForm === 'signup') {
    showSignup();
    localStorage.removeItem('showForm');
  } else {
    showLogin();
  }
};

async function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const role = document.getElementById('loginRole').value;

  if (!email || !password) {
    document.getElementById('loginError').innerText = 'Please enter email and password';
    return;
  }

  const loginBtn = document.querySelector('#loginForm button');
  const originalText = loginBtn.textContent;
  loginBtn.textContent = 'Logging in...';
  loginBtn.disabled = true;

  try {
    let user = null;
    if (window.api && window.api.isAvailable()) {
      try {
        user = await window.api.login(email, password, role);
      } catch (apiError) {
        console.log('API login failed, using localStorage fallback');
      }
    }
    
    if (!user) {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      user = users.find(
        u => u.email === email && u.password === password && u.role === role
      );
    }

    if (!user) {
      document.getElementById('loginError').innerText =
        'Invalid email, password, or role';
      return;
    }

    if (user.role === "student" && !user.approved) {
      alert("Waiting for teacher approval");
      return;
    }

    localStorage.setItem('userData', JSON.stringify(user));
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);

    loginBtn.textContent = '✓ Success!';

    if (role === 'admin') {
  window.location.href = 'admin.html';
} else if (role === 'teacher') {
  if (!user.approved) {
    alert("Waiting for admin approval");
    return;
  }
  window.location.href = 'teacher.html';
} else {
  if (!user.approved) {
    alert("Waiting for admin approval");
    return;
  }
  window.location.href = 'Exam-portal.html';
}
  } catch (error) {
    document.getElementById('loginError').innerText = 'Login failed. Please try again.';
    console.error('Login error:', error);
  } finally {
    setTimeout(() => {
      loginBtn.textContent = originalText;
      loginBtn.disabled = false;
    }, 1000);
  }
}
async function signup() {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;
  const role = document.getElementById('signupRole').value;

  if (!name || !email || !password) {
    document.getElementById('signupError').innerText = 'Please fill in all fields';
    return;
  }

  if (password.length < 6) {
    document.getElementById('signupError').innerText =
      'Password must be at least 6 characters';
    return;
  }

  if (password !== confirmPassword) {
    document.getElementById('signupError').innerText = 'Passwords do not match';
    return;
  }

  const signupBtn = document.querySelector('#signupForm button');
  const originalText = signupBtn.textContent;
  signupBtn.textContent = 'Creating account...';
  signupBtn.disabled = true;

  try {
    const userData = {
      name,
      email,
      password,
      role,
      approved: role === "student" ? false : false
    };

    let user = null;
    if (window.api && window.api.isAvailable()) {
      try {
        user = await window.api.signup(userData);
      } catch (apiError) {
        console.log('API signup failed, using localStorage fallback');
      }
    }
    
    if (!user) {
      let users = JSON.parse(localStorage.getItem('users')) || [];
      
      if (users.some(u => u.email === email)) {
        document.getElementById('signupError').innerText = 'Email already registered';
        return;
      }
      
      user = userData;
      users.push(user);
      localStorage.setItem('users', JSON.stringify(users));
    }
    localStorage.setItem('userData', JSON.stringify(user));
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);

    signupBtn.textContent = '✓ Account created!';
    setTimeout(() => {
      if (role ) {
        window.location.href = 'login-signup.html';
      } 
    }, 500);
  } catch (error) {
    document.getElementById('signupError').innerText = 
      error.message || 'Signup failed. Please try again.';
    console.error('Signup error:', error);
  } finally {
    setTimeout(() => {
      signupBtn.textContent = originalText;
      signupBtn.disabled = false;
    }, 1000);
  }
}
