const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    name: {
        type: String,
        require: [true, "Please enter the unique Username"],
        unique: true
    },
    password: {
        type: String,
        require: [true, "Please enter the Password"],
        min: 4
    },
    token: {
        type: String
    },
    storage: {
        type: Number,
        require: [true, "Please enter the storage size"],
    },
    left: {
        type: Number,
        require: [true, "Please enter the storage size left"],
    }
},
    {
        timestamps: true
    });

const UserDetails = mongoose.model("userDetail", userSchema);
module.exports = UserDetails;
