// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDKfwQAjEAEVuUCxCbX180UQP77wtzvBXc",
  authDomain: "halter-90545.firebaseapp.com",
  projectId: "halter-90545",
  storageBucket: "halter-90545.firebasestorage.app",
  messagingSenderId: "544193984335",
  appId: "1:544193984335:web:6f4031be1bd6c5cc50b73a",
  measurementId: "G-G8KK49ZYYS"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
console.log("Firebase initialized:", auth); 

// Toggle between login and signup forms
function toggleForms() {
  document.getElementById("loginForm").style.display = 
    document.getElementById("loginForm").style.display === "none" ? "block" : "none";
  document.getElementById("signupForm").style.display = 
    document.getElementById("signupForm").style.display === "none" ? "block" : "none";
}

// LOGIN
document.getElementById("loginFormElement").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const errorEl = document.getElementById("loginError");

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    // Store uid in localStorage
    localStorage.setItem("uid", userCredential.user.uid);
    console.log(userCredential.user.uid);
    window.location.href = "index.html";
  } catch (error) {
    errorEl.textContent = error.message;
  }
});

// SIGNUP
document.getElementById("signupFormElement").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const errorEl = document.getElementById("signupError");
  const userName = document.getElementById("signupName").value;  // ← add this

  

  try {

    // Firebase creates the user
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        console.log(email);
    const uid = userCredential.user.uid;  // ← get Firebase uid
     // Store uid in localStorage
    localStorage.setItem("uid", userCredential.user.uid);
    console.log("User created with uid:", uid);
    console.log(userName);
    
     // Also save to MongoDB
    const response = await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, email, userName })
    });
    
    const result = await response.json();
    console.log("User saved to MongoDB:", result);

    window.location.href = "index.html";
    console.log("User created successfully");
  } catch (error) {
    console.error("Full error:", error); 
    errorEl.textContent = error.message;
  }
});

// Check if already logged in
/* auth.onAuthStateChanged((user) => {
    
console.log("Is logged in:", user ? true : false);
  if (user) {
    window.location.href = "index.html";
  }
}); */