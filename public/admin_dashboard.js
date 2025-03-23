document.addEventListener('DOMContentLoaded', () => {
    loadJobListings();
    loadPosterListings();
});

async function loadJobListings() {

    try {
        const response = await fetch('http://localhost:5000/unverified-users-1');
        if (!response.ok) {
            throw new Error("No unverified users found.");
        }
        const user = await response.json();

        
        const userListingsContainer = document.getElementById('unverified-users');
        userListingsContainer.innerHTML = '';

        
        user.forEach(users => {
            if (users.verified === 0) {
                const userElement = document.createElement('div');
                userElement.classList.add('user');

                userElement.innerHTML = `
                    <p>${users.name}</p>
                    <p>${users.aadharNo}</p>
                    <button class="approve" data-id="${users._id}">Approve</button>
                    <button class="reject" data-id="${users._id}">Reject</button>
                `;

                userElement.querySelector('.approve').addEventListener('click', async () => {
                    await updateUserVerification(users._id, 1);
                });

            
                userElement.querySelector('.reject').addEventListener('click', async () => {
                    await updateUserVerification(users._id, 2);
                });

                userListingsContainer.appendChild(userElement);
            }
        });
    } catch (err) {
        console.error('Error fetching job listings:', err);
    }
}

async function loadPosterListings() {

    try {
        const response = await fetch('http://localhost:5000/unverified-users-2');
        if (!response.ok) {
            throw new Error("No unverified users found.");
        }
        const user = await response.json();

        
        const userListingsContainer = document.getElementById('unverified-users-2');
        userListingsContainer.innerHTML = '';

        
        user.forEach(users => {
            if (users.verified === 0) {
                const userElement = document.createElement('div');
                userElement.classList.add('user');

                userElement.innerHTML = `
                    <p>${users.name}</p>
                    <p>${users.aadharNo}</p>
                    <button class="approve" data-id="${users._id}">Approve</button>
                    <button class="reject" data-id="${users._id}">Reject</button>
                `;


                userElement.querySelector('.approve').addEventListener('click', async () => {
                    await updateUserVerification2(users._id, 1);
                });

                
                userElement.querySelector('.reject').addEventListener('click', async () => {
                    await updateUserVerification2(users._id, 2);
                });

                userListingsContainer.appendChild(userElement);
            }
        });
    } catch (err) {
        console.error('Error fetching job listings:', err);
    }
}

async function updateUserVerification(userId, status) {
    try {
      const response = await fetch(`http://localhost:5000/update-user-1`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, status }),
    });
    

        if (!response.ok) {
            throw new Error("Failed to update user verification status.");
        }

    
        loadJobListings();
    } catch (err) {
        console.error('Error updating user verification:', err);
    }
}

async function updateUserVerification2(userId, status) {
    try {
      const response = await fetch(`http://localhost:5000/update-user-2`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, status }),
    });
    

        if (!response.ok) {
            throw new Error("Failed to update user verification status.");
        }

        
        loadPosterListings();
    } catch (err) {
        console.error('Error updating user verification:', err);
    }
}
