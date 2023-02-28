const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');
const db = require('./config/config').get(process.env.NODE_ENV);
const User = require('./models/user');

const app = express();
app.use(bodyparser.urlencoded({
    extended: false
}));
app.use(bodyparser.json());
app.use(cookieParser());

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

// Register user
app.post('/api/auth-service/register', function (req, res) {
    const newUser = new User(req.body);

    if (newUser.password != newUser.password2) return res.status(400).json({
        message: "Password tidak sesuai!"
    });

    User.findOne({
        email: newUser.email
    }, function (err, user) {
        if (user) return res.status(400).json({
            isAuth: false,
            message: "Email sudah terdaftar"
        });

        newUser.save((err, doc) => {
            if (err) {
                console.log(err);
                return res.status(400).json({
                    success: false
                });
            }

            res.status(200).json({
                success: true,
                user: doc
            });
        });
    });
});

// login user
app.post('/api/auth-service/login', function (req, res) {
    let email = req.body.email;
    let password = req.body.password;

    User.findOne({
        'email': req.body.email
    }, function (err, user) {
        if (!user) return res.json({
            isAuth: false,
            message: ' Email tidak ditemukan!'
        });

        if (!user.token) {
            user.comparepassword(req.body.password, (err, isMatch) => {
                if (!isMatch) return res.json({
                    isAuth: false,
                    message: "Password salah!"
                });

                user.generateToken((err, user) => {
                    if (err) return res.status(400).send(err);
                    res.status(200).json({
                        isAuth: true,
                        email: user.email,
                        token: user.token
                    });
                });
            });
        } else {
            res.status(400).json({
                isAuth: false,
                message: "Email ini telah login!"
            });
        }
    });
});

// User profile
app.get('/api/auth-service/profile', function (req, res) {
    let token = req.body.token;

    User.findOne({
        token: token
    }, function (err, user) {
        if (!user) return res.status(400).json({
            isAuth: false,
            message: "Token tidak sesuai"
        });

        res.status(200).json({
            isAuth: true,
            id: user._id,
            token: user.token,
            email: user.email,
            noHp: user.noHp,
            alamat: user.alamat
        })
    });
});

// Cek token
app.get('/api/auth-service/cek', function (req, res) {
    let token = req.body.token;

    User.findOne({
        token: token
    }, function (err, user) {
        if (!user) return res.status(400).json({
            isAuth: false,
            message: "Token tidak sesuai"
        });

        res.status(200).json({
            isAuth: true
        })
    });
});

// Delete User
app.post('/api/auth-service/delete', function (req, res) {
    let token = req.body.token;

    User.findOne({
        token: token
    }, function (err, user) {
        if (!user) return res.status(400).json({
            isAuth: false,
            message: "Token tidak sesuai"
        });

        User.deleteOne({
                token: token
            },
            (err) => {
                res.status(200).json({
                    message: "Sukses delete!"
                });
            }
        )
    })
});

//Edit user
app.get('/api/auth-service/edit', function (req, res) {
    let token = req.body.token;

    User.findOne({
        token: token
    }, function (err, user) {
        if (!user) return res.status(400).json({
            isAuth: false,
            message: "Token tidak sesuai"
        });

        User.replaceOne({
            token: token
            }, {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                password: user.password,
                password2: user.password2,
                noHp: req.body.noHp,
                alamat: req.body.alamat,
                token: token
            }, {
                overwrite: true
            },
            (err) => {
                if (!err) {
                    res.json({
                        message: "Sukses edit!"
                    })
                } else {
                    console.log(err)
                }
            }
        )
    })
});

//logout user
app.get('/api/auth-service/logout', function (req, res) {
    let token = req.body.token;

    User.findOne({
        token: token
    }, function (err, user) {
        if (!user) return res.status(400).json({
            isAuth: false,
            message: "Token tidak sesuai"
        });

        User.replaceOne({
            token: token
            }, {
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                password: user.password,
                password2: user.password2,
                noHp: user.noHp,
                alamat: user.alamat
            }, {
                overwrite: true
            },
            (err) => {
                if (!err) {
                    res.json({
                        message: "Sukses logout!"
                    })
                } else {
                    console.log(err)
                }
            }
        )
    })
});

// listening port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Jalan di port: ${PORT}`);
});