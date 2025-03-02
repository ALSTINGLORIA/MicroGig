// Get jobId from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const jobId = urlParams.get('jobId');
const studentId = localStorage.getItem('studentId');

// Fetch payment details when page loads
window.addEventListener('load', async () => {
    try {
        const response = await fetch(`http://localhost:5000/student-payment-bill?jobId=${jobId}`);
        const data = await response.json();
        
        if (response.ok) {
            // Display payment amount
            document.getElementById('paymentAmount').textContent = `₹${data.payment}`;
        } else {
            console.error('Error fetching payment:', data.message);
            alert('Failed to load payment details');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while fetching payment details');
    }
});

document.getElementById('reportButton').addEventListener('click', async (event) => {
    const dropdown = document.getElementById('reportDropdown');
    dropdown.style.display = 'block'; // Show the dropdown menu
    dropdown.addEventListener('change', async (event) => {
        const selectedReason = event.target.value; // Get the selected reason from the dropdown
        if (selectedReason) { // Check if a reason is selected
            try {
                const response = await fetch(`http://localhost:5000/student-report?jobId=${jobId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ jobId, reason: selectedReason }), // Include the reason in the request

                });


            if (response.ok) {
                alert('Job poster reported successfully.');
                event.target.disabled = true; // Disable the report button after reporting
            } else {
                const data = await response.json();
                console.error('Error reporting job poster:', data.message);
                alert('Failed to report job poster.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while reporting the job poster.');
        }
    }
    });
});



document.getElementById('jobCompleted').addEventListener('click', async (event) => {
    window.location.replace(`/student_dashboard.html?studentId=${studentId}`);
});
