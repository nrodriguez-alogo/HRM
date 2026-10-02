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

// Find all buttons with class "record-btn" GIT ADD
document.querySelectorAll(".record-btn")
    // Loop through each button
    .forEach(btn => {
    
    // ATTACH a listener to this button
    btn.addEventListener("click", (e) => {
        const recordType = e.target.dataset.record;
        console.log("Clicked:", recordType);
    });
    });

//Date handling
function formatDateString(dateString) {
  // Parse YYYY-MM-DD format without timezone issues
  const date = dateString.split('T')[0]; // Get just the date part "YYYY-MM-DD"
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

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
    const formattedDate = formatDateString(dateString);  // Format date
    const imageSrc = horse.imagePath || "uploads/placeholder.png"; // Get image
    const age = calculateAge(horse.date_of_birth); // Calculate age
    currentHorseId = horse._id; //Save horse id for future use

    // BUILD PASSPORT LIST (add this here)
    const passportList = horse.passport && horse.passport.length > 0
  ? `
    <div class="passport-cards">
      ${horse.passport
        .sort((a, b) => new Date(b.passport_expedition_date) - new Date(a.passport_expedition_date))
        .map(p => {
          const expeditionDate = new Date(p.passport_expedition_date);
          const expirationDate = new Date(expeditionDate.getFullYear() + 1, expeditionDate.getMonth(), expeditionDate.getDate());
          const isExpired = new Date() > expirationDate;
          const statusIcon = isExpired ? "❌ Vencido" : "✅ Vigente";
          const statusClass = isExpired ? "expired" : "active";
          const formattedDate = formatDateString(p.passport_expedition_date);
          const expirationFormatted = formatDateString(new Date(expirationDate).toISOString().split('T')[0]);
          
          const fileSection = p.file_path 
            ? `
              <div class="passport-files">
                <a href="${p.file_path}" target="_blank" class="file-badge">
                  <span class="file-icon">📄</span>
                  <span class="file-name">${p.file_name}</span>
                </a>
              </div>
            `
            : `<div class="passport-files"><span class="no-file">Sin archivo adjunto</span></div>`;

          return `
            <div class="passport-card ${statusClass}">
              <div class="passport-header">
                <div class="passport-status ${statusClass}">${statusIcon}</div>
                <div class="passport-dates">
                  <div class="date-item">
                    <span class="label">Expedido:</span>
                    <span class="value">${formattedDate}</span>
                  </div>
                  <div class="date-item">
                    <span class="label">Vence:</span>
                    <span class="value">${expirationFormatted}</span>
                  </div>
                </div>
              </div>
              ${fileSection}
            </div>
          `;
        })
        .join("")}
    </div>
  `
  : `<p class="no-records">No passports registered</p>`;

    // Build vaccine table
const vaccineList = horse.vaccines && horse.vaccines.length > 0
  ? `
    <div class="vaccine-cards">
      ${horse.vaccines
        .sort((a, b) => new Date(b.vaccine_date) - new Date(a.vaccine_date))
        .map(v => {
          const vaccineDate = new Date(v.vaccine_date).toLocaleDateString("es-ES");
          const expirationDate = new Date(v.vaccine_expiration).toLocaleDateString("es-ES");
          const vetName = v.vet_name?.name || "N/A";
          
          const filesHtml = v.files && v.files.length > 0
            ? `
              <div class="vaccine-files">
                <strong>Archivos:</strong>
                <div class="files-grid">
                  ${v.files.map(f => `
                    <a href="${f.path}" target="_blank" class="file-link">
                      <span class="file-icon">📄</span>
                      <span class="file-name">${f.name}</span>
                    </a>
                  `).join("")}
                </div>
              </div>
            `
            : `<div class="vaccine-files"><span class="no-files">Sin archivos</span></div>`;

          return `
            <div class="vaccine-card">
              <div class="vaccine-header">
                <h3>${v.vaccine_name}</h3>
                <span class="vaccine-batch">${v.batch_number || "-"}</span>
              </div>
              
              <div class="vaccine-details">
                <div class="detail-item">
                  <span class="label">Fecha:</span>
                  <span class="value">${vaccineDate}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Vence:</span>
                  <span class="value">${expirationDate}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Ruta:</span>
                  <span class="value">${v.route || "-"}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Veterinario:</span>
                  <span class="value">${vetName}</span>
                </div>
              </div>
              
              ${filesHtml}
            </div>
          `;
        })
        .join("")}
    </div>
  `
  : `<p class="no-records">No vaccines registered</p>`;
                
  const labTestList = horse.lab_tests && horse.lab_tests.length > 0
  ? `
    <div class="lab-test-grid">
      ${horse.lab_tests
        .sort((a, b) => new Date(b.test_date) - new Date(a.test_date))
        .map(t => {
          const testDate = formatDateString(t.test_date);
          const vetName = t.vet_name?.name || "N/A";
          
          const filesHtml = t.files && t.files.length > 0
            ? t.files.map(f => `
                <a href="${f.path}" target="_blank" class="lab-test-file-badge">
                  ${f.name}
                </a>
              `).join("")
            : `<p style="color: #999; font-size: 12px; font-style: italic;">Sin archivos</p>`;

          return `
            <div class="lab-test-card">
              <div class="lab-test-card-header">
                <h3>${t.test_type}</h3>
                <span class="lab-test-type-badge">${t.tested_for}</span>
              </div>
              
              <div class="lab-test-card-details">
                <div class="lab-test-detail-column">
                  <p>
                    <span class="lab-test-label">FECHA:</span>
                    <span class="lab-test-value">${testDate}</span>
                  </p>
                  <p>
                    <span class="lab-test-label">LABORATORIO:</span>
                    <span class="lab-test-value">${t.official_laboratory}</span>
                  </p>
                </div>
                <div class="lab-test-detail-column">
                  <p>
                    <span class="lab-test-label">RESULTADO:</span>
                    <span class="lab-test-value">${t.test_result}</span>
                  </p>
                  <p>
                    <span class="lab-test-label">VETERINARIO:</span>
                    <span class="lab-test-value">${vetName}</span>
                  </p>
                </div>
              </div>
              
              <div class="lab-test-card-files">
                <strong>Archivos:</strong>
                <div class="lab-test-file-badges">
                  ${filesHtml}
                </div>
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
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
            const haulingDate = formatDateString(h.date);
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

  const medicalProcedureList = horse.medical_procedures && horse.medical_procedures.length > 0
  ? `
    <div class="procedure-grid">
      ${horse.medical_procedures
        .sort((a, b) => new Date(b.procedure_date) - new Date(a.procedure_date))
        .map((proc, index) => {
          const procDate = formatDateString(proc.procedure_date);
          const vetName = proc.vet_name?.name || "N/A";
          
          const filesHtml = proc.files && proc.files.length > 0
            ? proc.files.map(f => `
                <a href="${f.path}" target="_blank" class="procedure-file-badge">
                  ${f.name}
                </a>
              `).join("")
            : `<p style="color: #999; font-size: 12px; font-style: italic;">Sin archivos</p>`;

          return `
            <div class="procedure-card">
              <div class="procedure-card-header">
                <h3>${proc.procedure_name}</h3>
                <span class="procedure-date-badge">${procDate}</span>
              </div>
              
              <div class="procedure-card-details">
                <div class="procedure-detail-column">
                  <p>
                    <span class="procedure-label">DESCRIPCIÓN:</span>
                    <span class="procedure-value">${proc.description}</span>
                  </p>
                  <p>
                    <span class="procedure-label">VETERINARIO:</span>
                    <span class="procedure-value">${vetName}</span>
                  </p>
                </div>
                <div class="procedure-detail-column">
                  <p>
                    <span class="procedure-label">CUIDADOS POSTOPERATORIOS:</span>
                    <span class="procedure-value">${proc.aftercare}</span>
                  </p>
                  ${proc.recommendations ? `
                    <p>
                      <span class="procedure-label">RECOMENDACIONES:</span>
                      <span class="procedure-value">${proc.recommendations}</span>
                    </p>
                  ` : ""}
                </div>
              </div>
              
              <div class="procedure-card-files">
                <strong>Archivos:</strong>
                <div class="procedure-file-badges">
                  ${filesHtml}
                </div>
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `
  : `<p>No medical procedures registered</p>`;

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
  
  // Build photo gallery
    const photoGallery = `
      <div class="photo-gallery">
        <div class="photo-item">
          <label>Frontal</label>
          <img src="${horse.photo_front || 'uploads/front.webp'}" alt="Frontal">
        </div>
        <div class="photo-item">
          <label>Lado Izquierdo</label>
          <img src="${horse.photo_left || 'uploads/left.png'}" alt="Lado Izquierdo">
        </div>
        <div class="photo-item">
          <label>Lado Derecho</label>
          <img src="${horse.photo_right || 'uploads/right.png'}" alt="Lado Derecho">
        </div>
        <div class="photo-item">
          <label>Trasera</label>
          <img src="${horse.photo_behind || 'uploads/behind.jpg'}" alt="Trasera">
        </div>
      </div>
    `;

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
            <br>
           ${photoGallery} 
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
      <h3 class="accordion-header">Procedimientos Médicos</h3>
        <div class="accordion-content">
            <div class="procedure-list">
                ${medicalProcedureList}
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
        details: `Fecha: ${formatDateString(p.passport_expedition_date)}`
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
        details: `Fecha: ${formatDateString(v.vaccine_date)} | Lote: ${v.batch_number} | Veterinario: ${v.vet_name?.name || "N/A"}`
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
        details: `Fecha: ${formatDateString(t.test_date)} | Probado para: ${t.tested_for} | Veterinario: ${t.vet_name?.name || "N/A"}`
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
        details: `Fecha: ${formatDateString(h.date)} | Propósito: ${h.purpose} | Duración: ${h.duration} días | Veterinario: ${h.vet_name?.name || "N/A"}`
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
          <div class="timeline-date">${formatDateString(event.date)}</div>
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

passportForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append("horse_id", currentHorseId);
  formData.append("user_id", localStorage.getItem("uid"));
  formData.append("passport_expedition_date", document.getElementById("expeditionDate").value);
  
  const fileInput = document.getElementById("passportFile");
  if (fileInput && fileInput.files.length > 0) {
    formData.append("passport_file", fileInput.files[0]);
  }

  try {
    const response = await fetch("/api/passport", {
      method: "POST",
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      passportModal.classList.remove("active");
      passportForm.reset();
      loadHorseDetail();
    } else {
      alert("Error: " + result.error);
    }
  } catch (error) {
    console.error("Error:", error);
  }
});


//Modal window add vaccines
const vaccineModal = document.getElementById("vaccineModal");
const vaccineForm = document.getElementById("vaccineForm");
const closeVaccineBtn = vaccineModal.querySelector(".close");

// Keep array of accumulated files
let vaccineFiles = [];

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
    
    const vets = await response.json();
    console.log("Vets received:", vets);
    
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
      loadVeterinarians();
      vaccineModal.classList.add("active");
    }
  });
});

// Update file preview with accumulated files
function updateFilePreview() {
  const preview = document.getElementById("filePreview");
  preview.innerHTML = "";
  
  if (vaccineFiles.length > 0) {
    preview.innerHTML = `<strong>Archivos seleccionados (${vaccineFiles.length}):</strong>`;
    
    const list = document.createElement("ul");
    list.className = "file-list";
    
    vaccineFiles.forEach((file, index) => {
      const item = document.createElement("li");
      item.style.display = "flex";
      item.style.justifyContent = "space-between";
      item.style.alignItems = "center";
      
      const name = document.createElement("span");
      name.textContent = file.name;
      
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.textContent = "✕";
      removeBtn.style.background = "none";
      removeBtn.style.border = "none";
      removeBtn.style.color = "#d32f2f";
      removeBtn.style.cursor = "pointer";
      removeBtn.style.fontSize = "16px";
      removeBtn.addEventListener("click", () => {
        vaccineFiles.splice(index, 1);
        updateFilePreview();
      });
      
      item.appendChild(name);
      item.appendChild(removeBtn);
      list.appendChild(item);
    });
    
    preview.appendChild(list);
  }
}

// VACCINE FILE PREVIEW LISTENER - Accumulate files instead of replacing
const fileInput = document.getElementById("vaccineFiles");
fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    for (let file of fileInput.files) {
      vaccineFiles.push(file);
    }
  }
  
  // Clear the input so user can select again from different folder
  fileInput.value = "";
  
  // Update preview
  updateFilePreview();
});

// Handle vaccine form submission
vaccineForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append("horse_id", currentHorseId);
  formData.append("user_id", localStorage.getItem("uid"));
  formData.append("vaccine_date", document.getElementById("vaccineDate").value);
  formData.append("vaccine_name", document.getElementById("vaccineName").value);
  formData.append("vaccine_expiration", document.getElementById("vaccineExpiration").value);
  formData.append("batch_number", document.getElementById("batchNumber").value);
  formData.append("route", document.getElementById("route").value);
  formData.append("veterinarian_id", document.getElementById("veterinarian").value);
  
  // Add all accumulated files
  for (let file of vaccineFiles) {
    formData.append("vaccine_file", file);
  }

  try {
    const response = await fetch("/api/vaccine", {
      method: "POST",
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      vaccineModal.classList.remove("active");
      vaccineForm.reset();
      vaccineFiles = [];  // Clear accumulated files
      updateFilePreview();  // Clear preview
      loadHorseDetail();
    } else {
      alert("Error: " + result.error);
    }
  } catch (error) {
    console.error("Error:", error);
  }
});


// Lab Test Modal
const labTestModal = document.getElementById("labTestModal");
const labTestForm = document.getElementById("labTestForm");
const closeLabTestBtn = labTestModal.querySelector(".close");

// Keep array of accumulated files for lab tests
let labTestFiles = [];

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

// Load vets for lab tests
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
    
    if (recordType === "medical") {
      loadLabVeterinarians();
      labTestModal.classList.add("active");
    }
  });
});

// Update file preview for lab tests
function updateLabTestFilePreview() {
  const preview = document.getElementById("labTestFilePreview");
  preview.innerHTML = "";
  
  if (labTestFiles.length > 0) {
    preview.innerHTML = `<strong>Archivos seleccionados (${labTestFiles.length}):</strong>`;
    
    const list = document.createElement("ul");
    list.className = "file-list";
    
    labTestFiles.forEach((file, index) => {
      const item = document.createElement("li");
      item.style.display = "flex";
      item.style.justifyContent = "space-between";
      item.style.alignItems = "center";
      
      const name = document.createElement("span");
      name.textContent = file.name;
      
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.textContent = "✕";
      removeBtn.style.background = "none";
      removeBtn.style.border = "none";
      removeBtn.style.color = "#d32f2f";
      removeBtn.style.cursor = "pointer";
      removeBtn.style.fontSize = "16px";
      removeBtn.addEventListener("click", () => {
        labTestFiles.splice(index, 1);
        updateLabTestFilePreview();
      });
      
      item.appendChild(name);
      item.appendChild(removeBtn);
      list.appendChild(item);
    });
    
    preview.appendChild(list);
  }
}

// Lab test file preview listener - Accumulate files
const labTestFileInput = document.getElementById("labTestFiles");
labTestFileInput.addEventListener("change", () => {
  if (labTestFileInput.files.length > 0) {
    for (let file of labTestFileInput.files) {
      labTestFiles.push(file);
    }
  }
  
  labTestFileInput.value = "";
  updateLabTestFilePreview();
});

// Handle lab test form submission
labTestForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append("horse_id", currentHorseId);
  formData.append("user_id", localStorage.getItem("uid"));
  formData.append("test_date", document.getElementById("testDate").value);
  formData.append("tested_for", document.getElementById("testedFor").value);
  formData.append("test_type", document.getElementById("testType").value);
  formData.append("test_result", document.getElementById("testResult").value);
  formData.append("official_laboratory", document.getElementById("laboratory").value);
  formData.append("veterinarian_id", document.getElementById("labVeterinarian").value);
  
  // Add all accumulated files
  for (let file of labTestFiles) {
    formData.append("lab_test_file", file);
  }

  try {
    const response = await fetch("/api/lab-test", {
      method: "POST",
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      labTestModal.classList.remove("active");
      labTestForm.reset();
      labTestFiles = [];
      updateLabTestFilePreview();
      loadHorseDetail();
    } else {
      alert("Error: " + result.error);
    }
  } catch (error) {
    console.error("Error:", error);
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

// Medical Procedure Modal
const procedureModal = document.getElementById("procedureModal");
const procedureForm = document.getElementById("procedureForm");
const closeProcedureBtn = procedureModal.querySelector(".close");

// Keep array of accumulated files for procedures
let procedureFiles = [];

// Close modal
closeProcedureBtn.addEventListener("click", () => {
  procedureModal.classList.remove("active");
});

// Click outside to close
window.addEventListener("click", (event) => {
  if (event.target === procedureModal) {
    procedureModal.classList.remove("active");
  }
});

// Load vets for procedures
async function loadProcedureVeterinarians() {
  try {
    const response = await fetch(`/api/veterinarian`);
    const vets = await response.json();
    
    const select = document.getElementById("procedureVeterinarian");
    select.innerHTML = '<option value="">Seleccionar veterinario</option>';
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

// Handle procedure button click
document.querySelectorAll(".record-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const recordType = e.target.dataset.record;
    
    if (recordType === "procedure") {
      procedureFiles = [];
      updateProcedureFilePreview();
      loadProcedureVeterinarians();
      procedureModal.classList.add("active");
    }
  });
});

// Update file preview for procedures
function updateProcedureFilePreview() {
  const preview = document.getElementById("procedureFilePreview");
  preview.innerHTML = "";
  
  if (procedureFiles.length > 0) {
    preview.innerHTML = `<strong>Archivos seleccionados (${procedureFiles.length}):</strong>`;
    
    const list = document.createElement("ul");
    list.className = "file-list";
    
    procedureFiles.forEach((file, index) => {
      const item = document.createElement("li");
      item.style.display = "flex";
      item.style.justifyContent = "space-between";
      item.style.alignItems = "center";
      
      const name = document.createElement("span");
      name.textContent = file.name;
      
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.textContent = "✕";
      removeBtn.style.background = "none";
      removeBtn.style.border = "none";
      removeBtn.style.color = "#d32f2f";
      removeBtn.style.cursor = "pointer";
      removeBtn.style.fontSize = "16px";
      removeBtn.addEventListener("click", () => {
        procedureFiles.splice(index, 1);
        updateProcedureFilePreview();
      });
      
      item.appendChild(name);
      item.appendChild(removeBtn);
      list.appendChild(item);
    });
    
    preview.appendChild(list);
  }
}

// Procedure file preview listener - Accumulate files
const procedureFileInput = document.getElementById("procedureFiles");
procedureFileInput.addEventListener("change", () => {
  if (procedureFileInput.files.length > 0) {
    for (let file of procedureFileInput.files) {
      procedureFiles.push(file);
    }
  }
  
  procedureFileInput.value = "";
  updateProcedureFilePreview();
});

// Handle procedure form submission
procedureForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append("horse_id", currentHorseId);
  formData.append("user_id", localStorage.getItem("uid"));
  formData.append("procedure_date", document.getElementById("procedureDate").value);
  formData.append("procedure_name", document.getElementById("procedureName").value);
  formData.append("description", document.getElementById("procedureDescription").value);
  formData.append("veterinarian_id", document.getElementById("procedureVeterinarian").value);
  formData.append("aftercare", document.getElementById("aftercare").value);
  formData.append("recommendations", document.getElementById("recommendations").value);
  
  // Add all accumulated files
  for (let file of procedureFiles) {
    formData.append("procedure_file", file);
  }

  try {
    const response = await fetch("/api/medical-procedure", {
      method: "POST",
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      procedureModal.classList.remove("active");
      procedureForm.reset();
      procedureFiles = [];
      updateProcedureFilePreview();
      loadHorseDetail();
    } else {
      alert("Error: " + result.error);
    }
  } catch (error) {
    console.error("Error:", error);
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