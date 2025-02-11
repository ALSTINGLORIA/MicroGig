
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const right = sidebar.style.right === "0px" ? "-300px" : "0px";
  sidebar.style.right = right;
}


async function loadProfile() {
  // const studentId = localStorage.getItem('studentId'); 
  const urlParams = new URLSearchParams(window.location.search);
  const studentId = urlParams.get('studentId'); 
  if (!studentId) {
    console.error('No student ID found in local storage.');
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


// Function to fetch job listings and display them
async function loadJobListings() {
  try {
    const response = await fetch('http://localhost:5000/job-listings');
    if (!response.ok) {
      throw new Error("Failed to fetch job listings.");
    }
    const jobs = await response.json();
    console.log('Job listings:', jobs); // Log the job listings to verify

    // Clear previous listings if any
    const jobListingsContainer = document.getElementById('job-listings');
    jobListingsContainer.innerHTML = '';

    // Loop through the jobs and dynamically create job elements
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
  } catch (err) {
    console.error('Error fetching job listings:', err);
  }
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

// Logout function (simulated)
function logout() {
  alert("You have been logged out!");
  // Handle actual logout logic here (e.g., clearing session)
}

// Load student profile and job listings on page load
window.onload = function() {
  loadProfile();
  loadJobListings();
}
