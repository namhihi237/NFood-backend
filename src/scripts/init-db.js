import { Accounts, Vendor, Category, Item } from '../models/index.js';

import { bcryptUtils, hereUtils } from '../utils/index.js';

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
    phoneNumber: '+84989402030',
    password: "",
    isActive: true,
    isVendor: true,
    role: ['vendor'],
    vendor: {
      name: 'Mì quảng bà Đinh',
      phoneNumber: '+84989402030',
      address: '443 Tôn Đức Thắng, Liên Chiểu, Đà Nẵng',
      email: 'badinh@gmail.com',
      timeOpen: TIME_OPEN_DEFAULT,
      image: 'https://res.cloudinary.com/do-an-cnpm/image/upload/v1646330104/DoAnTN/avatar_sleaht.jpg'
    }
  },
  {
    phoneNumber: '+84989402031',
    password: "",
    isActive: true,
    isVendor: true,
    role: ['vendor'],
    vendor: {
      name: 'Mì quảng bà Xuân',
      phoneNumber: '+84989402031',
      address: '112 Tôn Đức Thắng, Liên Chiểu, Đà Nẵng',
      email: '',
      timeOpen: TIME_OPEN_DEFAULT,
      image: 'https://res.cloudinary.com/do-an-cnpm/image/upload/v1646330104/DoAnTN/avatar_sleaht.jpg'
    }
  },
  {
    phoneNumber: '+84989402032',
    password: "",
    isActive: true,
    isVendor: true,
    role: ['vendor'],
    vendor: {
      name: 'Mì Nam Xuân',
      phoneNumber: '+84989402032',
      address: '22 Nguyễn Lương Bằng, Liên Chiểu, Đà Nẵng',
      email: '',
      timeOpen: TIME_OPEN_DEFAULT,
      image: 'https://res.cloudinary.com/do-an-cnpm/image/upload/v1646330104/DoAnTN/avatar_sleaht.jpg'
    }
  },
  {
    phoneNumber: '+84989402033',
    password: "",
    isActive: true,
    isVendor: true,
    role: ['vendor'],
    vendor: {
      name: 'Mỳ sáng',
      phoneNumber: '+84989402033',
      address: '22 Lạc Long Quân, Liên Chiểu, Đà Nẵng',
      email: '',
      timeOpen: TIME_OPEN_DEFAULT,
      image: 'https://res.cloudinary.com/do-an-cnpm/image/upload/v1646330104/DoAnTN/avatar_sleaht.jpg'
    }
  },
  {
    phoneNumber: '+84989402034',
    password: "",
    isActive: true,
    isVendor: true,
    role: ['vendor'],
    vendor: {
      name: 'Mì quảng bà Xuân',
      phoneNumber: '+84989402034',
      address: '22 Nguyễn Chánh, Liên Chiểu, Đà Nẵng',
      email: '',
      timeOpen: TIME_OPEN_DEFAULT,
      image: 'https://res.cloudinary.com/do-an-cnpm/image/upload/v1646330104/DoAnTN/avatar_sleaht.jpg'
    }
  }
]

let category = [
  {
    name: 'Mì quảng',
  }
]

let items = [{
  name: 'Mì quảng tôm',
  price: 30000,
  isActive: true,
  image: 'https://res.cloudinary.com/do-an-cnpm/image/upload/v1646330629/DoAnTN/myquanggatom_cscvy3.jpg'
}, {
  name: 'Mì quảng trứng',
  price: 24000,
  isActive: true,
  image: 'https://res.cloudinary.com/do-an-cnpm/image/upload/v1646330646/DoAnTN/myquangtrung_ayn8hp.jpg'
}]

async function initVendor() {
  try {
    password = await bcryptUtils.hashPassword(password);
    account = account.map(item => {
      item.password = password;
      return item;
    });

    await Promise.all(account.map(async item => {
      let newAccount = await Accounts.create(item);

      let address = await hereUtils.getGeoLocation(item.vendor.address);
      let vendor = await Vendor.create({
        ...item.vendor,
        accountId: newAccount._id,
        location: {
          type: 'Point',
          coordinates: [address.lat, address.lng]
        }
      });

      category = category.map(item => {
        item.vendorId = vendor._id;
        return item;
      });

      await Promise.all(category.map(async cate => {
        let category = await Category.create(cate);

        items = items.map(item => {
          item.categoryId = category._id;
          item.vendorId = vendor._id;
          return item;
        })

        await Promise.all(items.map(async item => {
          await Item.create(item);
        }));
      }));

    }));
    console.log('Init database success');
  } catch (error) {
    console.log(error);
  }
}

// run the function

initVendor().then(() => {
  console.log('Init database success');
}).catch(err => {
  console.log(err);
});