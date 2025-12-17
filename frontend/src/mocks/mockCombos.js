// Mock Combos Data - Dữ liệu combo bắp nước mẫu
export const mockCombos = [
  {
    _id: 'combo1',
    name: 'Combo Solo',
    description: '1 Bắp lớn + 1 Nước lớn',
    price: 79000,
    items: [
      { name: 'Bắp rang bơ lớn', quantity: 1 },
      { name: 'Pepsi lớn', quantity: 1 }
    ],
    imageUrl: '/images/combo-solo.png',
    status: 'ACTIVE'
  },
  {
    _id: 'combo2',
    name: 'Combo Couple',
    description: '1 Bắp lớn + 2 Nước lớn',
    price: 99000,
    items: [
      { name: 'Bắp rang bơ lớn', quantity: 1 },
      { name: 'Pepsi lớn', quantity: 2 }
    ],
    imageUrl: '/images/combo-couple.png',
    status: 'ACTIVE'
  },
  {
    _id: 'combo3',
    name: 'Combo Family',
    description: '2 Bắp lớn + 4 Nước lớn',
    price: 179000,
    items: [
      { name: 'Bắp rang bơ lớn', quantity: 2 },
      { name: 'Pepsi lớn', quantity: 4 }
    ],
    imageUrl: '/images/combo-family.png',
    status: 'ACTIVE'
  },
  {
    _id: 'combo4',
    name: 'Snack Box',
    description: '1 Bắp nhỏ + 1 Hotdog + 1 Nước',
    price: 89000,
    items: [
      { name: 'Bắp rang bơ nhỏ', quantity: 1 },
      { name: 'Hotdog', quantity: 1 },
      { name: 'Pepsi vừa', quantity: 1 }
    ],
    imageUrl: '/images/combo-snack.png',
    status: 'ACTIVE'
  }
];

export default mockCombos;
