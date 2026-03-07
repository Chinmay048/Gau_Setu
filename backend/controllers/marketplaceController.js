const marketplaceService = require('../services/marketplaceService');

const listProduct = (req, res) => {
  try {
    const product = marketplaceService.listProduct(req.userId, req.body);
    res.status(201).json({ success: true, message: 'Product listed', product });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getProducts = (req, res) => {
  try {
    const { category, min_price, max_price, search, sort_by } = req.query;
    const products = marketplaceService.getMarketplaceProducts({
      category,
      minPrice: min_price ? Number(min_price) : undefined,
      maxPrice: max_price ? Number(max_price) : undefined,
      search,
      sortBy: sort_by,
    });
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getMyProducts = (req, res) => {
  try {
    const products = marketplaceService.getProductsByFarmer(req.userId);
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateProduct = (req, res) => {
  try {
    const product = marketplaceService.updateProduct(req.params.productId, req.userId, req.body);
    res.json({ success: true, message: 'Product updated', product });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const placeOrder = (req, res) => {
  try {
    const { productId, quantity, deliveryAddress } = req.body;
    const order = marketplaceService.placeOrder({
      buyerFarmerId: req.userId,
      productId,
      quantity,
      deliveryAddress,
    });
    res.status(201).json({ success: true, message: 'Order placed', order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getMyOrders = (req, res) => {
  try {
    const orders = marketplaceService.getOrdersByFarmer(req.userId);
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateOrderStatus = (req, res) => {
  try {
    const order = marketplaceService.updateOrderStatus(req.params.orderId, req.userId, req.body.status);
    res.json({ success: true, message: 'Order status updated', order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getReputation = (req, res) => {
  try {
    const farmerId = req.params.farmerId || req.userId;
    const reputation = marketplaceService.calculateReputationScore(farmerId);
    res.json({ success: true, ...reputation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  listProduct,
  getProducts,
  getMyProducts,
  updateProduct,
  placeOrder,
  getMyOrders,
  updateOrderStatus,
  getReputation,
};
