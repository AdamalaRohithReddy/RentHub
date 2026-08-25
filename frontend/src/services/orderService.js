import { api } from '../api/client';

export const orderService = {
  createOrder: (resourceId, quantity) => api.createOrder({ resourceId, quantity }),
  getMyOrders: () => api.getMyOrders(),
  getReceivedOrders: () => api.getReceivedOrders(),
  acceptOrder: (orderId) => api.acceptOrder(orderId),
  rejectOrder: (orderId) => api.rejectOrder(orderId),
};

export default orderService;
