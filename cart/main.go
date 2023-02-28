package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

type User struct {
	id        int       `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

type UserResponse struct {
	id        int    `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	CreatedAt string `json:"created_at"`
}

type Cart struct {
	id          int       `json:"id"`
	idBarang    int       `json:"idBarang"`
	idUser      string    `json:"idUser"`
	CreatedAt   time.Time `json:"createdAt"`
	qtyBarang   int       `json:"qtyBarang"`
	hargaSatuan int       `json:"hargaSatuan"`
}

type CartResponse struct {
	id          int    `json:"id"`
	idBarang    int    `json:"idBarang"`
	idUser      string `json:"idUser"`
	CreatedAt   string `json:"createdAt"`
	qtyBarang   int    `json:"qtyBarang"`
	hargaSatuan int    `json:"hargaSatuan"`
}

func main() {
	// Set connection parameters
	host := "localhost"
	port := "5432"
	user := "postgres"
	password := "password"
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
	r.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
		getUsers(w, r, db)
	}).Methods("GET")

	r.HandleFunc("/cart", func(w http.ResponseWriter, r *http.Request) {
		getCart(w, r, db)
	}).Methods("GET")

	// Start the server
	log.Println("Server started on port 8881")
	log.Fatal(http.ListenAndServe(":8881", r))
}

func getUsers(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	// Query the database
	rows, err := db.Query("SELECT id, name, email, created_at FROM users")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	// Loop through the rows and scan the results
	var users []User
	for rows.Next() {
		var user User
		err := rows.Scan(&user.id, &user.Name, &user.Email, &user.CreatedAt)
		if err != nil {
			log.Fatal(err)
		}
		users = append(users, user)
	}
	if err := rows.Err(); err != nil {
		log.Fatal(err)
	}

	// Convert time.Time to string in desired format
	var userResponses []UserResponse
	for _, user := range users {
		userResponses = append(userResponses, UserResponse{
			id:        user.id,
			Name:      user.Name,
			Email:     user.Email,
			CreatedAt: user.CreatedAt.Format("2006-01-02 15:04:05"),
		})
	}

	// Encode the response as JSON and write to response writer
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(userResponses)
	if err != nil {
		log.Fatal(err)
	}
}

func getCart(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	// Query the database
	rows, err := db.Query("SELECT * FROM cart")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	// Loop through the rows and scan the results
	var carts []Cart
	for rows.Next() {
		var cart Cart
		err := rows.Scan(&cart.id,
			&cart.idBarang,
			&cart.idUser,
			&cart.CreatedAt,
			&cart.qtyBarang,
			&cart.hargaSatuan)
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
			id:          cart.id,
			idBarang:    cart.idBarang,
			idUser:      cart.idUser,
			CreatedAt:   cart.CreatedAt.Format("2006-01-02 15:04:05"),
			qtyBarang:   cart.qtyBarang,
			hargaSatuan: cart.hargaSatuan,
		})
	}

	// Encode the response as JSON and write to response writer
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(cartResponse)
	if err != nil {
		log.Fatal(err)
	}
}
