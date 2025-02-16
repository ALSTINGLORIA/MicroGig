const urlParams = new URLSearchParams(window.location.search);
const studentId = urlParams.get('studentId'); 
localStorage.setItem('studentId', studentId);
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const right = sidebar.style.right === "0px" ? "-300px" : "0px";
  sidebar.style.right = right;
}

window.addEventListener('load', async () => {
  try {
      const response = await fetch(`http://localhost:5000/check-job-today-student?studentId=${studentId}`);
      const jobs = await response.json();
      
      if (jobs.length > 0) {
        jobs.forEach(job => {
          // Create popup container
          const popup = document.createElement('div');
          popup.className = 'job-popup';
          
          // Add close button
          const closeBtn = document.createElement('span');
          closeBtn.className = 'close-popup';
          closeBtn.innerHTML = '&times;';
          closeBtn.onclick = () => popup.remove();
          popup.appendChild(closeBtn);
          
          // Add job details
          const content = document.createElement('div');
          content.innerHTML = `
              <h3>Upcoming Job</h3>
              <p><strong>Title:</strong> ${job.title}</p>
              <p><strong>Time:</strong> ${job.time}</p>
              <p><strong>Location:</strong> ${job.location}</p>
              <p><strong>date:</strong> ${job.day}</p>
              <button class="proceedBtn">Proceed</button>
          `;
          popup.appendChild(content);
          
          const proceedBtn = content.querySelector('.proceedBtn');
                proceedBtn.onclick = () => {
                    const jobId = job._id;
                    window.location.href = `student_completion.html?jobId=${jobId}`;
          };
          // Add to document
          document.body.appendChild(popup);
      });
      }
  } catch (error) {
      console.error('Error checking for upcoming jobs:', error);
  }
});

async function loadProfile() {
  // const studentId = localStorage.getItem('studentId'); 

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
      if (job.status === 'waiting') {
        const jobElement = document.createElement('div');
        jobElement.classList.add('job');
      

      // let acceptButton = '';

      // Only show the "Accept" button for jobs that are 'waiting'
 /*     if (job.status === 'waiting') {
        acceptButton = `<button onclick="acceptJob('${job._id}')">Accept</button>`;
      } else {
        // For non-waiting jobs, show the button but disabled
        acceptButton = `<button disabled>Accept (Not Available)</button>`;
      }
*/

    jobElement.innerHTML = `
        <h3><a href="jobDetails.html?jobId=${job._id}">${job.title}</a></h3>
        <p>${job.description}</p>
        <p>Status: ${job.status}</p>


      `;
      jobListingsContainer.appendChild(jobElement);
    }
    });
  } catch (err) {
    console.error('Error fetching job listings:', err);
  }
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
