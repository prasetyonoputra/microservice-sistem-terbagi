const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');
const db = require('./config/config').get(process.env.NODE_ENV);
const User = require('./models/user');
const {
    auth
} = require('./middlewares/auth');
const axios = require('axios');

const app = express();
// app use
app.use(bodyparser.urlencoded({
    extended: false
}));
app.use(bodyparser.json());
app.use(cookieParser());

// database connection
mongoose.Promise = global.Promise;
mongoose.connect(db.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, function (err) {
    if (err) console.log(err);
    console.log("Database Auth is connected");
});


app.get('/api/auth-service', function (req, res) {
    res.status(200).send(`Welcome to auth-service!`);
});

// adding new user (sign-up route)
app.post('/api/auth-service/register', function (req, res) {
    const newuser = new User(req.body);

    if (newuser.password != newuser.password2) return res.status(400).json({
        message: "password not match"
    });

    User.findOne({
        email: newuser.email
    }, function (err, user) {
        if (user) return res.status(400).json({
            auth: false,
            message: "Email sudah terdaftar"
        });

        newuser.save((err, doc) => {
            if (err) {
                console.log(err);
                return res.status(400).json({
                    success: false
                });
            }


            axios.post('http://localhost:3001/api/member-service/register', {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email
              })
              .then(function (response) {
                console.log(response);
              })
              .catch(function (error) {
                console.log(error);
              });


            res.status(200).json({
                succes: true,
                user: doc
            });
        });
    });
});


// login user
app.post('/api/auth-service/login', function (req, res) {
    let token = req.cookies.auth;

    console.log(req.cookies.auth);

    User.findByToken(token, (err, user) => {
        if (err) return res(err);
        if (user) return res.status(400).json({
            error: true,
            message: "Email ini telah login"
        });

        else {
            User.findOne({
                'email': req.body.email
            }, function (err, user) {
                if (!user) return res.json({
                    isAuth: false,
                    message: ' Auth failed ,email not found'
                });

                user.comparepassword(req.body.password, (err, isMatch) => {
                    if (!isMatch) return res.json({
                        isAuth: false,
                        message: "password doesn't match"
                    });

                    user.generateToken((err, user) => {
                        if (err) return res.status(400).send(err);
                        res.cookie('auth', user.token).json({
                            isAuth: true,
                            id: user._id,
                            email: user.email
                        });
                    });
                });
            });
        }
    });
});


// get logged in user
app.get('/api/auth-service/profile', auth, function (req, res) {
    res.json({
        isAuth: true,
        id: req.user._id,
        email: req.user.email,
        name: req.user.firstname + req.user.lastname

    })
});


//logout user
app.get('/api/auth-service/logout', auth, function (req, res) {
    req.user.deleteToken(req.token, (err, user) => {
        if (err) return res.status(400).send(err);
        res.sendStatus(200);
    });

});

// listening port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Jalan di port: ${PORT}`);
});