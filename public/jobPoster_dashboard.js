// Handle profile button click
document.getElementById('profileButton').addEventListener('click', function(event) {
    event.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const jobPosterId = urlParams.get('jobPosterId');
    window.location.href = `jobPoster_profile.html?jobPosterId=${jobPosterId}`;
});

// Toggle the job form visibility
document.getElementById('postJobButton').addEventListener('click', function(event) {
    event.preventDefault();
    document.querySelector('.dashboard').style.display = 'none';
    document.getElementById('jobForm').style.display = 'flex';
});

// Handle the job upload
document.getElementById('uploadJob').addEventListener('click', async function(event) {
    event.preventDefault();
    
    const jobTitle = document.getElementById('jobTitle').value;
    const jobDescription = document.getElementById('jobDescription').value;
    const payment = document.getElementById('payment').value;

    if (!jobTitle || !jobDescription || !payment) {
        alert('Please fill in all fields!');
        return;
    }

    const jobData = {
        title: jobTitle,
        description: jobDescription,
        payment: parseFloat(payment),
        jobPosterId: localStorage.getItem('jobPosterId') // Assuming jobPosterId is stored in localStorage
    };

    try {
        const response = await fetch('http://localhost:5000/jobs', {
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
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (err) {
        alert('Failed to upload job!');
        console.error('Error uploading job:', err);
    }
});