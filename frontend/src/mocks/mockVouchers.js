// Mock Vouchers Data - Dữ liệu mã giảm giá mẫu
export const mockVouchers = [
  {
    _id: 'voucher1',
    code: 'NEWYEAR2026',
    type: 'PERCENT',
    value: 10, // Giảm 10%
    maxDiscount: 50000, // Tối đa 50k
    description: 'Giảm 10% tối đa 50K',
    validFrom: '2026-01-01',
    validTo: '2026-01-31',
    usageCount: 45,
    usageLimit: 100,
    status: 'ACTIVE'
  },
  {
    _id: 'voucher2',
    code: 'CINEMA30K',
    type: 'FIXED',
    value: 30000, // Giảm cố định 30k
    maxDiscount: 30000,
    description: 'Giảm 30.000đ cho đơn từ 150K',
    minOrderValue: 150000,
    validFrom: '2026-01-01',
    validTo: '2026-03-31',
    usageCount: 20,
    usageLimit: 500,
    status: 'ACTIVE'
  },
  {
    _id: 'voucher3',
    code: 'COMBO20',
    type: 'PERCENT',
    value: 20,
    maxDiscount: 40000,
    description: 'Giảm 20% combo bắp nước',
    applyTo: 'combo',
    validFrom: '2026-01-01',
    validTo: '2026-02-28',
    usageCount: 80,
    usageLimit: 200,
    status: 'ACTIVE'
  },
  {
    _id: 'voucher4',
    code: 'VIP50K',
    type: 'FIXED',
    value: 50000,
    maxDiscount: 50000,
    description: 'Giảm 50K cho ghế VIP',
    applyTo: 'vip',
    minOrderValue: 200000,
    validFrom: '2026-01-01',
    validTo: '2026-06-30',
    usageCount: 10,
    usageLimit: 50,
    status: 'ACTIVE'
  },
  {
    _id: 'voucher5',
    code: 'EXPIRED2025',
    type: 'PERCENT',
    value: 15,
    maxDiscount: 30000,
    description: 'Mã đã hết hạn',
    validFrom: '2025-01-01',
    validTo: '2025-12-31',
    usageCount: 100,
    usageLimit: 100,
    status: 'EXPIRED'
  }
];

export default mockVouchers;
