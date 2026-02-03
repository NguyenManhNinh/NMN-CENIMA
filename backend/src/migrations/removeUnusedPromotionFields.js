/**
 * Migration: Remove unused fields from Promotion and PromotionRedeem collections
 * Run: node src/migrations/removeUnusedPromotionFields.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI_LOCAL || 'mongodb://localhost:27018/datn-cinema';

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Remove unused fields from promotions collection
    const promoResult = await mongoose.connection.collection('promotions').updateMany(
      {},
      {
        $unset: {
          claimPolicy: "",
          redeemPolicy: "",
          allowedCinemaIds: "",
          requiredGateway: "",
          minOrderAmount: ""
        }
      }
    );
    console.log(`✅ Promotions: Modified ${promoResult.modifiedCount} documents`);

    // Remove unused fields from promotionredeems collection
    const redeemResult = await mongoose.connection.collection('promotionredeems').updateMany(
      {},
      {
        $unset: {
          redeemNote: ""
        }
      }
    );
    console.log(`✅ PromotionRedeems: Modified ${redeemResult.modifiedCount} documents`);

    console.log('\n🎉 Migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrate();
