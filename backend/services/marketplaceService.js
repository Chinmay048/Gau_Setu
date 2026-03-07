const { getDatabase } = require('../database/db');

/**
 * Phase 3: Digital Dairy Marketplace
 */

// ─── List Product ────────────────────────────────────────

const listProduct = (farmerId, productData) => {
  const db = getDatabase();
  const { productName, productType, description, price, unit, stockQuantity, imageUrl } = productData;

  // Check if farmer has any verified cows (for badge eligibility)
  const verifiedCount = db.prepare('SELECT COUNT(*) as count FROM cows WHERE farmer_id = ? AND is_verified = 1').get(farmerId).count;
  const isVerified = verifiedCount > 0 ? 1 : 0;

  // Check A2 certification
  const a2Count = db.prepare(`
    SELECT COUNT(*) as count FROM cows c
    JOIN cow_genetics g ON c.id = g.cow_id
    WHERE c.farmer_id = ? AND g.a2_gene_status = 'A2A2' AND c.dna_status = 'verified'
  `).get(farmerId).count;
  const isA2 = a2Count > 0 ? 1 : 0;

  const result = db.prepare(`
    INSERT INTO marketplace_products (farmer_id, product_name, product_type, description, price, unit, stock_quantity, is_verified, is_a2_certified, image_url, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
  `).run(farmerId, productName, productType, description || '', price, unit || 'liter', stockQuantity || 0, isVerified, isA2, imageUrl || '');

  return getProductById(result.lastInsertRowid);
};

// ─── Get All Products (Marketplace) ──────────────────────

const getMarketplaceProducts = (filters) => {
  const db = getDatabase();
  const { productType, isA2Only, isVerifiedOnly, minPrice, maxPrice } = filters || {};

  let query = `
    SELECT p.*, f.farm_name, f.location, f.reputation_score
    FROM marketplace_products p
    JOIN farmers f ON p.farmer_id = f.id
    WHERE p.status = 'active'
  `;
  const params = [];

  if (productType) {
    query += ' AND p.product_type = ?';
    params.push(productType);
  }
  if (isA2Only) {
    query += ' AND p.is_a2_certified = 1';
  }
  if (isVerifiedOnly) {
    query += ' AND p.is_verified = 1';
  }
  if (minPrice) {
    query += ' AND p.price >= ?';
    params.push(minPrice);
  }
  if (maxPrice) {
    query += ' AND p.price <= ?';
    params.push(maxPrice);
  }

  query += ' ORDER BY p.is_verified DESC, f.reputation_score DESC, p.created_at DESC';

  return db.prepare(query).all(...params).map(formatProduct);
};

// ─── Get Products by Farmer ──────────────────────────────

const getProductsByFarmer = (farmerId) => {
  const db = getDatabase();
  return db.prepare(`
    SELECT p.*, f.farm_name, f.location, f.reputation_score
    FROM marketplace_products p
    JOIN farmers f ON p.farmer_id = f.id
    WHERE p.farmer_id = ?
    ORDER BY p.created_at DESC
  `).all(farmerId).map(formatProduct);
};

// ─── Update Product ──────────────────────────────────────

const updateProduct = (productId, farmerId, updates) => {
  const db = getDatabase();

  const product = db.prepare('SELECT * FROM marketplace_products WHERE id = ? AND farmer_id = ?').get(productId, farmerId);
  if (!product) throw new Error('Product not found or not authorized');

  const fields = [];
  const values = [];

  if (updates.price !== undefined) { fields.push('price = ?'); values.push(updates.price); }
  if (updates.stockQuantity !== undefined) { fields.push('stock_quantity = ?'); values.push(updates.stockQuantity); }
  if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
  if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }

  if (fields.length > 0) {
    values.push(productId);
    db.prepare(`UPDATE marketplace_products SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  }

  return getProductById(productId);
};

// ─── Place Order ─────────────────────────────────────────

const placeOrder = (productId, orderData) => {
  const db = getDatabase();
  const { buyerName, buyerPhone, buyerAddress, quantity } = orderData;

  const product = db.prepare('SELECT * FROM marketplace_products WHERE id = ? AND status = ?').get(productId, 'active');
  if (!product) throw new Error('Product not found or unavailable');
  if (product.stock_quantity < quantity) throw new Error('Insufficient stock');

  const totalPrice = product.price * quantity;

  const result = db.prepare(`
    INSERT INTO orders (product_id, buyer_name, buyer_phone, buyer_address, quantity, total_price, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `).run(productId, buyerName, buyerPhone || '', buyerAddress || '', quantity, totalPrice);

  // Reduce stock
  db.prepare('UPDATE marketplace_products SET stock_quantity = stock_quantity - ? WHERE id = ?').run(quantity, productId);

  return {
    id: result.lastInsertRowid,
    productId,
    productName: product.product_name,
    buyerName,
    quantity,
    totalPrice,
    status: 'pending',
  };
};

// ─── Get Orders for Farmer ───────────────────────────────

const getOrdersByFarmer = (farmerId) => {
  const db = getDatabase();
  return db.prepare(`
    SELECT o.*, p.product_name, p.product_type, p.price as unit_price
    FROM orders o
    JOIN marketplace_products p ON o.product_id = p.id
    WHERE p.farmer_id = ?
    ORDER BY o.created_at DESC
  `).all(farmerId).map(o => ({
    id: o.id,
    productName: o.product_name,
    productType: o.product_type,
    buyerName: o.buyer_name,
    buyerPhone: o.buyer_phone,
    quantity: o.quantity,
    unitPrice: o.unit_price,
    totalPrice: o.total_price,
    status: o.status,
    createdAt: o.created_at,
  }));
};

// ─── Update Order Status ─────────────────────────────────

const updateOrderStatus = (orderId, farmerId, newStatus) => {
  const db = getDatabase();

  const order = db.prepare(`
    SELECT o.* FROM orders o
    JOIN marketplace_products p ON o.product_id = p.id
    WHERE o.id = ? AND p.farmer_id = ?
  `).get(orderId, farmerId);

  if (!order) throw new Error('Order not found or not authorized');

  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(newStatus, orderId);
  return { id: orderId, status: newStatus };
};

// ─── Farmer Reputation Score ─────────────────────────────

const calculateReputationScore = (farmerId) => {
  const db = getDatabase();

  const verifiedCattle = db.prepare('SELECT COUNT(*) as count FROM cows WHERE farmer_id = ? AND is_verified = 1').get(farmerId).count;
  const totalCattle = db.prepare('SELECT COUNT(*) as count FROM cows WHERE farmer_id = ?').get(farmerId).count;
  const dnaVerified = db.prepare('SELECT COUNT(*) as count FROM cows WHERE farmer_id = ? AND dna_status = ?').get(farmerId, 'verified').count;
  const completedOrders = db.prepare(`
    SELECT COUNT(*) as count FROM orders o
    JOIN marketplace_products p ON o.product_id = p.id
    WHERE p.farmer_id = ? AND o.status = 'delivered'
  `).get(farmerId).count;
  const milkRecords = db.prepare('SELECT COUNT(*) as count FROM milk_records WHERE farmer_id = ?').get(farmerId).count;

  // Score calculation (0-100)
  const cattleScore = Math.min(verifiedCattle * 10, 30); // Max 30 points
  const dnaScore = Math.min(dnaVerified * 5, 20); // Max 20 points
  const orderScore = Math.min(completedOrders * 2, 20); // Max 20 points
  const milkScore = Math.min(Math.floor(milkRecords / 10), 15); // Max 15 points
  const baseScore = 15; // Everyone starts with 15

  const score = Math.min(baseScore + cattleScore + dnaScore + orderScore + milkScore, 100);

  // Update farmer score
  db.prepare('UPDATE farmers SET reputation_score = ?, total_verified_cattle = ? WHERE id = ?')
    .run(score, verifiedCattle, farmerId);

  return {
    farmerId,
    reputationScore: score,
    breakdown: {
      baseScore,
      verifiedCattleScore: cattleScore,
      dnaVerificationScore: dnaScore,
      orderFulfillmentScore: orderScore,
      milkProductionScore: milkScore,
    },
    stats: {
      totalCattle,
      verifiedCattle,
      dnaVerified,
      completedOrders,
      milkRecords,
    },
  };
};

// ─── Helpers ─────────────────────────────────────────────

const getProductById = (id) => {
  const db = getDatabase();
  const p = db.prepare(`
    SELECT p.*, f.farm_name, f.location, f.reputation_score
    FROM marketplace_products p
    JOIN farmers f ON p.farmer_id = f.id
    WHERE p.id = ?
  `).get(id);
  return p ? formatProduct(p) : null;
};

const formatProduct = (p) => ({
  id: p.id,
  farmerId: p.farmer_id,
  farmName: p.farm_name,
  farmLocation: p.location,
  farmerReputation: p.reputation_score,
  productName: p.product_name,
  productType: p.product_type,
  description: p.description,
  price: p.price,
  unit: p.unit,
  stockQuantity: p.stock_quantity,
  isVerified: p.is_verified === 1,
  isA2Certified: p.is_a2_certified === 1,
  badge: p.is_verified === 1 ? 'GauSetu Verified' : null,
  a2Badge: p.is_a2_certified === 1 ? 'Verified A2' : null,
  imageUrl: p.image_url,
  status: p.status,
  createdAt: p.created_at,
});

module.exports = {
  listProduct,
  getMarketplaceProducts,
  getProductsByFarmer,
  updateProduct,
  placeOrder,
  getOrdersByFarmer,
  updateOrderStatus,
  calculateReputationScore,
};
