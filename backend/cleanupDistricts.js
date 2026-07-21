const mongoose = require("mongoose");
require("dotenv").config();

const District = require("./models/District");

const checkDistricts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Connected to MongoDB");

        const districts = await District.find().sort({ name: 1 });

        console.log(`\nTotal districts: ${districts.length}\n`);

        districts.forEach((district, index) => {
            console.log(
                `${index + 1}. ${district.name} | ${district.division} | ${district._id}`
            );
        });

        await mongoose.connection.close();

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkDistricts();