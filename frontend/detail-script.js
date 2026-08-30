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

// Find all buttons with class "record-btn"
document.querySelectorAll(".record-btn")
  
// Loop through each button
.forEach(btn => {
  
  // ATTACH a listener to this button
  btn.addEventListener("click", (e) => {
    const recordType = e.target.dataset.record;
    console.log("Clicked:", recordType);
  });
});

// Tab switching
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const tabName = e.target.dataset.tab;
    
    // Remove active from all tabs and buttons
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    
    // Add active to clicked tab and button
    document.getElementById(tabName + "-tab").classList.add("active");
    e.target.classList.add("active");
  });
});

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
    console.log("Horse data:", horse); 
    console.log("Passports:", horse.passport); 

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
    currentHorseId = horse._id; //Save horse id for future use

    // BUILD PASSPORT LIST (add this here)
    const passportList = horse.passport && horse.passport.length > 0
    ? horse.passport
        .sort((a, b) => new Date(b.passport_expedition_date) - new Date(a.passport_expedition_date))
        .map(p => {
          const expeditionDate = new Date(p.passport_expedition_date);
          const expirationDate = new Date(expeditionDate.getFullYear() + 1, expeditionDate.getMonth(), expeditionDate.getDate());
          const isExpired = new Date() > expirationDate;
          const statusIcon = isExpired ? "❌" : "✅";
          const formattedDate = expeditionDate.toLocaleDateString("es-ES");
          
          return `
            <div class="passport-item">
              <span>${statusIcon}</span>
              <span>${formattedDate}</span>
            </div>
          `;
        })
        .join("")
    : `<p>No passports registered</p>`;

    // Build vaccine table
        const vaccineList = horse.vaccines && horse.vaccines.length > 0
        ? `
            <table class="vaccine-table">
            <thead>
                <tr>
                <th>Vacuna</th>
                <th>Fecha</th>
                <th>Lote</th>
                <th>Ruta</th>
                <th>Expira</th>
                <th>Veterinario</th>
                </tr>
            </thead>
            <tbody>
                ${horse.vaccines
                .sort((a, b) => new Date(b.vaccine_date) - new Date(a.vaccine_date))
                .map(v => {
                    const vaccineDate = new Date(v.vaccine_date).toLocaleDateString("es-ES");
                    const expirationDate = new Date(v.vaccine_expiration).toLocaleDateString("es-ES");
                    const vetName = v.vet_name?.name || "N/A";
                    
                    return `
                    <tr>
                        <td>${v.vaccine_name}</td>
                        <td>${vaccineDate}</td>
                        <td>${v.batch_number}</td>
                        <td>${v.route}</td>
                        <td>${expirationDate}</td>
                        <td>${vetName}</td>
                    </tr>
                    `;
                })
                .join("")}
            </tbody>
            </table>
        `
        : `<p>No vaccines registered</p>`;
                
        // Build lab test table
        const labTestList = horse.lab_tests && horse.lab_tests.length > 0
        ? `
            <table class="lab-test-table">
            <thead>
                <tr>
                <th>Fecha</th>
                <th>Probado Para</th>
                <th>Tipo de Prueba</th>
                <th>Resultado</th>
                <th>Laboratorio</th>
                <th>Veterinario</th>
                </tr>
            </thead>
            <tbody>
                ${horse.lab_tests
                .sort((a, b) => new Date(b.test_date) - new Date(a.test_date))
                .map(t => {
                    const testDate = new Date(t.test_date).toLocaleDateString("es-ES");
                    const vetName = t.vet_name?.name || "N/A";
                    
                    return `
                    <tr>
                        <td>${testDate}</td>
                        <td>${t.tested_for}</td>
                        <td>${t.test_type}</td>
                        <td>${t.test_result}</td>
                        <td>${t.official_laboratory}</td>
                        <td>${vetName}</td>
                    </tr>
                    `;
                })
                .join("")}
            </tbody>
            </table>
        `
        : `<p>No lab tests registered</p>`;
        
        // Build hauling table
const haulingList = horse.haulings && horse.haulings.length > 0
  ? `
    <table class="hauling-table">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Ciudad</th>
          <th>País</th>
          <th>Propósito</th>
          <th>Destino</th>
          <th>Duración (días)</th>
          <th>Veterinario</th>
        </tr>
      </thead>
      <tbody>
        ${horse.haulings
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map(h => {
            const haulingDate = new Date(h.date).toLocaleDateString("es-ES");
            const vetName = h.vet_name?.name || "N/A";
            
            return `
              <tr>
                <td>${haulingDate}</td>
                <td>${h.city}</td>
                <td>${h.country}</td>
                <td>${h.purpose}</td>
                <td>${h.destination}</td>
                <td>${h.duration}</td>
                <td>${vetName}</td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `
  : `<p>No haulings registered</p>`;


  const sidebarHtml= `
  <div class="sidebar-image">
      <img src="${imageSrc}" alt="${horse.name}">
    </div>
    <div class="sidebar-info">
      <h2>${horse.name}</h2>
      <p><strong>Fecha de nacimiento:</strong> ${formattedDate}</p>
      <p><strong>Edad:</strong> ${age} años</p>
      <a href="https://equisoft.com.co/app/zparticipacion_general.php?Tipo_busqueda=7&id=${horse.fec_register}" target="_blank">
        Ver en equisoft
      </a>
    </div>
  `;
  document.getElementById("horseSidebar").innerHTML = sidebarHtml;
  
  detail.innerHTML = `
  <article class="horse-detail">
   
    <div class="detail-info">
      <br>
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

      <section class="accordion-section">
      <h3 class="accordion-header">Pasaportes</h3>
        <div class="accordion-content">
            <div class="passport-list">
            ${passportList}
            </div>
        </div>
      </section>

      <section class="accordion-section">
      <h3 class="accordion-header">Vacunas</h3>
        <div class="accordion-content">
            <div class="vaccine-list">
            ${vaccineList}
            </div>
        </div>
      </section>

      <section class="accordion-section">
      <h3 class="accordion-header">Examenes de Laboratorio</h3>
        <div class="accordion-content">
            <div class="lab-test-list">
                ${labTestList}
            </div>
        </div>
      </section>

      <section class="accordion-section">
      <h3 class="accordion-header">Traslados</h3>
        <div class="accordion-content">
            <div class="hauling-list">
                ${haulingList}
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

          // BUILD TIMELINE
  const timelineEvents = [];
  
  // Add passports
  if (horse.passport && horse.passport.length > 0) {
    horse.passport.forEach(p => {
      timelineEvents.push({
        date: p.passport_expedition_date,
        type: "passport",
        title: "Pasaporte Expedido",
        details: `Fecha: ${new Date(p.passport_expedition_date).toLocaleDateString("es-ES")}`
      });
    });
  }
  
  // Add vaccines
  if (horse.vaccines && horse.vaccines.length > 0) {
    horse.vaccines.forEach(v => {
      timelineEvents.push({
        date: v.vaccine_date,
        type: "vaccine",
        title: `Vacuna: ${v.vaccine_name}`,
        details: `Fecha: ${new Date(v.vaccine_date).toLocaleDateString("es-ES")} | Lote: ${v.batch_number} | Veterinario: ${v.vet_name?.name || "N/A"}`
      });
    });
  }
  
  // Add lab tests
  if (horse.lab_tests && horse.lab_tests.length > 0) {
    horse.lab_tests.forEach(t => {
      timelineEvents.push({
        date: t.test_date,
        type: "lab",
        title: `Examen: ${t.test_type}`,
        details: `Fecha: ${new Date(t.test_date).toLocaleDateString("es-ES")} | Probado para: ${t.tested_for} | Veterinario: ${t.vet_name?.name || "N/A"}`
      });
    });
  }
  
  // Add haulings
  if (horse.haulings && horse.haulings.length > 0) {
    horse.haulings.forEach(h => {
      timelineEvents.push({
        date: h.date,
        type: "hauling",
        title: `Transporte a ${h.city}, ${h.country}`,
        details: `Fecha: ${new Date(h.date).toLocaleDateString("es-ES")} | Propósito: ${h.purpose} | Duración: ${h.duration} días | Veterinario: ${h.vet_name?.name || "N/A"}`
      });
    });
  }
  
  // Sort by date (newest first)
  timelineEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Build timeline HTML
  const timelineHtml = `
    <div class="timeline">
      ${timelineEvents.map(event => `
        <div class="timeline-item ${event.type}">
          <div class="timeline-date">${new Date(event.date).toLocaleDateString("es-ES")}</div>
          <div class="timeline-header">${event.title}</div>
          <div class="timeline-content">${event.details}</div>
        </div>
      `).join("")}
    </div>
  `;
  
  document.getElementById("horseTimeline").innerHTML = timelineEvents.length > 0 
    ? timelineHtml 
    : `<p>No events registered for this horse</p>`;
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


//Modal window to add passport
const passportModal = document.getElementById("passportModal");
const passportForm = document.getElementById("passportForm");
const closeBtn = passportModal.querySelector(".close");
let currentHorseId = null;

// Close modal
closeBtn.addEventListener("click", () => {
  passportModal.classList.remove("active");
});

// Click outside modal to close
window.addEventListener("click", (event) => {
  if (event.target === passportModal) {
    passportModal.classList.remove("active");
  }
});

// Handle record button clicks
document.querySelectorAll(".record-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const recordType = e.target.dataset.record;
    
    if (recordType === "passport") {
      passportModal.classList.add("active");
    }
    // Add other record types later
  });
});

// Handle passport form submission
passportForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const expeditionDate = document.getElementById("expeditionDate").value;
  
  const passportData = {
    horse_id: currentHorseId,
    user_id: localStorage.getItem("uid"),
    passport_expedition_date: expeditionDate,
    createdAt: new Date().toISOString()
  };

  try {
    const response = await fetch("/api/passport", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(passportData)
    });

    const result = await response.json();

    if (result.success) {
      console.log("Passport saved");
      passportModal.classList.remove("active");
      passportForm.reset();
    } else {
      console.error("Error:", result.error);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
});


//Modal window add vaccines
const vaccineModal = document.getElementById("vaccineModal");
const vaccineForm = document.getElementById("vaccineForm");
const closeVaccineBtn = vaccineModal.querySelector(".close");

// Close modal
closeVaccineBtn.addEventListener("click", () => {
  vaccineModal.classList.remove("active");
});

// Click outside to close
window.addEventListener("click", (event) => {
  if (event.target === vaccineModal) {
    vaccineModal.classList.remove("active");
  }
});

// Load vets and populate dropdown
async function loadVeterinarians() {
  try {
    const response = await fetch(`/api/veterinarian`);
    
    const vets = await response.json();  // ← declare first
    console.log("Vets received:", vets);  // ← then use it
    
    const select = document.getElementById("veterinarian");
    vets.forEach(vet => {
      const option = document.createElement("option");
      option.value = vet._id;
      option.textContent = vet.name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading vets:", error);
  }
}

// Handle vaccine button click
document.querySelectorAll(".record-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const recordType = e.target.dataset.record;
    
    if (recordType === "passport") {
      passportModal.classList.add("active");
    } else if (recordType === "vaccines") {
      loadVeterinarians();  // Load vets when opening modal
      vaccineModal.classList.add("active");
    }
  });
});

// Handle vaccine form submission
vaccineForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const vaccineData = {
    horse_id: currentHorseId,
    user_id: localStorage.getItem("uid"),
    vaccine_date: document.getElementById("vaccineDate").value,
    vaccine_name: document.getElementById("vaccineName").value,
    vaccine_expiration: document.getElementById("vaccineExpiration").value,
    batch_number: document.getElementById("batchNumber").value,
    route: document.getElementById("route").value,
    veterinarian_id: document.getElementById("veterinarian").value
  };

  try {
    const response = await fetch("/api/vaccine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vaccineData)
    });

    const result = await response.json();

    if (result.success) {
      console.log("Vaccine saved");
      vaccineModal.classList.remove("active");
      vaccineForm.reset();
    } else {
      console.error("Error:", result.error);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
});

//Modal window lab tests
const labTestModal = document.getElementById("labTestModal");
const labTestForm = document.getElementById("labTestForm");
const closeLabTestBtn = labTestModal.querySelector(".close");

// Close modal
closeLabTestBtn.addEventListener("click", () => {
  labTestModal.classList.remove("active");
});

// Click outside to close
window.addEventListener("click", (event) => {
  if (event.target === labTestModal) {
    labTestModal.classList.remove("active");
  }
});

// Load vets in lab test dropdown
async function loadLabVeterinarians() {
  try {
    const response = await fetch(`/api/veterinarian`);
    const vets = await response.json();
    
    const select = document.getElementById("labVeterinarian");
    vets.forEach(vet => {
      const option = document.createElement("option");
      option.value = vet._id;
      option.textContent = vet.name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading vets:", error);
  }
}

// Handle lab test button click
document.querySelectorAll(".record-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const recordType = e.target.dataset.record;
    
    if (recordType === "passport") {
      passportModal.classList.add("active");
    } else if (recordType === "vaccines") {
      loadVeterinarians();
      vaccineModal.classList.add("active");
    } else if (recordType === "medical") {
      loadLabVeterinarians();
      labTestModal.classList.add("active");
    }
  });
});

// Handle lab test form submission
labTestForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const labTestData = {
    horse_id: currentHorseId,
    user_id: localStorage.getItem("uid"),
    test_date: document.getElementById("testDate").value,
    tested_for: document.getElementById("testedFor").value,
    test_type: document.getElementById("testType").value,
    test_result: document.getElementById("testResult").value,
    official_laboratory: document.getElementById("laboratory").value,
    veterinarian_id: document.getElementById("labVeterinarian").value
  };

  try {
    const response = await fetch("/api/lab-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(labTestData)
    });

    const result = await response.json();

    if (result.success) {
      console.log("Lab test saved");
      labTestModal.classList.remove("active");
      labTestForm.reset();
    } else {
      console.error("Error:", result.error);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
});


//Hauling modal window
const haulingModal = document.getElementById("haulingModal");
const haulingForm = document.getElementById("haulingForm");
const closeHaulingBtn = haulingModal.querySelector(".close");

// Close modal
closeHaulingBtn.addEventListener("click", () => {
  haulingModal.classList.remove("active");
});

// Click outside to close
window.addEventListener("click", (event) => {
  if (event.target === haulingModal) {
    haulingModal.classList.remove("active");
  }
});

// Load vets in hauling dropdown
async function loadHaulingVeterinarians() {
  try {
    const response = await fetch(`/api/veterinarian`);
    const vets = await response.json();
    
    const select = document.getElementById("haulingVeterinarian");
    vets.forEach(vet => {
      const option = document.createElement("option");
      option.value = vet._id;
      option.textContent = vet.name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading vets:", error);
  }
}

// Handle hauling button click
document.querySelectorAll(".record-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const recordType = e.target.dataset.record;
    
    if (recordType === "passport") {
      passportModal.classList.add("active");
    } else if (recordType === "vaccines") {
      loadVeterinarians();
      vaccineModal.classList.add("active");
    } else if (recordType === "medical") {
      loadLabVeterinarians();
      labTestModal.classList.add("active");
    } else if (recordType === "hauling") {
      loadHaulingVeterinarians();
      haulingModal.classList.add("active");
    }
  });
});

// Handle hauling form submission
haulingForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const haulingData = {
    horse_id: currentHorseId,
    user_id: localStorage.getItem("uid"),
    date: document.getElementById("haulingDate").value,
    city: document.getElementById("haulingCity").value,
    country: document.getElementById("haulingCountry").value,
    purpose: document.getElementById("haulingPurpose").value,
    destination: document.getElementById("haulingDestination").value,
    duration: document.getElementById("haulingDuration").value,
    veterinarian_id: document.getElementById("haulingVeterinarian").value
  };

  try {
    const response = await fetch("/api/hauling", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(haulingData)
    });

    const result = await response.json();

    if (result.success) {
      console.log("Hauling saved");
      haulingModal.classList.remove("active");
      haulingForm.reset();
    } else {
      console.error("Error:", result.error);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
});

// Load vets on page load
loadHaulingVeterinarians();

// Load vets on page load
loadLabVeterinarians();

// Load vets on page load
loadVeterinarians();

// Load on page load
loadHorseDetail();