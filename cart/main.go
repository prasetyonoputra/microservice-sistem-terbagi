package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

type Cart struct {
	Id          int       `json:"id"`
	IdUser      string    `json:"id_user"`
	IdBarang    string    `json:"id_barang"`
	QtyBarang   int       `json:"qty_barang"`
	HargaSatuan int       `json:"harga_satuan"`
	CreatedAt   time.Time `json:"created_at"`
	TotalHarga  int       `json:"total_harga"`
	Status      string    `json:"status"`
}

type CartResponse struct {
	Id          int    `json:"id"`
	IdUser      string `json:"id_user"`
	IdBarang    string `json:"id_barang"`
	QtyBarang   int    `json:"qty_barang"`
	HargaSatuan int    `json:"harga_satuan"`
	CreatedAt   string `json:"created_at"`
	TotalHarga  int    `json:"total_harga"`
	Status      string `json:"status"`
}

type ResponseData struct {
	IsAuth bool   `json:"isAuth"`
	Id     string `json:"id"`
}

type ErrorResp struct {
	Error   bool   `json:"error"`
	Message string `json:"message"`
}

func main() {
	host := "localhost"
	port := "5432"
	user := "postgres"
	password := "admin"
	dbname := "microservice"

	// Open a connection to the database
	db, err := sql.Open("postgres", fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbname))
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Initialize router
	r := mux.NewRouter()

	// Define routes
	r.HandleFunc("/listOrder", func(w http.ResponseWriter, r *http.Request) {
		getOrder(w, r, db)
	}).Methods("POST")

	r.HandleFunc("/addOrder", func(w http.ResponseWriter, r *http.Request) {
		addOrder(w, r, db)
	}).Methods("POST")

	r.HandleFunc("/updateStatusOrder", func(w http.ResponseWriter, r *http.Request) {
		updateStatusOrder(w, r, db)
	}).Methods("POST")

	// Start the server
	log.Println("Server started on port 8881")
	log.Fatal(http.ListenAndServe(":8881", r))
}

func getOrder(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	// Get Body Form Method
	type Body struct {
		TokenAuth string `json:"token_auth"`
	}

	var body Body

	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	auth := getAuth(body.TokenAuth)
	log.Println(auth.IsAuth)

	userId := auth.Id

	// Query the database
	sql := "SELECT * FROM cart WHERE id_user = '" + userId + "'"
	rows, err := db.Query(sql)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	// Loop through the rows and scan the results
	var carts []Cart
	for rows.Next() {
		var cart Cart
		err := rows.Scan(&cart.Id,
			&cart.IdUser,
			&cart.IdBarang,
			&cart.QtyBarang,
			&cart.HargaSatuan,
			&cart.CreatedAt,
			&cart.TotalHarga, &cart.Status)
		if err != nil {
			log.Fatal(err)
		}
		carts = append(carts, cart)
	}

	if err := rows.Err(); err != nil {
		log.Fatal(err)
	}

	// Convert time.Time to string in desired format
	var cartResponse []CartResponse
	for _, cart := range carts {
		cartResponse = append(cartResponse, CartResponse{
			Id:          cart.Id,
			IdUser:      cart.IdUser,
			IdBarang:    cart.IdBarang,
			QtyBarang:   cart.QtyBarang,
			HargaSatuan: cart.HargaSatuan,
			CreatedAt:   cart.CreatedAt.Format("2006-01-02 15:04:05"),
			TotalHarga:  cart.TotalHarga,
			Status:      cart.Status,
		})
	}

	// Encode the response as JSON and write to response writer
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(cartResponse)
	if err != nil {
		log.Fatal(err)
	}
}

func addOrder(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	type Body struct {
		TokenAuth   string `json:"token_auth"`
		IdBarang    string `json:"id_barang"`
		QtyBarang   int    `json:"qty_barang"`
		HargaSatuan int    `json:"harga_satuan"`
	}

	var body Body

	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	hargaTotal := body.HargaSatuan * body.QtyBarang

	auth := getAuth(body.TokenAuth)
	checkAuth := auth.IsAuth
	if checkAuth {
		cart := Cart{
			IdUser:      auth.Id,
			IdBarang:    body.IdBarang,
			QtyBarang:   body.QtyBarang,
			HargaSatuan: body.HargaSatuan,
			CreatedAt:   time.Now(),
			TotalHarga:  hargaTotal,
			Status:      "order",
		}
		sqlStatement := `INSERT INTO cart (id_user, id_barang, qty_barang, harga_satuan, created_at, total_harga, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`
		var id int
		err = db.QueryRow(sqlStatement, cart.IdUser, cart.IdBarang, cart.QtyBarang, cart.HargaSatuan, cart.CreatedAt, cart.TotalHarga, cart.Status).Scan(&id)
		if err != nil {
			log.Fatal(err)
		}
		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(cart)
		if err != nil {
			log.Fatal(err)
		}
	} else {
		w.Header().Set("Content-Type", "application/json")
		errorResp := ErrorResp{
			Error:   true,
			Message: "Terjadi Kesalahan",
		}
		err = json.NewEncoder(w).Encode(errorResp)
		if err != nil {
			log.Fatal(err)
		}
	}
}

func updateStatusOrder(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	type Body struct {
		TokenAuth string `json:"token_auth"`
		IdOrder   string `json:"id_order"`
		Status    string `json:"status"`
	}

	var body Body

	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	auth := getAuth(body.TokenAuth)
	checkAuth := auth.IsAuth
	if checkAuth {

		sql := "UPDATE cart SET status = '" + body.Status + "' WHERE id = " + body.IdOrder + ";"

		rows, err := db.Query(sql)
		if err != nil {
			log.Fatal(err)
		}
		defer rows.Close()

		w.Header().Set("Content-Type", "application/json")
		success := ErrorResp{
			Error:   false,
			Message: "Status Order Berhasil Di Proses",
		}
		err = json.NewEncoder(w).Encode(success)
		if err != nil {
			log.Fatal(err)
		}
	} else {
		w.Header().Set("Content-Type", "application/json")
		errorResp := ErrorResp{
			Error:   true,
			Message: "Terjadi Kesalahan",
		}
		err = json.NewEncoder(w).Encode(errorResp)
		if err != nil {
			log.Fatal(err)
		}
	}
}

func getAuth(t string) ResponseData {
	url := "http://localhost:3000/api/auth-service/profile"

	data := map[string]string{
		"token": t,
	}
	payload, err := json.Marshal(data)
	if err != nil {
		fmt.Println(err)
	}

	req, err := http.NewRequest("GET", url, bytes.NewBuffer(payload))
	if err != nil {
		fmt.Println(err)
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println(err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println(err)
	}

	var responseData ResponseData
	err = json.Unmarshal(body, &responseData)
	if err != nil {
		fmt.Println(err)
	}

	return responseData
}
