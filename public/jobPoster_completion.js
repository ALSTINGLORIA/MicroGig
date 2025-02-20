// Function to generate OTP
const urlParams = new URLSearchParams(window.location.search);
const jobId = urlParams.get('jobId');

// Get job details on page load
window.addEventListener('load', async () => {

    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('jobId');

    try {
        const response = await fetch(`http://localhost:5000/jobPoster-completion?jobId=${jobId}`);
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
            document.getElementById('studentName').textContent = jobDetails.studentName;
            document.getElementById('studentEmail').textContent = jobDetails.email;
            document.getElementById('studentPhone').textContent = jobDetails.phoneNo;
        } else {
            console.error('Error fetching job details:', jobDetails.error);
            alert('Failed to load job details');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while fetching job details');
    }
});

// Verify OTP function
async function verifyOTP() {
    const otp = document.getElementById('otpInput').value;
    const jobId = new URLSearchParams(window.location.search).get('jobId');
    
    if (!otp || otp.length !== 6) {
        document.getElementById('otpMessage').textContent = 'Please enter a valid 6-digit OTP';
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/verify-otp?jobId=${jobId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ otp, jobId })
        });

        const result = await response.json();
        
        if (response.ok) {
            document.getElementById('otpMessage').textContent = result.message;
            document.getElementById('otpMessage').style.color = 'green';
            
            // Create confirmation button
            const confirmButton = document.createElement('button');
            confirmButton.id = 'confirmButton';
            confirmButton.textContent = 'Job Completion Confirmation';
            confirmButton.onclick = jobCompletionConfirmation;
            document.body.appendChild(confirmButton);


        } else {
            document.getElementById('otpMessage').textContent = result.message || 'OTP verification failed';
            document.getElementById('otpMessage').style.color = 'red';
        }

    } catch (error) {
        console.error('Error verifying OTP:', error);
        document.getElementById('otpMessage').textContent = 'An error occurred while verifying OTP';
        document.getElementById('otpMessage').style.color = 'red';
    }
}

function jobCompletionConfirmation() {
    window.location.href = `jobPoster_paymentBill.html?jobId=${jobId}`;
}
