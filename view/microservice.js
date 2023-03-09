var token;

window.onload = () => {
    token = sessionStorage.getItem("token");
    if (token != undefined) {
        document.getElementById("divLogin").style.display = "none";
        document.getElementById("divMain").style.display = "block";

        getProfile(token);
        getListProduct();
    } else {
        document.getElementById("divLogin").style.display = "block";
        document.getElementById("divMain").style.display = "none";
    }
}

// function get data profile
async function getProfile(token) {
    await fetch("http://localhost:3000/api/auth-service/profile", {
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
        let divHeader = document.getElementsByClassName("headerMain")[0];
        divHeader.innerHTML = `<h1>Halo, ${json.firstName}</h1>`;
    });
}

// function get list product
async function getListProduct() {
    await fetch("http://localhost/product/api/api_tampil.php")
        .then(response => response.json())
        .then(json => {
            showListProduct(json);
        }
    );
}

// function show list product ke page
function showListProduct(json) {
    const divProduct = document.getElementsByClassName("listProduct")[0];

    json.forEach(product => {
        if (product.stok > 0) {
            // create box of product
            let box = document.createElement("div");
            box.className = "boxProduct";

            let namaBarang = document.createElement("h2");
            namaBarang.innerText = product.nama_barang;

            let deskripsiBarang = document.createElement("p");
            deskripsiBarang.innerText = product.deskripsi;

            let hargaBarang = document.createElement("h3");
            hargaBarang.innerText = product.harga;

            let fotoBarang = document.createElement("img");
            fotoBarang.className = "imageProduct";
            fotoBarang.src = "./sampleProduct.png";

            let buttonOrder = document.createElement("button");
            buttonOrder.textContent = "Order";
            buttonOrder.id = "buttonOrder";
            buttonOrder.onclick = () => {
                orderClick(product);
            }

            box.appendChild(fotoBarang);
            box.appendChild(namaBarang);
            box.appendChild(hargaBarang);
            box.appendChild(deskripsiBarang);
            box.appendChild(buttonOrder);
            divProduct.appendChild(box);
        }
    });
}