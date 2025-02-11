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