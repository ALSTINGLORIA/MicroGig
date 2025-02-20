const urlParams = new URLSearchParams(window.location.search);
const jobId = urlParams.get('jobId');

// Get job details on page load
window.addEventListener('load', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('jobId');

    try {
        const response = await fetch(`http://localhost:5000/student-completion?jobId=${jobId}`);
        const jobDetails = await response.json();
        console.log(jobDetails);

        if (response.ok) {
            // Display job details
            document.getElementById('jobTitle').textContent = jobDetails.title;
            document.getElementById('jobDescription').textContent = jobDetails.description;
            document.getElementById('jobPayment').textContent = jobDetails.payment;
            document.getElementById('jobTime').textContent = jobDetails.time;
            document.getElementById('jobLocation').textContent = jobDetails.location;
            document.getElementById('jobDay').textContent = jobDetails.day;
        } else {
            console.error('Error fetching job details:', jobDetails.error);
            alert('Failed to load job details');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while fetching job details');
    }
});

async function generateOTP() {
    try {
        const response = await fetch(`http://localhost:5000/jobPoster-otp?jobId=${jobId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
        if (response.ok) {
            document.getElementById('otpDisplay').textContent = `OTP: ${result.otpNumber}`;
            document.getElementById('generateOtpButton').disabled = true;
            document.getElementById('resendOtpButton').style.display = 'inline-block';
        } else {
            alert('Failed to generate OTP');
        }
    } catch (error) {
        console.error('Error generating OTP:', error);
        alert('Error generating OTP');
    }
}

async function resendOTP() {
    await generateOTP();
}


// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('generateOtpButton').addEventListener('click', generateOTP);
    document.getElementById('resendOtpButton').addEventListener('click', resendOTP);
});
