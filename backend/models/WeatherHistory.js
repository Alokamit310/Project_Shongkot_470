const mongoose = require("mongoose");

const weatherHistorySchema = new mongoose.Schema(
{
    district:{
        type:String,
        required:true
    },

    rainfall:{
        type:Number,
        default:0
    },

    temperature:{
        type:Number,
        default:0
    },

    humidity:{
        type:Number,
        default:0
    },

    floodRisk:{
        type:String,
        enum:["Low","Medium","High"],
        default:"Low"
    }

},
{
    timestamps:true
});

module.exports = mongoose.model("WeatherHistory",weatherHistorySchema);