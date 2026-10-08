// Back button
document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "./index.html";
});

// Logout button
document.getElementById("logoutBtn").addEventListener("click", () => {
  auth.signOut().then(() => {
    window.location.href = "login.html";
  });
});
// Load user data on page load
async function loadUserData() {
  try {
    const uid = localStorage.getItem("uid");
    
    if (!uid) {
      console.error("No uid found in localStorage");
      return;
    }

    const response = await fetch(`/api/user/${uid}`);
    const result = await response.json();

    if (result.success) {
      document.getElementById("displayUid").textContent = result.uid;
      document.getElementById("displayEmail").textContent = result.email;
      document.getElementById("displayUserName").textContent = result.userName || "No establecido";
    } else {
      console.error("Error loading user data:", result.error);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

// Run on page load
loadUserData();