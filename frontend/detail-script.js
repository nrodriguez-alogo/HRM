const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "halter-90545.firebaseapp.com",
  projectId: "halter-90545",
  storageBucket: "halter-90545.firebasestorage.app",
  messagingSenderId: "544193984335",
  appId: "1:544193984335:web:6f4031be1bd6c5cc50b73a",
  measurementId: "G-G8KK49ZYYS"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

async function loadHorseDetail() {
  // Get horse ID from URL
  const params = new URLSearchParams(window.location.search);
  const horseId = params.get("id");

  if (!horseId) {
    document.getElementById("horseDetail").innerHTML = "<p>No horse ID provided</p>";
    return;
  }

  try {
    // Fetch this specific horse
    const response = await fetch(`/api/horse/${horseId}`);
    
    if (!response.ok) throw new Error("Horse not found");
    
    const horse = await response.json();
    renderHorseDetail(horse);
  } catch (error) {
    console.error(error);
    document.getElementById("horseDetail").innerHTML = `<p>Error loading horse: ${error.message}</p>`;
  }
}

function renderHorseDetail(horse) {
    const detail = document.getElementById("horseDetail");
    const dateString = horse.date_of_birth.split('T')[0];  // gets "2006-12-31"
    const formattedDate = new Date(dateString + "T00:00:00").toLocaleDateString("es-ES");  // Format date
    const imageSrc = horse.imagePath || "uploads/placeholder.png"; // Get image
    const age = calculateAge(horse.date_of_birth); // Calculate age
  
  const sidebarHtml= `
  <div class="sidebar-image">
      <img src="${imageSrc}" alt="${horse.name}">
    </div>
    <div class="sidebar-info">
      <h2>${horse.name}</h2>
      <p><strong>Fecha de nacimiento:</strong> ${formattedDate}</p>
      <p><strong>Edad:</strong> ${age} years</p>
    </div>
  `;
  document.getElementById("horseSidebar").innerHTML = sidebarHtml;
  
  detail.innerHTML = `
  <article class="horse-detail">
   
    <div class="detail-info">
      <h2>${horse.name}</h2>
      
      <!-- Información básica -->
            <!-- Información básica -->
      <section class="accordion-section">
        <h3 class="accordion-header">Información básica</h3>
        <div class="accordion-content">
            <div class="info-grid">
                <div class="info-item">
                    <strong>Fecha de nacimiento:</strong>
                    <span>${formattedDate}</span>
                </div>
                <div class="info-item">
                    <strong>Edad:</strong>
                    <span>${age} years</span>
                </div>
                <div class="info-item">
                    <strong>Sexo:</strong>
                    <span>${horse.sex || "N/A"}</span>
                </div>
                <div class="info-item">
                    <strong>Color:</strong>
                    <span>${horse.color || "N/A"}</span>
                </div>
                <div class="info-item">
                    <strong>Raza:</strong>
                    <span>${horse.breed || "N/A"}</span>
                </div>
                <div class="info-item">
                    <strong>País de nacimiento:</strong>
                    <span>${horse.country_of_birth || "N/A"}</span>
                </div>
                <div class="info-item">
                    <strong>Criadero:</strong>
                    <span>${horse.breeding_place || "N/A"}</span>
                </div>
            </div>
        </div>
      </section>
      
      <!-- Pedigree -->
      <section class="accordion-section">
        <h3 class="accordion-header">Pedigree</h3>
        <div class="accordion-content">
            <div class="info-grid">
                <div class="info-item">
                    <strong>Padre:</strong>
                    <span>${horse.father || "N/A"}</span>
                </div>
                <div class="info-item">
                    <strong>Madre:</strong>
                    <span>${horse.mother || "N/A"}</span>
                </div>
                <div class="info-item">
                    <strong>Padre de la madre:</strong>
                    <span>${horse.mothers_father || "N/A"}</span>
                </div>
            </div>
        </div>
      </section>
      
      <!-- Descripción física -->
      <section class="accordion-section">
        <h3 class="accordion-header">Descripción física</h3>
        <div class="accordion-content">
            <div class="description-grid">
                <div class="info-item">
                    <strong>Cabeza:</strong>
                    <span>${horse.head_description || "N/A"}</span>
                </div>
                <div class="info-item">
                    <strong>LF:</strong>
                    <span>${horse.lf_description || "N/A"}</span>
                </div>
                <div class="info-item">
                    <strong>RF:</strong>
                    <span>${horse.rf_description || "N/A"}</span>
                </div>
                <div class="info-item">
                    <strong>LH:</strong>
                    <span>${horse.lh_description || "N/A"}</span>
                </div>
                <div class="info-item">
                    <strong>RH:</strong>
                    <span>${horse.rh_description || "N/A"}</span>
                </div>
                <div class="info-item">
                    <strong>Cuerpo y torso:</strong>
                    <span>${horse.body_description || "N/A"}</span>
                </div>
            </div>
        </div>
      </section>
    </div>
  </article>
`;

    // Add accordion toggle handlers
    document.querySelectorAll(".accordion-header").forEach(header => {
    header.addEventListener("click", () => {
        const content = header.nextElementSibling;
        const section = header.parentElement;
        
        section.classList.toggle("active");
        content.style.display = section.classList.contains("active") ? "block" : "none";
    });
    });
}

function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Load on page load
loadHorseDetail();