let usersData = [];

// Show a message in the designated element
function showMessage(type, message) {
    const errorEl = document.getElementById('errorMsg');
    const successEl = document.getElementById('successMsg');
    const loadingEl = document.getElementById('loading');
    
    // Hide all messages first
    errorEl.style.display = 'none';
    successEl.style.display = 'none';
    loadingEl.style.display = 'none';

    if (type === 'error') {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    } else if (type === 'success') {
        successEl.textContent = message;
        successEl.style.display = 'block';
    } else if (type === 'loading') {
        loadingEl.textContent = message;
        loadingEl.style.display = 'block';
    }
}

// Fetch user data from the API
async function fetchUsers() {
    try {
        const response = await fetch('https://dummyjson.com/users');
        if (!response.ok) {
            throw new Error('Failed to fetch user data.');
        }
        const data = await response.json();
        usersData = data.users;
    } catch (error) {
        showMessage('error', error.message);
    }
}

// Handle the login form submission
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const loginBtn = document.getElementById('loginBtn');

    if (!username || !password) {
        showMessage('error', 'Username and password cannot be empty.');
        return;
    }
    
    // Disable button and show loading state
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';
    showMessage('loading', 'Authenticating...');

    // Simulate network delay for better UX
    setTimeout(() => {
        const user = usersData.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
        
        // Re-enable button
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';

        if (user) {
            // ** CRITICAL CHANGE: Use 'user' key to be compatible with main script **
            localStorage.setItem('user', user.firstName);
            showMessage('success', 'Login successful! Redirecting...');

            // Redirect to the main recipes page
            setTimeout(() => {
                window.location.href = 'index.html'; 
            }, 1000);
        } else {
            showMessage('error', 'Invalid username or password.');
        }
    }, 1000); 
}

// Attach event listeners once the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', handleLogin);

    // Fetch users when the page loads
    fetchUsers();
});