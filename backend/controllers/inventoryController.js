import { Inventory, Shop } from "../models/index.js";

// Get all inventory items for a shop
export const getInventory = async (req, res) => {
  try {
    const shop = await Shop.findOne({ where: { adminId: req.user.id } });
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    console.log(req.user.id);
    console.log(shop);

    const inventory = await Inventory.findAll({
      where: { shopId: shop.id },
      order: [["productName", "ASC"]],
    });
    res.status(200).json({ inventory });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch inventory", error: error.message });
  }
};

// Add new inventory item
export const addInventoryItem = async (req, res) => {
  try {
    const { productName, stockCount, minStockAlertCount } = req.body;

    const shop = await Shop.findOne({ where: { adminId: req.user.id } });
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    // Ensure we only add allowed products (Paper, Board, Spiral, Visiting Card, Invite Card)
    const allowed = ["Paper", "Board", "Spiral", "Visiting Card", "Invite Card"];
    if (!allowed.includes(productName)) {
      return res.status(400).json({ message: `Product type '${productName}' is not allowed.` });
    }

    const newItem = await Inventory.create({
      shopId: shop.id,
      productName,
      stockCount: stockCount || 0,
      minStockAlertCount: minStockAlertCount || 10,
    });

    res.status(201).json({ message: "Inventory item added", item: newItem });
  } catch (error) {
    res.status(500).json({ message: "Failed to add inventory item", error: error.message });
  }
};

// Update inventory item (Restock or Edit)
export const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { stockCount, minStockAlertCount, productName } = req.body;

    const item = await Inventory.findByPk(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const shop = await Shop.findOne({ where: { adminId: req.user.id } });
    if (!shop || item.shopId !== shop.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await item.update({
      productName: productName !== undefined ? productName : item.productName,
      stockCount: stockCount !== undefined ? stockCount : item.stockCount,
      minStockAlertCount: minStockAlertCount !== undefined ? minStockAlertCount : item.minStockAlertCount,
    });

    res.status(200).json({ message: "Inventory updated", item });
  } catch (error) {
    res.status(500).json({ message: "Failed to update inventory", error: error.message });
  }
};

// Delete inventory item
export const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Inventory.findByPk(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const shop = await Shop.findOne({ where: { adminId: req.user.id } });
    if (!shop || item.shopId !== shop.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await item.destroy();
    res.status(200).json({ message: "Inventory item deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete inventory item", error: error.message });
  }
};
