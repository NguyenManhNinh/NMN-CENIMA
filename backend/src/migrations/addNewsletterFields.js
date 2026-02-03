/**
 * Migration: Add newsletter subscription fields to existing users
 * Run: docker exec -it nmn-cinema-backend node src/migrations/addNewsletterFields.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Use Docker internal hostname or fallback to env
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/datn-cinema';

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Add newsletter fields to users that don't have them
    const result = await mongoose.connection.collection('users').updateMany(
      { newsletterSubscribed: { $exists: false } },
      {
        $set: {
          newsletterSubscribed: true,
          lastPromotionEmailAt: null
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} users with newsletter fields`);
    console.log('🎉 Migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrate();
