let password = '123456';

const account = [
  {
    phoneNumber: '+84989402291',
    password: "",
    isActive: true,
    isBuyer: true,
    role: ['buyer'],
    buyer: {
      name: "Ánh Trần",
      phoneNumber: '+84989402291',
      address: '126 Hà Huy Giáp, Quận Cẩm Lệ, Đà Nẵng',
      email: ''
    }
  },

  {
    phoneNumber: '+84983502291',
    password: "",
    isActive: true,
    isBuyer: true,
    role: ['buyer'],
    buyer: {
      name: "Bao Trần",
      phoneNumber: '+84983502291',
      address: '126 Hà Huy Giáp, Quận Cẩm Lệ, Đà Nẵng',
      email: ''
    }
  }
]

export const buyerData = {
  account,
  password
}