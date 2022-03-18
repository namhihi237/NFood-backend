let password = '123456';

const account = [
  {
    phoneNumber: '+84982402591',
    password: "",
    isActive: true,
    isBuyer: true,
    role: ['buyer'],
    buyer: {
      name: "Duy Nguyen",
      phoneNumber: '+84982402591',
      address: '444 Ton Duc Thang, Quận Lien Chieu, Đà Nẵng',
      email: ''
    }
  },

  {
    phoneNumber: '+84971502291',
    password: "",
    isActive: true,
    isBuyer: true,
    role: ['buyer'],
    buyer: {
      name: "An Thai",
      phoneNumber: '+84971502291',
      address: '673 Nguyễn Chánh, Quận Liên Chiểu , Đà Nẵng',
      email: ''
    }
  }
]

export const buyerData = {
  account,
  password
}