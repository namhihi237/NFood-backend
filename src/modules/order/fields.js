import moment from 'moment';

export default {
  estimatedDeliveryTime: (parent, args, context) => {
    if (!parent.estimatedDeliveryTime) {
      return null;
    }
    return moment(parent.estimatedDeliveryTime).format('DD/MM/YYYY HH:mm');
  },

  deliveryDate: (parent, args, context) => {
    if (!parent.deliveryDate) {
      return null;
    }
    return moment(parent.deliveryDate).format('DD/MM/YYYY');
  },

  acceptedShippingAt: (parent, args, context) => {
    if (!parent.acceptedShippingAt) {
      return null;
    }
    return moment(parent.acceptedShippingAt).format('DD/MM/YYYY HH:mm');
  }
}