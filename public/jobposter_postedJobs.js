// Function to load the jobs posted by the current job poster
async function loadPostedJobs() {
    const jobPosterId = localStorage.getItem('jobPosterId'); // Assuming jobPosterId is stored in localStorage
    if (!jobPosterId) {
        console.error('No job poster ID found.');
        return;
    }
    try {
        const response = await fetch(`http://localhost:5000/jobs?jobPosterId=${jobPosterId}`);
        if (!response.ok) {
            throw new Error("Failed to load posted jobs.");
        }

        const jobs = await response.json();
        console.log('Posted jobs:', jobs);

        const postedJobsContainer = document.getElementById('postedJobs');
        postedJobsContainer.innerHTML = ''; // Clear previous listings if any

        jobs.forEach(job => {
            const jobElement = document.createElement('div');
            jobElement.classList.add('job');
            jobElement.innerHTML = `
                <h3>${job.title}</h3>
                <p>${job.description}</p>
                <p><strong>Payment:</strong> ${job.payment}</p>
                <p><strong>Status:</strong> ${job.status}</p>
            `;
            postedJobsContainer.appendChild(jobElement);
        });
    } catch (error) {
        console.error('Error fetching posted jobs:', error);
    }
}

// Load posted jobs on page load
window.onload = function() {
    loadPostedJobs();
}