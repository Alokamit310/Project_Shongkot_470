const mongoose = require("mongoose");

const broadcastSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true,
        trim: true,
    },

    message: {
        type: String,
        required: true,
        trim: true,
    },

    district: {
        type: String,
        required: true,
    },

    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
},
{
    timestamps: true,
}
);

module.exports = mongoose.model("Broadcast", broadcastSchema);