export default {
  openTime: (parent, args, context) => {
    if (!parent.openTime) {
      return null;
    }
    return new Date(parent.openTime).toUTCString().split(' ')[4].slice(0, -3);
  },

  closeTime: (parent, args, context) => {
    if (!parent.closeTime) {
      return null;
    }
    return new Date(parent.closeTime).toUTCString().split(' ')[4].slice(0, -3);
  }
}