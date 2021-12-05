import moment from 'moment';

export default {
  estimatedDeliveryTime: (parent, args, context) => {
    if (!parent.estimatedDeliveryTime) {
      return null;
    }
    return moment(parent.estimatedDeliveryTime).format('DD/MM/YYYY HH:mm');
  },

  deliveredAt: (parent, args, context) => {
    if (!parent.deliveredAt) {
      return null;
    }
    return moment(parent.deliveredAt).format('DD/MM/YYYY');
  },

  acceptedShippingAt: (parent, args, context) => {
    if (!parent.acceptedShippingAt) {
      return null;
    }
    return moment(parent.acceptedShippingAt).format('DD/MM/YYYY HH:mm');
  }
}