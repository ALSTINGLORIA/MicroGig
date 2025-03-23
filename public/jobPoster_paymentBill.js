
const urlParams = new URLSearchParams(window.location.search);
const jobId = urlParams.get('jobId');
const jobPosterId = localStorage.getItem('jobPosterId');


window.addEventListener('load', async () => {
    try {
        const response = await fetch(`http://localhost:5000/jobPoster-payment-bill?jobId=${jobId}`);
        const data = await response.json();
        
        if (response.ok) {
            
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

document.getElementById('jobCompleted').addEventListener('click', async (event) => {
    window.location.replace(`/jobPoster_dashboard.html?jobPosterId=${jobPosterId}`);
    
});