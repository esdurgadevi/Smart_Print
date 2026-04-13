import React, { useState, useEffect } from "react";
import inventoryService from "../../services/inventoryService";
import { 
  Box, Plus, Edit, Trash2, Package, 
  AlertTriangle, RefreshCw, X, Save, 
  ChevronRight, IndianRupee, Tag
} from "lucide-react";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    productName: "Paper",
    stockCount: 0,
    minStockAlertCount: 10
  });

  const productTypes = ["Paper", "Board", "Spiral", "Visiting Card", "Invite Card"];

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getInventory();
      setInventory(data.inventory);
    } catch (err) {
      setError("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      productName: item.productName,
      stockCount: item.stockCount,
      minStockAlertCount: item.minStockAlertCount
    });
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this inventory item?")) {
      try {
        await inventoryService.deleteInventoryItem(id);
        fetchInventory();
      } catch (err) {
        setError("Failed to delete item");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await inventoryService.updateInventoryItem(editingId, formData);
      } else {
        await inventoryService.addInventoryItem(formData);
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({ productName: "Paper", stockCount: 0, minStockAlertCount: 10 });
      fetchInventory();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save inventory");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Inventory Management</h1>
          <p className="text-gray-500 mt-1">Track and manage your print consumables and stock levels.</p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setEditingId(null); }}
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-orange-200 transition-all flex items-center gap-2 active:scale-95"
        >
          <Plus className="h-5 w-5" /> Add New Item
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl flex items-center gap-3">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Form Section */}
      {isAdding && (
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-8 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Box className="h-6 w-6 text-orange-500" />
              {editingId ? "Edit Item" : "Add New Consumable"}
            </h2>
            <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
          </div>

          <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Product Category</label>
              <select 
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-orange-500 outline-none transition-all font-medium"
                value={formData.productName}
                onChange={(e) => setFormData({...formData, productName: e.target.value})}
              >
                {productTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Initial Stock Count</label>
              <input 
                type="number"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-orange-500 outline-none transition-all font-medium"
                value={formData.stockCount}
                onChange={(e) => setFormData({...formData, stockCount: parseInt(e.target.value)})}
                placeholder="e.g. 500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Stock Alert Threshold</label>
              <input 
                type="number"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-orange-500 outline-none transition-all font-medium"
                value={formData.minStockAlertCount}
                onChange={(e) => setFormData({...formData, minStockAlertCount: parseInt(e.target.value)})}
                placeholder="Alert if below..."
              />
            </div>
            <div className="md:col-span-3 flex justify-end gap-4 pt-4 border-t border-gray-50">
              <button 
                type="button" onClick={() => setIsAdding(false)}
                className="px-8 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-gray-900 text-white px-10 py-3 rounded-2xl font-bold shadow-lg shadow-gray-200 hover:bg-black transition-all active:scale-95"
              >
                {editingId ? "Update Stock" : "Initialize Item"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid Section */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventory.map(item => (
          <div key={item.id} className="group relative bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl ${item.stockCount <= item.minStockAlertCount ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                <Package className="h-6 w-6" />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                <button 
                  onClick={() => handleEdit(item)}
                  className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{item.productName}</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Category</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
                <div>
                  <p className={`text-2xl font-black ${item.stockCount <= item.minStockAlertCount ? 'text-red-600' : 'text-gray-900'}`}>
                    {item.stockCount}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Current Stock</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-800">{item.minStockAlertCount}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Threshold</p>
                </div>
              </div>

              {item.stockCount <= item.minStockAlertCount && (
                <div className="bg-red-50 text-red-600 px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-bold animate-pulse">
                  <AlertTriangle className="h-4 w-4" />
                  Running Low!
                </div>
              )}
            </div>
          </div>
        ))}

        {inventory.length === 0 && !isAdding && (
          <div className="md:col-span-2 lg:col-span-3 h-64 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400">
            <Package className="h-12 w-12 mb-2 opacity-20" />
            <p className="font-medium">No items in your inventory yet.</p>
            <button 
              onClick={() => setIsAdding(true)}
              className="mt-4 text-orange-600 font-bold text-sm underline underline-offset-4"
            >
              Add your first consumable
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
