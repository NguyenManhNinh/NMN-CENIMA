/**
 * Cleanup Promotions — Xóa bản trùng + sửa typo
 * Chạy: node src/seeds/cleanup_promotions.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Promotion = require('../models/Promotion');

const MONGO_URI = process.env.MONGO_URI_LOCAL || 'mongodb://localhost:27018/datn-cinema';

async function cleanup() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1. Sửa typo "nướcc" → "nước"
    const typoResult = await Promotion.updateMany(
      { title: { $regex: 'nướcc', $options: 'i' } },
      [{ $set: { title: { $replaceAll: { input: '$title', find: 'nướcc', replacement: 'nước' } } } }]
    );
    console.log(`🔧 Sửa typo "nướcc" → "nước": ${typoResult.modifiedCount} bản ghi\n`);

    // 2. Xóa bản trùng (giữ bản cũ nhất theo _id)
    const allPromos = await Promotion.find({}).sort({ _id: 1 }).lean();
    const seen = {};
    const toDelete = [];

    allPromos.forEach(p => {
      const key = p.title.trim();
      if (seen[key]) {
        toDelete.push(p._id);
      } else {
        seen[key] = p._id;
      }
    });

    if (toDelete.length > 0) {
      const deleteResult = await Promotion.deleteMany({ _id: { $in: toDelete } });
      console.log(`🗑️  Xóa ${deleteResult.deletedCount} bản trùng:`);
      toDelete.forEach(id => console.log(`   - ${id}`));
    } else {
      console.log('✅ Không có bản trùng');
    }

    // 3. Hiển thị kết quả sau cleanup
    console.log('\n=== KẾT QUẢ SAU CLEANUP ===');
    const remaining = await Promotion.find({}).sort({ endAt: 1 }).lean();
    console.log(`Tổng: ${remaining.length} promotions\n`);
    remaining.forEach((p, i) => {
      const end = p.endAt ? new Date(p.endAt).toISOString().slice(0, 10) : 'N/A';
      console.log(`${i + 1}. ${p.title}`);
      console.log(`   Status: ${p.status} | End: ${end} | Mode: ${p.applyMode} | Limit: ${p.totalRedeemsLimit ?? 'null'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanup();
