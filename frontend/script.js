//Authentication check
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123def456"
  };

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();

  // Check if user is logged in
/*   auth.onAuthStateChanged((user) => {
    if (!user) {
      // Not logged in, redirect to login
      window.location.href = "login.html";
    } else {
      // User is logged in, allow page to load
      console.log("Logged in as:", user.email);
    }
  }); */

  //Logout
  // Show user email
  auth.onAuthStateChanged((user) => {
    if (user) {
      document.getElementById("userEmail").textContent = user.email;
    }
  });

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    auth.signOut().then(() => {
      window.location.href = "login.html";
    });
  });

//Load horse databse
async function loadHorses() {
  try {
    // Fetch from the backend endpoint you already wrote
    const  uid = localStorage.getItem("uid"); 
    const response = await fetch(`/api/horse?user_id=${uid}`);
    console.log(uid);
    console.log(response);

    
    if (!response.ok) throw new Error("Failed to load horses");
    
    const horses = await response.json();  // Plain JavaScript objects
    console.log("Horses from API:", horses);
    
    renderHorses(horses);
  } catch (error) {
    console.error(error);
  }
}

function renderHorses(horses) {
  const grid = document.getElementById("horseGrid");
  grid.innerHTML = "";  // clear before repainting
  
  horses.forEach(horse => {
    const imageSrc = horse.imagePath || "uploads/placeholder.png"; 
    const article = document.createElement("article");
    article.innerHTML = `
      <div class="image-container">
        <img src="${imageSrc}" alt="${horse.name}">
      </div>
      <h3>${horse.name}</h3>
      <p>Nacimiento: ${horse.date_of_birth}</p>
    `;

    // Click to go to detail page
    article.addEventListener("click", () => {
      console.log("clicked object");
      window.location.href = `detail.html?id=${horse._id}`;
    });

    grid.appendChild(article);
  });
}

// Run on page load
loadHorses();

//Modal window to add a new horse
const modal = document.getElementById("horseModal");
const addBtn = document.getElementById("addHorse-btn");
const closeBtn = document.querySelector(".close");
const horseForm = document.getElementById("horseForm");

// Open modal
addBtn.addEventListener("click", () => {
  console.log("click en el boton agregar caballo")
  modal.classList.add("active");
});

// Close modal
closeBtn.addEventListener("click", () => {
  modal.classList.remove("active");
});

// Close modal when clicking outside
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.classList.remove("active");
  }
});

// Handle form submission
horseForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("click en save horse btn");
  console.log("Current user:", auth.currentUser);  // ← check this
  console.log("UID:", auth.currentUser?.uid);     // ← check this
  // Get all form data
  const formData = new FormData(horseForm);
  
  // Get selected roles (checkboxes return array)
  const roles = formData.getAll("role");
  const  uid = localStorage.getItem("uid"); 
  // Build object
  const horseData = {
    user_id: uid,
    name: formData.get("name"),
    date_of_birth: formData.get("date_of_birth"),
    roles,  // array of selected roles
    country_of_birth: formData.get("country_of_birth"),
    breeding_place: formData.get("breeding_place"),
    sex: formData.get("sex"),
    color: formData.get("color"),
    breed: formData.get("breed"),
    father: formData.get("father"),
    mother: formData.get("mother"),
    mothers_father: formData.get("mothers_father"),
    head_description: formData.get("head_description"),
    lf_description: formData.get("lf_description"),
    rf_description: formData.get("rf_description"),
    lh_description: formData.get("lh_description"),
    rh_description: formData.get("rh_description"),
    body_description: formData.get("body_description")
  };

    // Create a new FormData with the horse data
  const submitData = new FormData();
  
  // Add all horse fields
  Object.keys(horseData).forEach(key => {
    if (Array.isArray(horseData[key])) {
      horseData[key].forEach(val => submitData.append(key, val));
    } else if (horseData[key]) {
      submitData.append(key, horseData[key]);
    }
  });

  // Add the image file if selected
  const imageFile = formData.get("image");
  if (imageFile) {
    submitData.append("image", imageFile);
  }

  try {
    const response = await fetch("/api/horse", {
      method: "POST",
      body: submitData 
    });

    const result = await response.json();

    if (result.success) {
      console.log("Horse saved:", result);
      modal.classList.remove("active");  // close modal
      horseForm.reset();  // clear form
      loadHorses();  // refresh grid
    } else {
      console.error("Error saving horse:", result.error);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
});