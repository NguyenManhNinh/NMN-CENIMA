// Script reset tất cả ghế về trạng thái chưa bán
// Chạy: Get-Content .\scripts\resetSeats.js | docker exec -i nmn-cinema-mongo mongosh --quiet

db = db.getSiblingDB('datn-cinema');

// Lấy room P06
const room = db.rooms.findOne({ _id: ObjectId('6940ccf2110da1cdd437b19a') });

if (!room) {
  print('Không tìm thấy phòng P06!');
  quit();
}

// Reset tất cả ghế về isBooked: false
const newSeatMap = room.seatMap.map(row => {
  return {
    row: row.row,
    seats: row.seats.map(seat => ({
      number: seat.number,
      type: seat.type,
      isBooked: false  // Reset về chưa bán
    }))
  };
});

// Update
const result = db.rooms.updateOne(
  { _id: ObjectId('6940ccf2110da1cdd437b19a') },
  { $set: { seatMap: newSeatMap } }
);

print('=== RESET SEATS RESULT ===');
print('Modified:', result.modifiedCount);

// Verify
let bookedCount = 0;
newSeatMap.forEach(r => r.seats.forEach(s => { if (s.isBooked) bookedCount++; }));
print('Booked seats after reset:', bookedCount);
print('All seats are now AVAILABLE!');
