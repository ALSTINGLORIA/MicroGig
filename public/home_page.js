const signup_btn = document.getElementById("signup-btn");
const login_btn = document.getElementById("login-btn");

function goToSignupPage(){
    window.location.href = "signup_page.html";
}

function goToLoginPage(){
    window.location.href = "login_page.html";
}

signup_btn.onclick = goToSignupPage;
login_btn.onclick = goToLoginPage;

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('message') && urlParams.get('message') === 'success') {
    alert('Successfully signed in');
}
else if(urlParams.has('message') && urlParams.get('message') === 'blacklisted'){
    alert('You have been removed from our platform due to certain reasons. Please contact us for more information.');
}