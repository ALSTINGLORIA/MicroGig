const urlParams = new URLSearchParams(window.location.search);
const jobId = urlParams.get('jobId');
const studentId = localStorage.getItem('studentId');

async function loadJobDetails() {
    if (!jobId) {
        console.error('No job ID found in URL.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/job-details?jobId=${jobId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch job details.");
        }
        const job = await response.json();

        document.getElementById('jobInfo').innerHTML = `
            <h2>${job.title}</h2>
            <p><strong>Description:</strong> ${job.description}</p>
            <p><strong>Location:</strong> ${job.location}</p>
            <p><strong>Payment:</strong> ${job.payment}Rs</p>
            <p><strong>Status:</strong> ${job.status}</p>
            <p><strong>Time:</strong> ${job.time}</p>
            <p><strong>Day:</strong> ${job.day}</p>
            <p><strong>Duration:</strong> ${job.duration}</p>
        `;
    } catch (error) {
        console.error('Error fetching job details:', error);
        alert("Failed to load job details.");
    }
}

document.getElementById("acceptButton").onclick = function() {
    acceptJob(jobId);
};

function acceptJob(jobId) {
    const studentId = localStorage.getItem('studentId'); // Retrieve studentId from local storage
    console.log(`Job with ID ${jobId} accepted by student ID ${studentId}.`);

    fetch('http://localhost:5000/update-job-status', {
        method: 'PATCH',
        body: JSON.stringify({ jobId,studentId, status: 'accepted' }), // Include studentId in the request
        headers: { 'Content-Type': 'application/json' },
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Already accepted job at this time') {
            alert(data.message);
        } 
        else {
        alert('Job accepted successfully!');
        loadJobDetails();  // Refresh job listings after accepting the job
        }
    })
    .catch(error => console.error('Error accepting job:', error));
}

function goBack() {
    window.history.back();
}

// Load job details on page load
window.onload = loadJobDetails;
