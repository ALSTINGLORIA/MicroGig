document.addEventListener('DOMContentLoaded', () => {
    // Get jobPosterId from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const jobPosterId = urlParams.get('jobPosterId');
    localStorage.setItem('jobPosterId', jobPosterId);

    // Job categories with dropdown logic
    const jobCategorySelect = document.getElementById('jobCategory');
    const jobTitleSelect = document.getElementById('jobTitle');
    const customJobInput = document.getElementById('customJobInput');
    const customJob = document.getElementById('customJob');

    // Show/hide custom job input based on selection
    jobCategorySelect.addEventListener('change', () => {
        const selectedCategory = jobCategorySelect.value;
        jobTitleSelect.innerHTML = '<option value="" disabled selected>Select a job</option>';
        
        if (selectedCategory === "Other") {
            customJobInput.style.display = 'block';
            customJob.required = true;
            jobTitleSelect.style.display = 'none';
        } else {
            customJobInput.style.display = 'none';
            customJob.required = false;
            jobTitleSelect.style.display = 'block';

            jobCategories[selectedCategory].forEach(job => {
                const option = document.createElement('option');
                option.value = job;
                option.textContent = job;
                jobTitleSelect.appendChild(option);
            });
        }
    });


const durationInput = document.getElementById('jobDuration');
  const durationError = document.getElementById('durationError');

  durationInput.addEventListener('input', () => {
    const value = durationInput.value;
    const regex = /^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!regex.test(value)) {
      durationInput.style.border = '1px solid red';
      durationError.textContent = 'Invalid time format. Please use HH:MM.';
    } else {
      durationInput.style.border = '';
      durationError.textContent = '';
    }
  });

// Check for upcoming jobs on page load
window.addEventListener('load', async () => {
    try {
        const response = await fetch(`http://localhost:5000/check-job-today-poster?jobPosterId=${jobPosterId}`);
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
                    <p><strong>Student:</strong> ${job.studentName}</p>
                    <p><strong>Contact:</strong> ${job.phoneNo}</p>
                    <button class="proceedBtn">Proceed</button>
                `;
                popup.appendChild(content);

                // Add Proceed button
                const proceedBtn = content.querySelector('.proceedBtn');
                proceedBtn.onclick = () => {
                    const jobId = job._id;
                    window.location.href = `jobPoster_completion.html?jobId=${jobId}`;
                };
                
                // Add to document
                document.body.appendChild(popup);

            });
        }
    } catch (error) {
        console.error('Error checking for upcoming jobs:', error);
    }
});

localStorage.setItem('jobPosterId', jobPosterId);
document.getElementById('profileButton').addEventListener('click', function(event) {
    event.preventDefault();
    window.location.href = `jobPoster_profile.html?jobPosterId=${jobPosterId}`;
});

document.getElementById('notificationButton').addEventListener('click', function(event) {
    event.preventDefault();
    window.location.href = `accepted_jobs.html?jobPosterId=${jobPosterId}`;
});

// Toggle the job form visibility
document.getElementById('postJobButton').addEventListener('click', function(event) {
    event.preventDefault();
    document.querySelector('.dashboard').style.display = 'none';
    document.getElementById('jobForm').style.display = 'flex';
});

document.getElementById('goback').addEventListener('click', function(event) {
    event.preventDefault();
    document.querySelector('.dashboard').style.display = 'flex';
    document.getElementById('jobForm').style.display = 'none';
});

// Handle the job upload
document.getElementById('uploadJob').addEventListener('click', async function(event) {
    event.preventDefault();
    
    const jobTitle = document.getElementById('jobTitle').value;
    const jobDescription = document.getElementById('jobDescription').value;
    const payment = document.getElementById('payment').value;
    const jobTime = document.getElementById('jobTime').value; 
    const jobDay = document.getElementById('jobDay').value; 
    const jobLocation = document.getElementById('jobLocation').value;  
    const jobTimeAmPm = document.getElementById('jobTimeAmPm').value; 
    const jobDuration = document.getElementById('jobDuration').value; 

    if (!jobTitle || !jobDescription || !payment || !jobTime || !jobDay || !jobLocation || !jobDuration) {
        alert('Please fill in all fields!');
        return;
    }

    const jobData = {
        name: jobTitle,
        value: {
            description: jobDescription,
            payment: parseFloat(payment),
            time: jobTime, 
            day: jobDay, 
            jobAmPm: jobTimeAmPm,
            location: jobLocation,
            jobPosterId: jobPosterId,
            jobDuration: jobDuration
        }
    };

    try {
        const response = await fetch('http://localhost:5000/addData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jobData)
        });

        const result = await response.json();
        if (response.ok) {
            alert('Job uploaded successfully!');
            document.getElementById('jobTitle').value = '';
            document.getElementById('jobDescription').value = '';
            document.getElementById('payment').value = '';
            document.getElementById('jobTime').value = ''; 
            document.getElementById('jobDay').value = ''; 
            document.getElementById('jobLocation').value = ''; 
            document.getElementById('jobDuration').value = ''; 
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (err) {
        alert('Failed to upload job!');
        console.error('Error uploading job:', err);
    }
});

// Sign out logic
document.getElementById('signOutButton').addEventListener('click', () => {
    alert('You have been signed out.');
    localStorage.clear();
    sessionStorage.clear(); // Clear session storage
    window.location.href = 'login_page.html';
});
 // Job categories and subcategories
 const jobCategories = {
    "Household Tasks": [
        "Car washing",
        "Watering plants",
        "Gardening",
        "Lawn mowing",
        "Decluttering rooms",
        "Grocery shopping"
    ],
    "Organizational Tasks": [
        "Setting up a device",
        "Sorting items",
        "Arranging books or files",
        "Organizing a small event",
        "Running errands"
    ],
    "Event Assistance": [
        "Distributing flyers",
        "Setting up chairs/tables",
        "Decorating event spaces",
        "Assisting guests",
        "Cleaning up after events"
    ],
    "Delivery & Errands": [
        "Picking up groceries",
        "Delivering packages",
        "Collecting laundry",
        "Queuing for services (like at banks)"
    ],
    "Manual Labor": [
        "Moving light furniture",
        "Lifting boxes",
        "Unloading small deliveries",
        "Packing items"
    ],
    "Other": ["custom"]
};

// Function to populate job titles based on selected category
jobCategorySelect.addEventListener('change', () => {
    const selectedCategory = jobCategorySelect.value;
    jobTitleSelect.innerHTML = '<option value="" disabled selected>Select a job</option>';
    
    if (selectedCategory === "Other") {
        customJobInput.style.display = 'block';
        customJob.required = true;
        jobTitleSelect.style.display = 'none';
    } else {
        customJobInput.style.display = 'none';
        customJob.required = false;
        jobTitleSelect.style.display = 'block';

        jobCategories[selectedCategory].forEach(job => {
            const option = document.createElement('option');
            option.value = job;
            option.textContent = job;
            jobTitleSelect.appendChild(option);
        });
    }
});
});