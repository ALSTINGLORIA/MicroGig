// Get jobId from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const jobId = urlParams.get('jobId');

// Fetch payment details when page loads
window.addEventListener('load', async () => {
    try {
        const response = await fetch(`http://localhost:5000/jobPoster-payment-bill?jobId=${jobId}`);
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
