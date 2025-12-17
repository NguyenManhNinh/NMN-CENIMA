// Mock Vouchers Data - Dữ liệu mã giảm giá mẫu
export const mockVouchers = [
  {
    _id: 'voucher1',
    code: 'GIAM10',
    type: 'PERCENT',
    value: 10,
    maxDiscount: 50000,
    validFrom: '2024-12-01',
    validTo: '2024-12-31',
    usageCount: 50,
    usageLimit: 100,
    status: 'ACTIVE'
  },
  {
    _id: 'voucher2',
    code: 'GIAM20K',
    type: 'FIXED',
    value: 20000,
    maxDiscount: 20000,
    validFrom: '2024-12-01',
    validTo: '2024-12-31',
    usageCount: 20,
    usageLimit: 50,
    status: 'ACTIVE'
  },
  {
    _id: 'voucher3',
    code: 'VIP50',
    type: 'PERCENT',
    value: 50,
    maxDiscount: 100000,
    validFrom: '2024-12-01',
    validTo: '2024-12-15',
    usageCount: 10,
    usageLimit: 10,
    status: 'EXPIRED'
  }
];

export default mockVouchers;
