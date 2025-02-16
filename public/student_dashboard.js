// Function to toggle the sidebar visibility
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  // Check if the sidebar is off-screen or visible
  if (sidebar.style.left === "-300px" || sidebar.style.left === "") {
    sidebar.style.left = "0";  // Slide in from the left
  } else {
    sidebar.style.left = "-300px";  // Slide out to the left
  }
}

// Function to toggle the filter dropdown visibility
function toggleFilterDropdown() {
  const dropdown = document.getElementById("filter-dropdown");
  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

// Function to load the student profile
async function loadProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const studentId = urlParams.get('studentId'); 
  if (!studentId) {
    console.error('No student ID found in URL parameters.');
    return;
  }
  try {
    const response = await fetch(`http://localhost:5000/student-profile?studentId=${studentId}`);
    if (!response.ok) {
      throw new Error("Failed to load student profile.");
    }

    const student = await response.json();
    console.log('Student data:', student);

    document.getElementById("studentName").textContent = student.name;
    document.getElementById("email").textContent = student.email;
    document.getElementById("phoneno").textContent = student.phoneNo;
    document.getElementById("age").textContent = student.age;
    localStorage.setItem('studentId', student._id); 
  } catch (error) {
    console.error('Error fetching student profile:', error);
    alert("Failed to load student profile.");
  }
}

// Function to apply filters
async function applyFilters() {
  const sortPayment = document.getElementById('sort-payment').value;
  const location = document.getElementById('location').value;
  const sortDuration = document.getElementById('sort-duration').value;

  let locationCoords = null;
  if (location) {
    locationCoords = await getLocationCoordinates(location);
  }

  // Fetch job listings and apply filters
  fetch('http://localhost:5000/job-listings')
    .then(response => response.json())
    .then(jobs => {
      if (sortPayment) {
        jobs.sort((a, b) => sortPayment === 'payment-asc' ? a.payment - b.payment : b.payment - a.payment);
      }
      if (locationCoords) {
        jobs = jobs.filter(job => isNearby(job.locationCoords, locationCoords));
      }
      if (sortDuration) {
        jobs.sort((a, b) => sortDuration === 'duration-asc' ? a.duration - b.duration : b.duration - a.duration);
      }
      displayJobs(jobs);
    })
    .catch(error => console.error('Error fetching jobs:', error));
}

// Function to fetch job listings and display them
async function loadJobListings() {
  try {
    const response = await fetch('http://localhost:5000/job-listings');
    if (!response.ok) {
      throw new Error("Failed to fetch job listings.");
    }
    const jobs = await response.json();
    console.log('Job listings:', jobs); // Log the job listings to verify

    displayJobs(jobs);
  } catch (err) {
    console.error('Error fetching job listings:', err);
  }
}

// Function to display jobs
function displayJobs(jobs) {
  const jobListingsContainer = document.getElementById('job-listings');
  jobListingsContainer.innerHTML = ''; // Clear previous listings if any

  jobs.forEach(job => {
    const jobElement = document.createElement('div');
    jobElement.classList.add('job');
    
    let acceptButton = '';

    // Only show the "Accept" button for jobs that are 'waiting'
    if (job.status === 'waiting') {
      acceptButton = `<button onclick="acceptJob('${job._id}')">Accept</button>`;
    } else {
      // For non-waiting jobs, show the button but disabled
      acceptButton = `<button disabled>Accept (Not Available)</button>`;
    }

    jobElement.innerHTML = `
      <h3>${job.title}</h3>
      <p>${job.description}</p>
      <p>Status: ${job.status}</p>
      ${acceptButton}
    `;
    jobListingsContainer.appendChild(jobElement);
  });
}

// Simulate accepting a job
function acceptJob(jobId) {
  console.log(`Job with ID ${jobId} accepted.`);
  // Here, you can make an API request to the backend to update the job status
  fetch('http://localhost:5000/update-job-status', {
    method: 'PATCH',
    body: JSON.stringify({ jobId, status: 'accepted' }),
    headers: { 'Content-Type': 'application/json' },
  })
  .then(response => response.json())
  .then(data => {
    console.log('Job accepted:', data);
    loadJobListings();  // Refresh job listings after accepting the job
  })
  .catch(error => console.error('Error accepting job:', error));
}

// Function to get location coordinates using a geocoding service
async function getLocationCoordinates(location) {
  const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=YOUR_MAPBOX_ACCESS_TOKEN`);
  const data = await response.json();
  if (data.features && data.features.length > 0) {
    return data.features[0].geometry.coordinates;
  } else {
    throw new Error('Location not found');
  }
}

// Function to check if a job is nearby based on coordinates
function isNearby(jobCoords, locationCoords) {
  const [jobLng, jobLat] = jobCoords;
  const [locationLng, locationLat] = locationCoords;
  const distance = getDistanceFromLatLonInKm(jobLat, jobLng, locationLat, locationLng);
  return distance <= 50; // Consider jobs within 50 km as nearby
}

// Function to calculate distance between two coordinates in km
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Logout function
function logout() {
  alert("You have been logged out!");
<<<<<<< Updated upstream
  // Clear session or local storage if needed
  localStorage.removeItem('studentId');
  window.location.href = 'home_page.html'; // Redirect to home page
=======
  // Handle actual logout logic here (e.g., clearing session)
  localStorage.removeItem('studentId'); // Clear the student ID from local storage
  window.location.href = 'login.html'; // Redirect to the login page
>>>>>>> Stashed changes
}

// Load student profile and job listings on page load
window.onload = function() {
  loadProfile();
  loadJobListings();
}

