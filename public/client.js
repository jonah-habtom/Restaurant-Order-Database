//Funtion that handles sending a login request to the server
function sendLoginReq() {
    //Gets the username and password entered by the user and formulates an object with it
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let loginData = {user: username, pass: password};

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState === 4 && xhttp.status === 404) {
            //Alerts the user if the server cannot find the user
            alert("That username/password does not exist. Please try again");
        } else if (xhttp.readyState === 4 && xhttp.status === 200) {
            //Redirects the user to the home page if the user successfully logs in
            window.location.href = "/";
        }
    }
    xhttp.open("POST", "/login");
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(loginData));
}

//Function that handles sending a request for registering a new user to the server
function sendRegistrationReq() {
     //Gets the username and password entered by the user and formulates an object with it
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let newUser = {user: username, pass: password};

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState === 4 && xhttp.status === 400) {
            alert("Please enter a password");
        } else if (xhttp.readyState === 4 && xhttp.status === 409) {
            alert("That username has already been taken");
        } else if (xhttp.readyState === 4 && xhttp.status === 200) {
            //Redirects the user to the profile for the new user
            window.location.href = "/users/" + JSON.parse(xhttp.responseText);
        }
    }
    xhttp.open("POST", "/register");
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(newUser));
}

//Function that sends a request to the server to update a user's privacy setting
function sendUpdatePrivacyReq() {
    //Gets the value of the radio buttons
    let private = document.getElementById("on").checked;
    let notPrivate = document.getElementById("off").checked;
    let privacy = {on: private, off: notPrivate};

    let xhttp = new XMLHttpRequest();
    xhttp.open("PUT", "/user");
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(privacy));
}