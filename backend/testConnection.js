const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

console.log('🧪 Testing MongoDB Atlas Connection...\n');

// Display connection string (hide password)
const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('❌ MONGODB_URI not found in .env file!');
    process.exit(1);
}

const hiddenUri = uri.replace(/:[^:@]+@/, ':****@');
console.log('🔗 Connection String:', hiddenUri);
console.log('');

async function testConnection() {
    try {
        console.log('⏳ Attempting to connect...\n');

        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
        });

        console.log('✅ SUCCESS! Connected to MongoDB Atlas\n');
        console.log('📊 Connection Details:');
        console.log('   Host:', mongoose.connection.host);
        console.log('   Database:', mongoose.connection.name);
        console.log('   State:', mongoose.connection.readyState === 1 ? 'Connected ✓' : 'Connecting...');
        console.log('');

        // List collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📋 Existing Collections:', collections.length === 0 ? 'None (will be created when you add data)' : '');
        collections.forEach(col => console.log('   -', col.name));

        console.log('\n🎉 MongoDB Atlas is ready to use!\n');

        await mongoose.connection.close();
        console.log('👋 Connection closed successfully');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ CONNECTION FAILED!\n');
        console.error('Error Type:', error.name);
        console.error('Error Message:', error.message);
        console.error('');

        if (error.name === 'MongooseServerSelectionError') {
            console.error('💡 TROUBLESHOOTING STEPS:');
            console.error('   1. Check internet connection');
            console.error('   2. Verify MONGODB_URI in .env file');
            console.error('   3. Ensure IP 0.0.0.0/0 is whitelisted in MongoDB Atlas');
            console.error('   4. Check if cluster is "Active" in MongoDB Atlas dashboard');
            console.error('   5. Wait 2-3 minutes if cluster was just created');
        } else if (error.message.includes('authentication failed')) {
            console.error('💡 AUTHENTICATION ERROR:');
            console.error('   1. Check username in connection string');
            console.error('   2. Verify password is correct (no < > brackets)');
            console.error('   3. Make sure database user exists in Atlas');
        }

        console.error('');
        process.exit(1);
    }
}

testConnection();
