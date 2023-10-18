const {Schema, model} = require("mongoose");



const UserSchema = new Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    diskSpace: {type: Number, default: 1024**3*10},
    usedSpace: {type: Number, default: 0},
    avatar: {type: String},
    files: [{type: Schema.Types.ObjectId, ref: "File"}],
    isActivated: {type: Boolean, default: false},
    activationLink: {type: String},
});


module.exports = model("User", UserSchema);