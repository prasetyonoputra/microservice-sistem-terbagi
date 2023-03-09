// event login
let buttonLogin = document.getElementById("buttonLogin");
buttonLogin.addEventListener("click", () => {
    let email = document.getElementById("email");
    let password = document.getElementById("password");

    fetch("http://localhost:3000/api/auth-service/login", {
        method: "POST",
        
        body: JSON.stringify({
            email: email.value,
            password: password.value
        }),
        
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(response => response.json())
    .then(json => {
        sessionStorage.setItem("token", json.token);
        location.reload();
    });
});


// event logout
let buttonLogout = document.getElementById("buttonLogout")
buttonLogout.addEventListener("click", () => {
    fetch("http://localhost:3000/api/auth-service/logout", {
        method: "POST",
        
        body: JSON.stringify({
            token: token
        }),
        
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(response => response.json())
    .then(json => {
        console.log(json);
        sessionStorage.removeItem("token");
        location.reload();
    });
});

// function saat klik order
async function orderClick(product) {
    console.log(product);

    await fetch("http://localhost:8881/addOrder", {
        method: "POST",
        
        body: JSON.stringify({
            token: token
        }),
        
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(response => response.json())
    .then(json => {
        console.log(json);
    });
}