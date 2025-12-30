// Script seed seatMap cho phòng P06
// Chạy: docker exec nmn-cinema-mongo mongosh --quiet < scripts/seedSeatMap.js

db = db.getSiblingDB('datn-cinema');

// Tạo seatMap mới với 95 ghế (10 hàng)
const newSeatMap = [];
const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

rows.forEach((row, rowIndex) => {
  const seats = [];
  const seatsPerRow = row === 'J' ? 5 : 10; // Hàng J chỉ có 5 ghế đôi

  for (let i = 1; i <= seatsPerRow; i++) {
    let type = 'standard';

    // Hàng E, F, G là VIP (giữa rạp - view tốt nhất)
    if (['E', 'F', 'G'].includes(row)) {
      type = 'vip';
    }
    // Hàng J (cuối) là ghế đôi Couple
    if (row === 'J') {
      type = 'couple';
    }

    // Random một vài ghế đã bán (để test hiển thị)
    let isBooked = false;
    if ((row === 'E' && i === 5) || (row === 'F' && [4, 5, 6].includes(i))) {
      isBooked = true;
    }

    seats.push({
      number: i,
      type: type,
      isBooked: isBooked
    });
  }
  newSeatMap.push({ row: row, seats: seats });
});

// Update phòng P06
const result = db.rooms.updateOne(
  { _id: ObjectId('6940ccf2110da1cdd437b19a') },
  {
    $set: {
      seatMap: newSeatMap,
      totalSeats: 95,
      status: 'ACTIVE'
    }
  }
);

print('=== UPDATE SEATMAP RESULT ===');
print('Modified:', result.modifiedCount);
print('');
print('=== NEW SEATMAP STRUCTURE ===');
let totalSeats = 0;
newSeatMap.forEach(r => {
  const types = r.seats.map(s => s.type);
  const booked = r.seats.filter(s => s.isBooked).length;
  print(`Row ${r.row}: ${r.seats.length} seats (${types[0]}) - ${booked} booked`);
  totalSeats += r.seats.length;
});
print('');
print('Total seats:', totalSeats);
print('Standard: 60 seats (A-D, H-I)');
print('VIP: 30 seats (E-G)');
print('Couple: 5 seats (J)');
