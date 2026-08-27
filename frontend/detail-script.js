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
  
  // Format date
    const dateString = horse.date_of_birth.split('T')[0];  // gets "2006-12-31"
    const formattedDate = new Date(dateString + "T00:00:00").toLocaleDateString("es-ES");
  
  // Calculate age
  const age = calculateAge(horse.date_of_birth);
  
  detail.innerHTML = `
    <article class="horse-detail">
      <div class="detail-image">
        <img src="uploads/${horse._id}_profile.jpg" alt="${horse.name}">
      </div>
      
      <div class="detail-info">
        <h2>${horse.name}</h2>
        
        <section>
          <h3>Información básica</h3>
          <p><strong>Fecha de nacimiento:</strong> ${formattedDate}</p>
          <p><strong>Edad:</strong> ${age} years</p>
          <p><strong>Sexo:</strong> ${horse.sex || "N/A"}</p>
          <p><strong>Color:</strong> ${horse.color || "N/A"}</p>
          <p><strong>Raza:</strong> ${horse.breed || "N/A"}</p>
          <p><strong>País de nacimiento:</strong> ${horse.country_of_birth || "N/A"}</p>
          <p><strong>Criadero:</strong> ${horse.breeding_place || "N/A"}</p>
        </section>
        
        <section>
          <h3>Pedigree</h3>
          <p><strong>Padre:</strong> ${horse.father || "N/A"}</p>
          <p><strong>Madre:</strong> ${horse.mother || "N/A"}</p>
          <p><strong>Padre de la madre:</strong> ${horse.mothers_father || "N/A"}</p>
        </section>
        
        <section>
          <h3>Descripción física</h3>
          <p><strong>Cabeza:</strong> ${horse.head_description || "N/A"}</p>
          <p><strong>LF:</strong> ${horse.lf_description || "N/A"}</p>
          <p><strong>RF:</strong> ${horse.rf_description || "N/A"}</p>
          <p><strong>LH:</strong> ${horse.lh_description || "N/A"}</p>
          <p><strong>RH:</strong> ${horse.rh_description || "N/A"}</p>
          <p><strong>Cuerpo y torso:</strong> ${horse.body_description || "N/A"}</p>
        </section>
      </div>
    </article>
  `;
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