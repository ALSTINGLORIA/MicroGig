const jobPosterId = localStorage.getItem('jobPosterId');

async function loadAcceptedJobs() {
    try {
        const response = await fetch(`http://localhost:5000/accepted-jobs?jobPosterId=${jobPosterId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch accepted jobs.");
        }
        const jobs = await response.json();

        const response2 = await fetch(`http://localhost:5000/accepted-jobs-cancel-rate?jobPosterId=${jobPosterId}`);
        if (!response2.ok) {
            throw new Error("Failed to fetch accepted jobs2.");
        }
        const rates = await response2.json();

        const container = document.getElementById('acceptedJobsContainer');

        jobs.forEach(job => {
            const rate = rates.find((response2) => response2._id === job.studentId);
            const jobElement = document.createElement('div');
            jobElement.innerHTML = `
                <h3>${job.title}</h3>
                <p>${job.description}</p>
                <p>${job.location}</p>
                <p>${job.payment}</p>
                <p>${job.time}</p>
                <p>${job.duration}</p>
                <p>${job.day}</p>
                <p>Accepted by: ${job.studentName}</p>
                <p>${job.email}</p>
                <p>${job.phoneNo}</p>
                <p>Student Cancellations this month: ${rate.cancelled}</p>
                
            `;
            container.appendChild(jobElement);
        });
    } catch (error) {
        console.error('Error fetching accepted jobs:', error);
        alert("No Jobs have been accepted yet.");
    }
}

function goBack() {
    window.history.back();
}

// Load accepted jobs on page load
window.onload = loadAcceptedJobs;
