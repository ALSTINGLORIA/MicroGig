const urlParams = new URLSearchParams(window.location.search);
const studentId = urlParams.get('studentId');

async function loadAcceptedJobs() {
    try {
        const response = await fetch(`http://localhost:5000/student-accepted-jobs?studentId=${studentId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch accepted jobs");
        }
        const jobs = await response.json();
        
        const jobsList = document.getElementById('accepted-jobs-list');
        jobsList.innerHTML = jobs.map(job => `
            <div class="job-card">
                <h3>${job.title}</h3>
                <p>${job.description}</p>
                <p>Location: ${job.location}</p>
                <p>Payment: ${job.payment}</p>
                <p>Date: ${job.day}</p>
                <p>Location: ${job.location}</p>
                <p>Time: ${job.time}</p>
                <p>Status: ${job.status}</p>
                <p>Duration: ${job.duration}</p>
                <button onclick="cancelJob('${job._id}')">Cancel Job</button>

            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading accepted jobs:', error);
    }
}


async function cancelJob(jobId) {
    try {
        const response = await fetch(`http://localhost:5000/canceljob`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ jobId, studentId })
        });
        
        if (!response.ok) {
            throw new Error('Failed to cancel job');
        }
        
        // Reload the jobs list after successful cancellation
        alert("job has been canceled");
        loadAcceptedJobs();
    } catch (error) {
        console.error('Error cancelling job:', error);
        alert('Failed to cancel job. Please try again.');
    }
}

function goBack() {
    window.history.back();
}

window.onload = loadAcceptedJobs;
