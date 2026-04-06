import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import shopService from "../../services/shopService";
import { Store, Plus, MapPin, Phone, Package, Edit, Trash2 } from "lucide-react";

const ShopDashboard = () => {
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreatingShop, setIsCreatingShop] = useState(false);
  const [isAddingService, setIsAddingService] = useState(false);

  // Shop Form State
  const [shopForm, setShopForm] = useState({
    shopName: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
    logoUrl: "",
  });

  // Service Form State
  const [serviceForm, setServiceForm] = useState({
    serviceName: "",
    description: "",
    price: "",
    imageUrl: "",
  });

  useEffect(() => {
    fetchMyShop();
  }, []);

  const fetchMyShop = async () => {
    try {
      setLoading(true);
      const data = await shopService.getMyShop();
      setShop(data.shop);
      setIsCreatingShop(false);
    } catch (err) {
      if (err.response?.status === 404) {
        setIsCreatingShop(true);
      } else {
        setError("Failed to load shop details.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShop = async (e) => {
    e.preventDefault();
    try {
      await shopService.createShop({
        ...shopForm,
        latitude: parseFloat(shopForm.latitude) || null,
        longitude: parseFloat(shopForm.longitude) || null,
      });
      fetchMyShop();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create shop");
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      await shopService.addService({
        ...serviceForm,
        price: parseFloat(serviceForm.price),
      });
      setIsAddingService(false);
      setServiceForm({ serviceName: "", description: "", price: "", imageUrl: "" });
      fetchMyShop(); // Refresh to show new service
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add service");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // ==== CREATE SHOP UI ====
  if (isCreatingShop) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-orange-500 p-8 text-white text-center">
            <Store className="h-16 w-16 mx-auto mb-4 opacity-90" />
            <h1 className="text-3xl font-bold">Set Up Your Print Shop</h1>
            <p className="mt-2 text-orange-100">Add your shop details to start receiving orders</p>
          </div>
          
          <div className="p-8">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6">{error}</div>}
            
            <form onSubmit={handleCreateShop} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    value={shopForm.shopName}
                    onChange={(e) => setShopForm({ ...shopForm, shopName: e.target.value })}
                    placeholder="E.g. Fast Print Xerox"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL (Optional)</label>
                  <input
                    type="url"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    value={shopForm.logoUrl}
                    onChange={(e) => setShopForm({ ...shopForm, logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  required
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  value={shopForm.description}
                  onChange={(e) => setShopForm({ ...shopForm, description: e.target.value })}
                  placeholder="Tell customers about your services..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
                <textarea
                  required
                  rows="2"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  value={shopForm.address}
                  onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
                  placeholder="123 Printing Street, City..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6 pb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Latitude (Map coordinates)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    value={shopForm.latitude}
                    onChange={(e) => setShopForm({ ...shopForm, latitude: e.target.value })}
                    placeholder="E.g. 12.9716"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Longitude (Map coordinates)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    value={shopForm.longitude}
                    onChange={(e) => setShopForm({ ...shopForm, longitude: e.target.value })}
                    placeholder="E.g. 77.5946"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-orange-500/30 transition-all active:scale-[0.98]"
              >
                Create My Shop
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ==== SHOP DASHBOARD UI ====
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Profile */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-orange-400 to-orange-600"></div>
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row items-end md:items-center justify-between -mt-12 md:-mt-16 gap-6">
            <div className="flex items-end space-x-6">
              <div className="h-24 w-24 rounded-2xl bg-white p-2 shadow-lg border border-gray-100 flex items-center justify-center overflow-hidden">
                {shop?.logoUrl ? (
                  <img src={shop.logoUrl} alt={shop.shopName} className="h-full w-full object-cover rounded-xl" />
                ) : (
                  <Store className="h-12 w-12 text-orange-500 opacity-80" />
                )}
              </div>
              <div className="pb-2">
                <h1 className="text-3xl font-bold text-gray-900">{shop?.shopName}</h1>
                <p className="text-green-600 font-medium flex items-center gap-1 mt-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Active & Accepting Orders
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsAddingService(!isAddingService)}
              className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-md active:scale-[0.98]"
            >
              {isAddingService ? 'Cancel' : <><Plus className="h-5 w-5" /> Add New Service</>}
            </button>
          </div>
          
          <div className="mt-8 grid md:grid-cols-2 gap-4 text-gray-600">
            <p className="flex items-start gap-3">
              <Store className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
              <span>{shop?.description}</span>
            </p>
            <p className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
              <span>{shop?.address || shop?.fullAddress || "No address provided"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Add Service Section */}
      {isAddingService && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Package className="h-6 w-6 text-orange-500" />
            Add New Service
          </h2>
          <form onSubmit={handleAddService} className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                value={serviceForm.serviceName}
                onChange={(e) => setServiceForm({ ...serviceForm, serviceName: e.target.value })}
                placeholder="E.g. A4 Black & White Print"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                value={serviceForm.price}
                onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                placeholder="E.g. 2.50"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                required
                rows="2"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                value={serviceForm.description}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                placeholder="Details about the service, quality, timing..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (Optional)</label>
              <input
                type="url"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                value={serviceForm.imageUrl}
                onChange={(e) => setServiceForm({ ...serviceForm, imageUrl: e.target.value })}
                placeholder="https://example.com/service-image.png"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setIsAddingService(false)}
                className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-md active:scale-[0.98]"
              >
                Save Service
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Services List */}
      <h2 className="text-xl font-bold flex items-center gap-2 pt-4">
        <Package className="h-6 w-6 text-orange-500" />
        Your Services ({shop?.services?.length || 0})
      </h2>
      
      {shop?.services?.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
          <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium text-gray-900">No services added yet</p>
          <p className="mt-1">Add your first printing or ordering service to let customers order from you.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shop?.services?.map((service) => (
            <div key={service.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
              {service.imageUrl && (
                <div className="h-48 w-full bg-gray-100 overflow-hidden">
                  <img src={service.imageUrl} alt={service.serviceName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900 leading-tight">{service.serviceName}</h3>
                  <span className="bg-orange-100 text-orange-700 text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap ml-3">
                    ₹{Number(service.price).toFixed(2)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-6 flex-1">{service.description}</p>
                <div className="flex justify-end gap-2 pt-4 border-t border-gray-50 mt-auto">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopDashboard;