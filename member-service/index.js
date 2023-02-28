const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const db = require('./config/config').get(process.env.NODE_ENV);
const Member = require('./models/member');


const app = express();
app.use(bodyparser.urlencoded({
    extended: false
}));
app.use(bodyparser.json());

mongoose.Promise = global.Promise;
mongoose.connect(db.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, function (err) {
    if (err) console.log(err);
    console.log("Database Member is connected");
});

app.get('/api/member-service', function (req, res) {
    res.status(200).send(`Welcome to member-service!`);
});

app.post('/api/member-service/register', function (req, res) {
    const newMember = new Member(req.body);

    newMember.save((err, doc) => {
        if (err) {
            console.log(err);
            return res.status(400).json({
                success: false
            });
        }

        res.status(200).json({
            succes: true,
            user: doc
        });

        console.log("Member saved!");
    });
});

app.get('/api/member-service/profile', function (req, res) {
    
});

// listening port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Jalan di port: ${PORT}`);
});