const Hospital = require("../models/Hospital");
const District = require("../models/District");

// ======================================================
// One hospital coverage for every Bangladesh district
// ======================================================

const DISTRICT_HOSPITALS = [
    // BARISAL
    ["Barguna", "Barguna District Hospital"],
    ["Barisal", "Sher-e-Bangla Medical College Hospital"],
    ["Bhola", "Bhola District Hospital"],
    ["Jhalokati", "Jhalokati District Hospital"],
    ["Patuakhali", "Patuakhali District Hospital"],
    ["Pirojpur", "Pirojpur District Hospital"],

    // CHATTOGRAM
    ["Bandarban", "Bandarban District Hospital"],
    ["Brahmanbaria", "Brahmanbaria District Hospital"],
    ["Chandpur", "Chandpur District Hospital"],
    ["Chattogram", "Chattogram Medical College Hospital"],
    ["Cumilla", "Cumilla General Hospital"],
    ["Cox's Bazar", "Cox's Bazar General Hospital"],
    ["Feni", "Feni District Hospital"],
    ["Khagrachhari", "Khagrachhari District Hospital"],
    ["Lakshmipur", "Lakshmipur District Hospital"],
    ["Noakhali", "Noakhali District Hospital"],
    ["Rangamati", "Rangamati District Hospital"],

    // DHAKA
    ["Dhaka", "Dhaka Medical College Hospital"],
    ["Faridpur", "Faridpur General Hospital"],
    ["Gazipur", "Gazipur District Hospital"],
    ["Gopalganj", "Gopalganj District Hospital"],
    ["Kishoreganj", "Kishoreganj District Hospital"],
    ["Madaripur", "Madaripur District Hospital"],
    ["Manikganj", "Manikganj District Hospital"],
    ["Munshiganj", "Munshiganj General Hospital"],
    ["Narayanganj", "Narayanganj General Hospital"],
    ["Narsingdi", "Narsingdi District Hospital"],
    ["Rajbari", "Rajbari District Hospital"],
    ["Shariatpur", "Shariatpur District Hospital"],
    ["Tangail", "Tangail District Hospital"],

    // KHULNA
    ["Bagerhat", "Bagerhat District Hospital"],
    ["Chuadanga", "Chuadanga District Hospital"],
    ["Jessore", "Jessore General Hospital"],
    ["Jhenaidah", "Jhenaidah District Hospital"],
    ["Khulna", "Khulna Medical College Hospital"],
    ["Kushtia", "Kushtia Medical College Hospital"],
    ["Magura", "Magura District Hospital"],
    ["Meherpur", "Meherpur District Hospital"],
    ["Narail", "Narail District Hospital"],
    ["Satkhira", "Satkhira Sadar Hospital"],

    // MYMENSINGH
    ["Jamalpur", "Jamalpur District Hospital"],
    ["Mymensingh", "Mymensingh Medical College Hospital"],
    ["Netrokona", "Netrokona District Hospital"],
    ["Sherpur", "Sherpur District Hospital"],

    // RAJSHAHI
    ["Bogura", "Bogura General Hospital"],
    ["Joypurhat", "Joypurhat District Hospital"],
    ["Naogaon", "Naogaon District Hospital"],
    ["Natore", "Natore District Hospital"],
    ["Nawabganj", "Nawabganj District Hospital"],
    ["Pabna", "Pabna General Hospital"],
    ["Rajshahi", "Rajshahi Medical College Hospital"],
    ["Sirajganj", "Sirajganj District Hospital"],

    // RANGPUR
    ["Dinajpur", "Dinajpur Medical College Hospital"],
    ["Gaibandha", "Gaibandha District Hospital"],
    ["Kurigram", "Kurigram District Hospital"],
    ["Lalmonirhat", "Lalmonirhat District Hospital"],
    ["Nilphamari", "Nilphamari District Hospital"],
    ["Panchagarh", "Panchagarh District Hospital"],
    ["Rangpur", "Rangpur Medical College Hospital"],
    ["Thakurgaon", "Thakurgaon District Hospital"],

    // SYLHET
    ["Habiganj", "Habiganj District Hospital"],
    ["Moulvibazar", "Moulvibazar District Hospital"],
    ["Sunamganj", "Sunamganj District Hospital"],
    ["Sylhet", "Sylhet MAG Osmani Medical College Hospital"],
];


// ======================================================
// Generate realistic hospital data
// ======================================================

function generateHospitalData(district, name, index, districtInfo) {

    const totalBeds = 150 + ((index * 37) % 500);

    const availableBeds = Math.max(
        10,
        Math.floor(
            totalBeds * (0.15 + ((index % 5) * 0.04))
        )
    );

    const icuBeds = Math.max(
        4,
        Math.floor(totalBeds * 0.04)
    );

    const ambulanceAvailable = index % 4 !== 0;

    return {
        name,

        district,

        address: `${district} Sadar, Bangladesh`,

        phone: `+880-2-${5000000 + index}`,

        // Take coordinates from District collection
        latitude: districtInfo.latitude,

        longitude: districtInfo.longitude,

        totalBeds,

        availableBeds,

        icuBeds,

        emergencyServices:
            "Emergency medicine, trauma care, ICU, ambulance support",

        ambulanceAvailable,

        emergencyAvailable: true,

        status: "Open",
    };
}


// ======================================================
// Seed one hospital for every district
// ======================================================

async function seedHospitals() {

    console.log("🏥 Starting hospital seeding...");

    let created = 0;
    let skipped = 0;

    for (let i = 0; i < DISTRICT_HOSPITALS.length; i++) {

        const [district, hospitalName] =
            DISTRICT_HOSPITALS[i];

        // Find district coordinates
        const districtInfo = await District.findOne({
            name: district,
        });

        if (!districtInfo) {

            console.log(
                `⚠️ District not found: ${district}`
            );

            continue;
        }

        // Check if district already has a hospital
        const existingHospital = await Hospital.findOne({
            district: district,
        });

        if (existingHospital) {

            console.log(
                `⏭️ Skipped ${district} - hospital already exists`
            );

            skipped++;

            continue;
        }

        const hospitalData = generateHospitalData(
            district,
            hospitalName,
            i,
            districtInfo
        );

        await Hospital.create(hospitalData);

        console.log(
            `✅ Added hospital for ${district}`
        );

        created++;
    }

    const totalHospitals =
        await Hospital.countDocuments();

    console.log("--------------------------------------");

    console.log(
        `✅ Hospital seeding completed`
    );

    console.log(
        `🆕 New hospitals created: ${created}`
    );

    console.log(
        `⏭️ Existing districts skipped: ${skipped}`
    );

    console.log(
        `🏥 Total hospitals now: ${totalHospitals}`
    );

    console.log("--------------------------------------");

    return totalHospitals;
}


module.exports = {
    seedHospitals,
};