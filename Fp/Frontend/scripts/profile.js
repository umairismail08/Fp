// === FINAL AND COMPLETE profile.js FILE ===

document.addEventListener('DOMContentLoaded', () => {
    // This is the main function that runs when the profile page loads
    
    const userString = localStorage.getItem('user');
    
    if (userString) {
        // If a user is found, parse the data
        const user = JSON.parse(userString);
        
        // Fill the page with the user's data
        populateProfileData(user);
        
        // Set up the logic for the Edit/Save button
        setupEditButton(user); 
        
        // Set up the logic for the sidebar tabs
        setupProfileTabs(); // This line calls the function, fixing the error

         loadAddresses();

         setupAddressModal();
    } else {
        // If no user is logged in, redirect to login
        window.location.href = 'login.html';
    }
});


function populateProfileData(user) {
    // This function fills the sidebar and the form with the user's current data
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;

    const nameParts = user.name.split(' ');
    document.getElementById('firstName').value = nameParts[0] || '';
    document.getElementById('lastName').value = nameParts.slice(1).join(' ') || '';
    document.getElementById('email').value = user.email;
}


function setupEditButton(currentUser) {
    const editBtn = document.querySelector('.content-header .btn');
    const formInputs = document.querySelectorAll('#personal .form-input'); // More specific selector

    if (!editBtn) return;

    // Clone the button to remove any old, stacked event listeners
    const newBtn = editBtn.cloneNode(true);
    editBtn.parentNode.replaceChild(newBtn, editBtn);

    // Add a single, clean event listener to the new button
    newBtn.addEventListener('click', () => {
        const isSaveMode = newBtn.textContent.trim() === 'Save';

        if (isSaveMode) {
            // --- This runs when you click "SAVE" ---
            const newFirstName = document.getElementById('firstName').value;
            const newLastName = document.getElementById('lastName').value;
            const newEmail = document.getElementById('email').value;
            const newFullName = `${newFirstName} ${newLastName}`.trim();
            
            const updatedData = { name: newFullName, email: newEmail };

            // Send the new data to the backend PHP script
            fetch('/fp/backend/update_profile.php', { // Make sure this path is correct
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update localStorage
                    const updatedUser = { ...currentUser, ...updatedData };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    
                    // Update the sidebar in real-time
                    populateProfileData(updatedUser); 
                    alert('Profile updated successfully!');
                } else {
                    alert('Error saving profile: ' + data.message);
                }
            });

            // Revert UI back to "view" mode
            newBtn.textContent = 'Edit';
            formInputs.forEach(input => input.setAttribute('readonly', true));

        } else {
            // --- This runs when you click "EDIT" ---
            newBtn.textContent = 'Save';
            formInputs.forEach(input => input.removeAttribute('readonly'));
        }
    });
}

// Replace your existing function with this one
function setupProfileTabs() {
    const navLinks = document.querySelectorAll('.profile-nav-link');
    const tabContents = document.querySelectorAll('.tab-content');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get the target tab from the link's data-tab attribute
            const tabId = link.dataset.tab;

            // Update which link is highlighted
            navLinks.forEach(nav => nav.classList.remove('active'));
            link.classList.add('active');

            // Show and hide the correct content sections
            tabContents.forEach(content => {
                if (content.id === tabId) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });
}

function loadAddresses() {
    fetch('/fp/backend/get_addresses.php') // Make sure this path is correct
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('addressesGrid');
            if (!container) return;

            if (data.success && data.addresses.length > 0) {
                container.innerHTML = data.addresses.map(addr => `
                    <div class="address-card">
                        <div class="address-header">
                            <h3>Address</h3>
                            ${addr.is_default ? '<span class="address-badge default">Default</span>' : ''}
                        </div>
                        <div class="address-details">
                            <p>${addr.address_line1}</p>
                            ${addr.address_line2 ? `<p>${addr.address_line2}</p>` : ''}
                            <p>${addr.city}, ${addr.state} ${addr.zip_code}</p>
                        </div>
                        <div class="address-actions">
                            <button class="btn btn-outline">Edit</button>
                            <button class="btn btn-outline">Delete</button>
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = "<p>You have not added any addresses yet.</p>";
            }
        });
}

function setupAddressModal() {
    const addAddressBtn = document.querySelector('#addresses .btn-primary');
    const modal = document.getElementById('addAddressModal');
    const closeModalBtn = document.getElementById('closeAddressModal');
    const addressForm = document.getElementById('addAddressForm');

    if (!addAddressBtn || !modal || !closeModalBtn || !addressForm) {
        return; // Exit if elements aren't on the page
    }

    // Show the modal when "Add New Address" is clicked
    addAddressBtn.addEventListener('click', () => {
        modal.classList.add('show');
    });

    // Hide the modal
    closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });

    // Handle form submission
    addressForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newAddress = {
            addressLine1: document.getElementById('addressLine1').value,
            addressLine2: document.getElementById('addressLine2').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            zipCode: document.getElementById('zipCode').value,
        };

        fetch('/fp/backend/add_address.php', { // Make sure this path is correct
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAddress)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Address added successfully!');
                modal.classList.remove('show');
                addressForm.reset();
                loadAddresses(); // Reload the addresses on the page
            } else {
                alert('Error: ' + data.message);
            }
        });
    });
}