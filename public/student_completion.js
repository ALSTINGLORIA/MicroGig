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
            document.getElementById('jobTitle').textContent = jobDetails.jobInfo.title;
            document.getElementById('jobDescription').textContent = jobDetails.jobInfo.description;
            document.getElementById('jobPayment').textContent = jobDetails.jobInfo.payment;
            document.getElementById('jobTime').textContent = jobDetails.jobInfo.time;
            document.getElementById('jobLocation').textContent = jobDetails.jobInfo.location;
            document.getElementById('jobDay').textContent = jobDetails.jobInfo.day;
        } else {
            console.error('Error fetching job details:', jobDetails.error);
            alert('Failed to load job details');
        } 
    async function checkVariable() { 
        try{
        const response = await fetch(`http://localhost:5000/student-completion?jobId=${jobId}`);
        const jobDetails = await response.json();
    if (jobDetails.completion !== null) {
        if(jobDetails.completion == "completed"){
            document.getElementById('generateOtpButton').style.display = 'none';
            document.getElementById('resendOtpButton').style.display = 'none';

            window.location.href = `student_paymentBill.html?jobId=${jobId}`;
        }
    }
    } catch (error) {
        console.error('Error:', error);
    } 
    }
    setInterval(checkVariable, 5000);
        
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
