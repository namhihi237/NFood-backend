import { hereUtils, bcryptUtils } from '../../utils';
import { Accounts, Vendor, Category, Item, Voucher } from "../../models";
import _ from 'lodash';
import { constants, vendorData } from '../../configs';

const vendorMutation = {
  activeVendor: async (parent, args, context, info) => {
    global.logger.info('vendorMutation.activeVendor', JSON.stringify(args));
    let { name, address, image } = args;
    try {
      // check login
      if (!context.user) {
        throw new Error('Vui lòng đăng nhập');
      }

      // check required fields
      if (!name || !address || !image) {
        throw new Error('Vui lòng nhập đầy đủ thông tin');
      }

      let account = await Accounts.findById(context.user.id);

      if (!account) {
        throw new Error('Tài khoản không tồn tại');
      }

      if (account.isVendor) {
        throw new Error('Bạn đã có cửa hàng');
      }

      // convert address to latlng
      address = address.trim();
      const geocode = await hereUtils.getGeoLocation(address);
      let coordinates = null;
      if (geocode) {
        coordinates = [geocode.lng, geocode.lat];
      }

      let vendor = await Vendor.findOne({ accountId: account._id });
      if (vendor) {
        await Vendor.findOneAndUpdate({
          accountId: context.user.id
        }, {
          name,
          address,
          image,
          location: { type: 'Point', coordinates },
          timeOpen: constants.TIME_OPEN_DEFAULT
        });
      } else {
        await Vendor.create({
          accountId: context.user.id,
          name,
          address,
          image,
          phoneNumber: account.phoneNumber,
          location: { type: 'Point', coordinates },
          timeOpen: constants.TIME_OPEN_DEFAULT
        });
      }
      await Accounts.findByIdAndUpdate(context.user.id, { isVendor: true, });
      if (!account.role.includes('vendor')) {
        await Accounts.findByIdAndUpdate(context.user.id, { $push: { role: 'vendor' } });
      }

      return {
        success: true,
        message: 'Bạn đã mở cửa hàng thành công!'
      }

    } catch (error) {
      throw new Error(error);
    }
  },

  updateStatusReceiveOrder: async (parent, args, context, info) => {
    global.logger.info('vendorMutation::updateStatusReceiveOrder' + JSON.stringify(args));

    // check login
    if (!context.user) {
      throw new Error('Vui lòng đăng nhập');
    }

    let vendor = await Vendor.findOne({ accountId: context.user.id });

    if (!vendor) {
      throw new Error('Bạn chưa là cửa hàng');
    }

    vendor = await Vendor.findOneAndUpdate({ _id: vendor._id }, { isReceiveOrder: !vendor.isReceiveOrder }, { new: true });

    return vendor.isReceiveOrder;
  },

  updateTimeOpen: async (parent, args, context, info) => {
    global.logger.info('vendorMutation::updateTimeOpen' + JSON.stringify(args));

    let newTimeOpen = args.timeOpen;

    // check login
    if (!context.user) {
      throw new Error('Vui lòng đăng nhập');
    }

    let vendor = await Vendor.findOne({ accountId: context.user.id });

    if (!vendor) {
      throw new Error('Bạn chưa là cửa hàng');
    }

    // check valid time
    if (!constants.DAYS.includes(newTimeOpen.day)) {
      throw new Error('Thứ không hợp lệ');
    }

    const start = parseFloat(`${newTimeOpen.openTime.split(':')[0]}.${newTimeOpen.openTime.split(':')[1]}`);
    const end = parseFloat(`${newTimeOpen.closeTime.split(':')[0]}.${newTimeOpen.closeTime.split(':')[1]}`);

    if (start >= end) {
      throw new Error('Thời gian mở cửa phải nhỏ hơn thời gian đóng cửa');
    }

    newTimeOpen.openTime = new Date(`2020-01-01T${newTimeOpen.openTime}:00.000Z`);
    newTimeOpen.closeTime = new Date(`2021-01-01T${newTimeOpen.closeTime}:00.000Z`);

    let timeOpen = vendor.timeOpen;
    for (let i = 0; i < timeOpen.length; i++) {
      if (timeOpen[i].day === newTimeOpen.day) {
        timeOpen[i].openTime = newTimeOpen.openTime;
        timeOpen[i].closeTime = newTimeOpen.closeTime;
        timeOpen[i].isOpen = newTimeOpen.isOpen;
        break;
      }
    }

    vendor = await Vendor.findOneAndUpdate({ _id: vendor._id }, { timeOpen }, { new: true });

    return true;
  },

  updateVendorProfile: async (parent, args, context, info) => {
    global.logger.info('vendorMutation::updateVendorProfile' + JSON.stringify(args));

    // check login
    if (!context.user) {
      throw new Error('Vui lòng đăng nhập');
    }

    let vendor = await Vendor.findOne({ accountId: context.user.id });

    if (!vendor) {
      throw new Error('Bạn chưa là cửa hàng');
    }

    let { name, address, image, email } = args;
    name = name.trim();
    address = address.trim();
    email = email.trim();

    let newData = {
      name,
      image,
      email
    }

    if (address !== vendor.address) {
      const geocode = await hereUtils.getGeoLocation(address);
      let coordinates = null;
      if (geocode) {
        coordinates = [geocode.lng, geocode.lat];
      }
      newData.location = { type: 'Point', coordinates };

      newData.address = address;
    }

    await Vendor.findOneAndUpdate({ _id: vendor._id }, newData);

    return true;
  },

  initDataVendor: async (parent, args, context, info) => {
    global.logger.info('vendorMutation::initDataVendor' + JSON.stringify(args));
    let { password, category, account, vouchers, items, items2 } = vendorData;
    password = await bcryptUtils.hashPassword(password);

    // add password hashPassword
    account = account.map(item => {
      item.password = password;
      return item;
    });

    // remove account
    account.map(async item => {
      let vendorExists = await Accounts.findOne({ phoneNumber: item.phoneNumber });
      if (vendorExists) {
        await Accounts.findByIdAndRemove(vendorExists._id);
        const vendorE = await Vendor.findOneAndRemove({ accountId: vendorExists._id });
        if (vendorE) {
          await Category.remove({ vendorId: vendorE._id });
          await Item.remove({ vendorId: vendorE._id });
          await Voucher.remove({ vendorId: vendorE._id });
        }
      }
    });

    // create account
    await Promise.all(account.map(async item => {

      let newAccount = await Accounts.create(item);

      console.log(item.vendor.address);
      let address = await hereUtils.getGeoLocation(item.vendor.address);
      console.log(address);

      let vendor = await Vendor.create({
        accountId: newAccount._id,
        ...item.vendor,
        location: { type: 'Point', coordinates: [address.lng, address.lat] },
      });

      category = category.map(item => {
        item.vendorId = vendor._id;
        return item;
      });

      await Promise.all(category.map(async (cate, index) => {
        let newCategory = await Category.create(cate);

        if (index == 0) {
          items = items.map(item => {
            item.categoryId = newCategory._id;
            item.vendorId = vendor._id;
            return item;
          });

          await Promise.all(items.map(async item => {
            await Item.create(item);
          }));
        } else {
          items2 = items2.map(item => {
            item.categoryId = newCategory._id;
            item.vendorId = vendor._id;
            return item;
          });

          await Promise.all(items2.map(async item => {
            await Item.create(item);
          }));
        }

      }));

      // create a new voucher
      vouchers = vouchers.map(item => {
        item.vendorId = vendor._id;
        return item;
      });

      await Promise.all(vouchers.map(async item => {
        await Voucher.create(item);
      }));
    }))

    return true;

  }
}


export default vendorMutation;