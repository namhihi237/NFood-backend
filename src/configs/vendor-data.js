let password = '123456';
const TIME_OPEN_DEFAULT = [
  {
    day: '2',
    openTime: new Date('2020-01-01T08:00:00.000Z'),
    closeTime: new Date('2020-01-01T20:00:00.000Z'),
    isOpen: true,
  },
  {
    day: '3',
    openTime: new Date('2020-01-01T08:00:00.000Z'),
    closeTime: new Date('2020-01-01T20:00:00.000Z'),
    isOpen: true,
  },
  {
    day: '4',
    openTime: new Date('2020-01-01T08:00:00.000Z'),
    closeTime: new Date('2020-01-01T20:00:00.000Z'),
    isOpen: true,
  },
  {
    day: '5',
    openTime: new Date('2020-01-01T08:00:00.000Z'),
    closeTime: new Date('2020-01-01T20:00:00.000Z'),
    isOpen: true,
  },
  {
    day: '6',
    openTime: new Date('2020-01-01T08:00:00.000Z'),
    closeTime: new Date('2020-01-01T20:00:00.000Z'),
    isOpen: true,
  },
  {
    day: '7',
    openTime: new Date('2020-01-01T08:00:00.000Z'),
    closeTime: new Date('2020-01-01T20:00:00.000Z'),
    isOpen: true,
  },
  {
    day: '8',
    openTime: new Date('2020-01-01T08:00:00.000Z'),
    closeTime: new Date('2020-01-01T20:00:00.000Z'),
    isOpen: true,
  },
];
let account = [
  {
    phoneNumber: '+84989402291',
    password: "",
    isActive: true,
    isVendor: true,
    role: ['vendor'],
    vendor: {
      name: 'Trà Sữa Ăn Vặt Bà Béo',
      phoneNumber: '+84989402291',
      address: '126 Hà Huy Giáp, Quận Cẩm Lệ, Đà Nẵng',
      email: 'piz22za@gmail.com',
      timeOpen: TIME_OPEN_DEFAULT,
      image: 'https://res.cloudinary.com/do-an-cnpm/image/upload/v1647360956/DoAnTN/tsavt_opnr4p.jpg',
      isReceiveOrder: true,
    }
  },
]

const vouchers = [{
  promoCode: 'FHDJUS3',
  discount: 10,
  discountType: 'PERCENT',
  minTotal: 30000,
  maxDiscount: 30000,
  quantity: 1000,
}]

let category = [
  {
    name: 'TRÀ SỮA',
    isActive: true,
  },
  {
    name: 'ĐỒ ĂN',
    isActive: true,
  }
]

let items = [{
  name: 'HỒNG TRÀ SỮA KEM CHESSE size L',
  price: 13000,
  isActive: true,
  image: 'https://res.cloudinary.com/do-an-cnpm/image/upload/v1647360955/DoAnTN/ts5_ypobl1.jpg',
  description: ''
}, {
  name: 'TRÀ SỮA TCDD KEM TRỨNG L',
  price: 17000,
  isActive: true,
  image: 'https://res.cloudinary.com/do-an-cnpm/image/upload/v1647360954/DoAnTN/ts2_asimnf.jpg',
  description: ''
},
{
  name: 'SỮA TƯƠI KEM XOÀI SIÊU NGHIỆN SIZE M',
  price: 23000,
  isActive: true,
  image: 'https://res.cloudinary.com/do-an-cnpm/image/upload/v1647360954/DoAnTN/ts1_ehydoz.jpg',
  description: ''
},
{
  name: 'TRÀ SỮA PUDDING TRỨNG SIZE M',
  price: 22000,
  isActive: true,
  image: 'https://res.cloudinary.com/do-an-cnpm/image/upload/v1647360954/DoAnTN/ts4_y7nkoj.jpg',
  description: ''
}]

let items2 = [{
  name: 'BÁNH TRÁNG CHẤM BƠ',
  price: 28000,
  isActive: true,
  image: 'https://res.cloudinary.com/do-an-cnpm/image/upload/v1647360954/DoAnTN/ts6_qq7yt8.jpg',
  description: ''
}]

export const vendorData = {
  account,
  category,
  items,
  items2,
  password,
  vouchers,
}