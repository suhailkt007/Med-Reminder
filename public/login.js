let x = document.getElementById('login'); // Login form
let y = document.getElementById('register'); // Register form
let z = document.getElementById('btn'); // Toggle button
let loginUser = document.getElementById('userid');
let loginPass = document.getElementById('passid');
let registerUser = document.getElementById('registerid');
let registerPass = document.getElementById('registerpass');
let registerEmail = document.getElementById('email');
let message = document.getElementById('message');
let button2 = document.getElementById("secondBtn");

// Switch to Register Form
function register() {
    x.style.left = "-400px";
    y.style.left = "50px";
    z.style.left = "150px";
}

// Switch to Login Form
function login() {
    x.style.left = "0px";
    y.style.left = "450px";
    z.style.left = "0";
}

// Register Form Submission
y.addEventListener("submit", async function (e) {
    e.preventDefault();

    let username = registerUser.value.trim();
    let password = registerPass.value.trim();
    let email = registerEmail.value.trim();

    if (username === "" || password === "" || email === "") {
        message.innerHTML = "Please fill in all fields";
        message.style.color = "red";
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password, email })
        });

        const data = await response.json();

        if (response.ok) {
            message.innerHTML = data.message;
            message.style.color = "rgb(78, 242, 105)";
            setTimeout(() => {
                message.innerHTML = "";
                login(); // Optionally switch to login form
            }, 2000);
        } else {
            message.innerHTML = data.message;
            message.style.color = "red";
        }
    } catch (error) {
        console.error("Registration error:", error);
        message.innerHTML = "Something went wrong during registration";
        message.style.color = "red";
    }
});

// Login Form Submission
x.addEventListener("submit", async function (e) {
    e.preventDefault();

    let username = loginUser.value.trim();
    let password = loginPass.value.trim();

    if (username === "" || password === "") {
        message.innerHTML = "Please fill in both fields";
        message.style.color = "red";
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            message.innerHTML = data.message;
            message.style.color = "rgb(78, 242, 105)";
            localStorage.setItem("token", data.token); // Save JWT token
            localStorage.setItem("userId", data.userId); // Save JWT token

            setTimeout(() => {
                window.location.href = "main.html"; // Redirect on success
            }, 1500);
        } else {
            message.innerHTML = data.message;
            message.style.color = "red";
        }
    } catch (error) {
        console.error("Login error:", error);
        message.innerHTML = "Something went wrong during login";
        message.style.color = "red";
    }
});

// Handle second button click (switch to login)
button2.addEventListener("click", function () {
    login();
});

   
   
   
   
   
   
   
   
   
   
   // let x = document.getElementById('login'); // Login form
    // let y = document.getElementById('register'); // Register form
    // let z = document.getElementById('btn'); // Toggle button
    // let loginUser = document.getElementById('userid');
    // let loginPass = document.getElementById('passid');
    // let registerUser = document.getElementById('registerid');
    // let registerPass = document.getElementById('registerpass');
    // let registerEmail = document.getElementById('email');
    // let message = document.getElementById('message');
    // let button2 = document.getElementById("secondBtn");

    // // Switch to Register Form
    // function register() {
    //     x.style.left = "-400px";
    //     y.style.left = "50px";
    //     z.style.left = "120px";
    // }

    // // Switch to Login Form
    // function login() {
    //     x.style.left = "50px";
    //     y.style.left = "450px";
    //     z.style.left = "0";
    // }

    // // Register Form Submission
    // y.addEventListener("submit", function (e) {
    //     e.preventDefault();

    //     let username = registerUser.value.trim();
    //     let password = registerPass.value.trim();
    //     let email = registerEmail.value.trim();

    //     if (username === "" || password === "" || email === "") {
    //         message.innerHTML = "Please fill in all fields";
    //         return;
    //     }
    //     let user = { username, password };
    //     localStorage.setItem("user", JSON.stringify(user));
    //     message.innerHTML = "You have successfully registered";
    //     message.style.color = "rgb(78, 242, 105)";
    //     setTimeout(function () {
    //         message.innerHTML = ""
    //     }, 2000);
    //     console.log(`username ${username}`);
    //     console.log(`password ${password}`);
    //     console.log(`email ${email}`);
    // });
    // x.addEventListener("submit", function (e) {
    //     e.preventDefault();

    //     let storedUser = JSON.parse(localStorage.getItem("user")); // Retrieve stored user data

    //     if (!storedUser) {
    //         message.innerHTML = "No registered users found";
    //         setTimeout(function () {
    //             message.innerHTML = ""
    //         }, 2000);
    //         return;
    //     }

    //     let enteredUser = loginUser.value.trim();
    //     let enteredPass = loginPass.value.trim();

    //     if (enteredUser === storedUser.username && enteredPass === storedUser.password) {
    //         message.innerHTML = "You have successfully logged in.";
    //         message.style.color="rgb(78, 242, 105)";
    //         setTimeout(function () {
    //             window.location.href = "main.html";
    //         }, 1500);
    //     } else {
    //         message.innerHTML = "Invalid login credentials!!.";
    //         message.style.color="red";
    //     }
    // });
    // button2.addEventListener("click", function () {
    //     login();
    // });
