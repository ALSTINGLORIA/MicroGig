async function fetchProfile() {
    const urlParams = new URLSearchParams(window.location.search);
    const jobPosterId = urlParams.get('jobPosterId');

    try {
        const response = await fetch(`/job-poster-profile?jobPosterId=${jobPosterId}`);
        const data = await response.json();

        if (response.ok) {
            document.getElementById('profileInfo').innerHTML = `
                <p><label>Name:</label> ${data.name}</p>
                <p><label>Email:</label> ${data.email}</p>
                <p><label>Phone No:</label> ${data.phoneNo}</p>
                <p><label>Address:</label> ${data.address}</p>
            `;
        } else {
            document.getElementById('profileInfo').innerHTML = `<p>Error fetching profile: ${data.message}</p>`;
        }
    } catch (error) {
        document.getElementById('profileInfo').innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

function goBack() {
    window.history.back();
}

window.onload = fetchProfile;