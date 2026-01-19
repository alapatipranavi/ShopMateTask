const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = 'shopmate';

const products = [
    {
        name: "Wireless Noise Cancelling Headphones",
        description: "Immerse yourself in pure audio bliss with our premium Wireless Noise Cancelling Headphones. Engineered for audiophiles and travelers alike, these over-ear headphones feature advanced active noise cancellation (ANC) technology to block out distractions. Enjoy crystal-clear highs and deep, resonant bass with high-fidelity sound drivers. The lightweight, ergonomic design ensures all-day comfort, while the plush memory foam ear cushions provide a perfect seal. With an impressive 30-hour battery life and quick charging capabilities, you can keep the music playing on long flights or commutes. Seamless Bluetooth connectivity and a built-in microphone make hands-free calls effortless. Elevate your listening experience today.",
        price: 299.99,
        category: "Electronics",
        stock: 50,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
    },
    {
        name: "Ergonomic Office Chair",
        description: "Transform your workspace with our premium Ergonomic Office Chair, designed for ultimate comfort and productivity. This high-performance chair features adjustable lumbar support to maintain healthy posture and reduce back strain during long work hours. The breathable mesh backrest promotes airflow, keeping you cool and comfortable all day. Customize your seating position with adjustable armrests, seat height, and tilt tension. The durable, high-density foam seat cushion offers superior support, while the heavy-duty base and smooth-rolling casters ensure stability and ease of movement on any continuous floor surface. Perfect for home offices and corporate environments alike.",
        price: 199.99,
        category: "Furniture",
        stock: 20,
        image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80"
    },
    {
        name: "Smart Fitness Watch",
        description: "Stay on top of your health and fitness goals with our advanced Smart Fitness Watch. This sleek wearable tracks your heart rate, steps, calories burned, and sleep patterns with precision accuracy. Featuring a vibrant, scratch-resistant AMOLED display, you can easily view your stats and notifications in any lighting. With multiple sports modes, including running, swimming, and cycling, it’s the perfect companion for every workout. The device is water-resistant up to 50 meters, making it suitable for all weather conditions. Sync seamlessly with your smartphone to receive calls, texts, and app alerts right on your wrist. Long-lasting battery included.",
        price: 149.50,
        category: "Electronics",
        stock: 100,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"
    },
    {
        name: "Minimalist Backpack",
        description: "Streamline your daily commute with our stylish Minimalist Backpack. Crafted from high-quality, water-resistant fabric, this durable bag protects your essentials from the elements while looking effortlessly chic. The spacious main compartment features a padded sleeve dedicated to securely holding laptops up to 15 inches plus books and documents. Multiple internal pockets keep your chargers, pens, and accessories organized. The sleek, low-profile design is perfect for professionals and students who value function and aesthetics. Padded shoulder straps and a breathable back panel ensure maximum comfort even when fully loaded. Upgrade your carry with this versatile, modern essential.",
        price: 79.00,
        category: "Accessories",
        stock: 45,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80"
    },
    {
        name: "Mechanical Keyboard",
        description: "Experience the ultimate in typing precision with our high-performance Mechanical Keyboard. Designed for gamers and typists who demand the best, this compact keyboard features high-quality mechanical switches that deliver a satisfying tactile feedback and rapid response times. The customizable RGB backlighting allows you to create the perfect atmosphere for your setup, with millions of color options and dynamic effects. Its durable construction ensures longevity, while the anti-ghosting technology guarantees that every keystroke is registered accurately. The detachable USB-C cable makes it portable and easy to connect. Elevate your productivity and gaming performance with this responsive, ergonomic masterpiece.",
        price: 120.00,
        category: "Electronics",
        stock: 30,
        image: "https://images.unsplash.com/photo-1558050032-160f36233a07?w=800&q=80"
    },
    {
        name: "Ceramic Coffee Mug Set",
        description: "Savor your morning brew in style with our exquisite Ceramic Coffee Mug Set. This set of handcrafted mugs features a modern, minimalist design with a stunning matte finish that feels smooth to the touch. Each mug is kiln-fired for durability and heat retention, keeping your coffee, tea, or cocoa hot for longer. The ergonomic handle is designed for a comfortable grip, making every sip a pleasure. These mugs are completely lead-free, microwave-safe, and dishwasher-safe for hassle-free cleaning. Perfect for your kitchen or as a thoughtful gift, this set adds a touch of elegance to any coffee table or breakfast nook.",
        price: 35.00,
        category: "Home",
        stock: 60,
        image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80"
    },
    {
        name: "Running Shoes",
        description: "Achieve your personal best with our ultra-lightweight Running Shoes, engineered for speed and endurance. These high-performance sneakers feature a breathable mesh upper that keeps your feet cool and dry during intense workouts. The superior cushioning technology in the mid-sole absorbs impact and provides excellent energy return, reducing fatigue and protecting your joints. A durable rubber outsole offers exceptional traction on various surfaces, from treadmills to asphalt. Designed with a supportive fit that locks your foot in place, these shoes are perfect for runners of all levels. Step up your training game with footwear that combines comfort, style, and performance.",
        price: 89.99,
        category: "Clothing",
        stock: 25,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"
    },
    {
        name: "Bamboo Cutting Board",
        description: "Upgrade your kitchen arsenal with our eco-friendly Bamboo Cutting Board. Crafted from 100% organic bamboo, this heavy-duty board is naturally antimicrobial and harder than most woods, ensuring it withstands rigorous chopping without dulling your knives. The dense surface resists moisture and bacteria, making it a hygienic choice for meal prep. Featuring a deep juice groove to catch liquids and prevent messy spills, it’s perfect for carving meats or slicing juicy fruits. The non-slip silicone feet keep the board securely in place while you work. Easy to clean and maintain, this durable board is a sustainable and stylish addition to any culinary space.",
        price: 24.99,
        category: "Home",
        stock: 75,
        image: "https://images.unsplash.com/photo-1660002561318-6ef0a0ae1f04?w=800&q=80"
    },
    {
        name: "Polarized Sunglasses",
        description: "Protect your eyes in style with our classic Polarized Sunglasses. Featuring a timeless aviator design, these sunglasses are the perfect accessory for any outfit. The high-quality polarized lenses effectively eliminate glare from reflective surfaces like water, snow, and roads, enhancing visual clarity and reducing eye strain. With 100% UV400 protection, they shield your eyes from harmful UVA and UVB rays. The lightweight yet durable metal frame ensures a comfortable fit for all-day wear, while adjustable nose pads allow for a custom fit. Whether driving, hiking, or relaxing at the beach, look sharp and see clearly with these premium shades.",
        price: 55.00,
        category: "Accessories",
        stock: 40,
        image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80"
    },
    {
        name: "Bluetooth Speaker",
        description: "Bring the party wherever you go with our powerful, portable Bluetooth Speaker. Delivering immersive 360-degree sound with deep, punchy bass and crystal-clear highs, this speaker fills any room or outdoor space with rich audio. The rugged, waterproof design (IPX7 rated) makes it perfect for pool parties, beach trips, and camping adventures. With a long-lasting battery providing up to 12 hours of playtime, the music never stops. Connect wirelessly from up to 30 feet away or pair two speakers for stereo sound. Compact and easy to carry, it’s the ultimate companion for music lovers on the move. Experience sound unleashed.",
        price: 65.00,
        category: "Electronics",
        stock: 55,
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80"
    }
];

const seedDB = async () => {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB for seeding...');
        const db = client.db(dbName);
        const collection = db.collection('products');

        await collection.deleteMany({}); // Clear existing data
        console.log('Cleared existing products.');

        const result = await collection.insertMany(products);
        console.log(`${result.insertedCount} products added successfully.`);

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await client.close();
        console.log('Database connection closed.');
        process.exit();
    }
};

seedDB();