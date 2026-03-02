/**
 * Migration script: Chuyển director/actors từ ObjectId sang tên (String)
 * Chạy 1 lần duy nhất sau khi đổi schema Movie
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Person = require('../src/models/Person');

// Kết nối DB
const DB_URI = process.env.MONGO_URI || process.env.DATABASE_URL;

async function migrate() {
  try {
    await mongoose.connect(DB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const moviesCol = db.collection('movies');

    const movies = await moviesCol.find({}).toArray();
    console.log(`📋 Tìm thấy ${movies.length} phim`);

    let updated = 0;

    for (const movie of movies) {
      const updateFields = {};

      // Chuyển director ObjectId -> tên
      if (movie.director && mongoose.Types.ObjectId.isValid(movie.director)) {
        const person = await Person.findById(movie.director).lean();
        if (person) {
          updateFields.director = person.name;
          console.log(`  🎬 ${movie.title}: director "${person.name}"`);
        } else {
          updateFields.director = '';
          console.log(`  ⚠️ ${movie.title}: director ObjectId không tìm thấy Person`);
        }
      }

      // Chuyển actors [ObjectId] -> [tên]
      if (movie.actors && movie.actors.length > 0) {
        const isObjectIds = movie.actors.some(a => mongoose.Types.ObjectId.isValid(a));
        if (isObjectIds) {
          const actorNames = [];
          for (const actorId of movie.actors) {
            if (mongoose.Types.ObjectId.isValid(actorId)) {
              const person = await Person.findById(actorId).lean();
              actorNames.push(person ? person.name : '');
            } else {
              actorNames.push(actorId); // Đã là string rồi
            }
          }
          updateFields.actors = actorNames.filter(n => n);
          console.log(`  🎭 ${movie.title}: actors [${updateFields.actors.join(', ')}]`);
        }
      }

      if (Object.keys(updateFields).length > 0) {
        await moviesCol.updateOne({ _id: movie._id }, { $set: updateFields });
        updated++;
      }
    }

    console.log(`\n✅ Migration hoàn tất! Đã cập nhật ${updated}/${movies.length} phim.`);
  } catch (err) {
    console.error('❌ Migration lỗi:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrate();
