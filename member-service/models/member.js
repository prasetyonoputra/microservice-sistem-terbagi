var mongoose = require('mongoose');

const memberSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        maxlength: 100
    },
    lastname: {
        type: String,
        required: true,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: 1
    }
});

module.exports = mongoose.model('Member', memberSchema);