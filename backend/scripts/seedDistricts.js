const District = require('../models/District');

const BANGLADESH_DISTRICTS = [
  { name: 'Barguna', division: 'Barisal', latitude: 22.0953, longitude: 90.1125 },
  { name: 'Barisal', division: 'Barisal', latitude: 22.7010, longitude: 90.3711 },
  { name: 'Bhola', division: 'Barisal', latitude: 22.6850, longitude: 90.6465 },
  { name: 'Jhalokati', division: 'Barisal', latitude: 22.6406, longitude: 90.1987 },
  { name: 'Patuakhali', division: 'Barisal', latitude: 22.3547, longitude: 90.3298 },
  { name: 'Pirojpur', division: 'Barisal', latitude: 22.5792, longitude: 89.9752 },
  { name: 'Bandarban', division: 'Chattogram', latitude: 22.1959, longitude: 92.2186 },
  { name: 'Brahmanbaria', division: 'Chattogram', latitude: 23.9608, longitude: 91.1115 },
  { name: 'Chandpur', division: 'Chattogram', latitude: 23.2333, longitude: 90.6715 },
  { name: 'Chattogram', division: 'Chattogram', latitude: 22.3569, longitude: 91.7832 },
  { name: 'Cumilla', division: 'Chattogram', latitude: 23.4573, longitude: 91.1809 },
  { name: 'Cox\'s Bazar', division: 'Chattogram', latitude: 21.4272, longitude: 92.0058 },
  { name: 'Feni', division: 'Chattogram', latitude: 23.0159, longitude: 91.3960 },
  { name: 'Khagrachhari', division: 'Chattogram', latitude: 23.1193, longitude: 91.9847 },
  { name: 'Lakshmipur', division: 'Chattogram', latitude: 22.9444, longitude: 90.8305 },
  { name: 'Noakhali', division: 'Chattogram', latitude: 22.8696, longitude: 91.0990 },
  { name: 'Rangamati', division: 'Chattogram', latitude: 22.6552, longitude: 92.1780 },
  { name: 'Dhaka', division: 'Dhaka', latitude: 23.8103, longitude: 90.4125 },
  { name: 'Faridpur', division: 'Dhaka', latitude: 23.6072, longitude: 89.8426 },
  { name: 'Gazipur', division: 'Dhaka', latitude: 24.0958, longitude: 90.4125 },
  { name: 'Gopalganj', division: 'Dhaka', latitude: 23.0052, longitude: 89.8266 },
  { name: 'Kishoreganj', division: 'Dhaka', latitude: 24.4260, longitude: 90.7852 },
  { name: 'Madaripur', division: 'Dhaka', latitude: 23.1645, longitude: 90.1897 },
  { name: 'Manikganj', division: 'Dhaka', latitude: 23.8617, longitude: 90.0003 },
  { name: 'Munshiganj', division: 'Dhaka', latitude: 23.5422, longitude: 90.5305 },
  { name: 'Narayanganj', division: 'Dhaka', latitude: 23.6136, longitude: 90.5018 },
  { name: 'Narsingdi', division: 'Dhaka', latitude: 23.9227, longitude: 90.7176 },
  { name: 'Rajbari', division: 'Dhaka', latitude: 23.7576, longitude: 89.6446 },
  { name: 'Shariatpur', division: 'Dhaka', latitude: 23.2423, longitude: 90.4308 },
  { name: 'Tangail', division: 'Dhaka', latitude: 24.2513, longitude: 89.9167 },
  { name: 'Bagerhat', division: 'Khulna', latitude: 22.6516, longitude: 89.7852 },
  { name: 'Chuadanga', division: 'Khulna', latitude: 23.6406, longitude: 88.8414 },
  { name: 'Jessore', division: 'Khulna', latitude: 23.1667, longitude: 89.2087 },
  { name: 'Jhenaidah', division: 'Khulna', latitude: 23.5448, longitude: 89.1536 },
  { name: 'Khulna', division: 'Khulna', latitude: 22.8456, longitude: 89.5403 },
  { name: 'Kushtia', division: 'Khulna', latitude: 23.9013, longitude: 89.1197 },
  { name: 'Magura', division: 'Khulna', latitude: 23.4859, longitude: 89.4197 },
  { name: 'Meherpur', division: 'Khulna', latitude: 23.7620, longitude: 88.6310 },
  { name: 'Narail', division: 'Khulna', latitude: 23.1458, longitude: 89.5020 },
  { name: 'Satkhira', division: 'Khulna', latitude: 22.7185, longitude: 89.0705 },
  { name: 'Jamalpur', division: 'Mymensingh', latitude: 24.9247, longitude: 89.9487 },
  { name: 'Mymensingh', division: 'Mymensingh', latitude: 24.7471, longitude: 90.4203 },
  { name: 'Netrokona', division: 'Mymensingh', latitude: 24.8700, longitude: 90.7270 },
  { name: 'Sherpur', division: 'Mymensingh', latitude: 25.0200, longitude: 90.0200 },
  { name: 'Bogura', division: 'Rajshahi', latitude: 24.8510, longitude: 89.3697 },
  { name: 'Joypurhat', division: 'Rajshahi', latitude: 25.0952, longitude: 89.0220 },
  { name: 'Naogaon', division: 'Rajshahi', latitude: 24.8197, longitude: 88.9487 },
  { name: 'Natore', division: 'Rajshahi', latitude: 24.4200, longitude: 88.9800 },
  { name: 'Nawabganj', division: 'Rajshahi', latitude: 24.5900, longitude: 88.2800 },
  { name: 'Pabna', division: 'Rajshahi', latitude: 24.0042, longitude: 89.2478 },
  { name: 'Rajshahi', division: 'Rajshahi', latitude: 24.3745, longitude: 88.6042 },
  { name: 'Sirajganj', division: 'Rajshahi', latitude: 24.4550, longitude: 89.7000 },
  { name: 'Dinajpur', division: 'Rangpur', latitude: 25.6275, longitude: 88.6378 },
  { name: 'Gaibandha', division: 'Rangpur', latitude: 25.3288, longitude: 89.5344 },
  { name: 'Kurigram', division: 'Rangpur', latitude: 25.8050, longitude: 89.6375 },
  { name: 'Lalmonirhat', division: 'Rangpur', latitude: 25.9167, longitude: 89.4500 },
  { name: 'Nilphamari', division: 'Rangpur', latitude: 25.9235, longitude: 88.8408 },
  { name: 'Panchagarh', division: 'Rangpur', latitude: 26.3410, longitude: 88.5543 },
  { name: 'Rangpur', division: 'Rangpur', latitude: 25.7439, longitude: 89.2752 },
  { name: 'Thakurgaon', division: 'Rangpur', latitude: 26.0333, longitude: 88.4667 },
  { name: 'Habiganj', division: 'Sylhet', latitude: 24.3745, longitude: 91.4150 },
  { name: 'Moulvibazar', division: 'Sylhet', latitude: 24.4826, longitude: 91.7779 },
  { name: 'Sunamganj', division: 'Sylhet', latitude: 25.0658, longitude: 91.3958 },
  { name: 'Sylhet', division: 'Sylhet', latitude: 24.8949, longitude: 91.8687 },
];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function seedDistricts() {
  console.log('🌱 Seeding Bangladesh districts...');

  const existingDistricts = await District.find({}, { name: 1 }).lean();
  const existingNames = new Set(existingDistricts.map((district) => district.name.toLowerCase()));

  let created = 0;

  for (const district of BANGLADESH_DISTRICTS) {
    const normalizedName = district.name.toLowerCase();
    if (existingNames.has(normalizedName)) {
      continue;
    }

    await District.create({
      name: district.name,
      division: district.division,
      latitude: district.latitude,
      longitude: district.longitude,
      floodRisk: 'Low',
      rainfall: 0,
      temperature: 0,
      humidity: 0,
      lastUpdated: new Date(),
    });

    existingNames.add(normalizedName);
    created += 1;
  }

  console.log(`✅ District seeding complete. Created ${created} districts.`);
  return created;
}

module.exports = {
  BANGLADESH_DISTRICTS,
  seedDistricts,
};
