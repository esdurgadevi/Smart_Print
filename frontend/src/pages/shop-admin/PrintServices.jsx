import React, { useState, useEffect } from "react";
import shopService from "../../services/shopService";
import { Printer, Plus, Edit, Trash2, Image as ImageIcon, X, Save, IndianRupee } from "lucide-react";

const PrintServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null); // track which service is being edited
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: "",
    description: "",
    price: "",
    imageUrl: "",
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await shopService.getMyShop();
      if (data.shop && data.shop.services) {
        setServices(data.shop.services);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Please create a shop in the Dashboard first.");
      } else {
        setError("Failed to load services.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (service) => {
    setEditingId(service.id);
    setFormData({
      serviceName: service.serviceName || "",
      description: service.description || "",
      price: service.price || "",
      imageUrl: service.imageUrl || "",
      isActive: service.isActive !== false,
    });
    setIsAdding(true);
    setError("");
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ serviceName: "", description: "", price: "", imageUrl: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.serviceName || !formData.price) {
      setError("Service Name and Price are required.");
      return;
    }
    
    try {
      setSaving(true);
      setError("");
      
      if (editingId) {
        await shopService.updateService(editingId, formData);
      } else {
        await shopService.addService(formData);
      }

      // Reset form & hide add
      handleCancel();
      // Refresh list
      await fetchServices();
    } catch (err) {
      setError(err.response?.data?.message || (editingId ? "Failed to update service" : "Failed to add service"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Printer className="h-8 w-8 text-orange-500" />
            Print Services
          </h1>
          <p className="text-gray-500 mt-2">Manage all the print services you offer to customers.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ serviceName: "", description: "", price: "", imageUrl: "" }); setError(""); }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-orange-200 active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" /> Add New Service
          </button>
        )}
      </div>

      {error && !isAdding && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium">
          {error}
        </div>
      )}

      {/* Add Service Form */}
      {isAdding && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transform transition-all duration-300 scale-100 opacity-100">
          <div className="bg-gray-50 px-8 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">{editingId ? 'Edit Service' : 'Add New Service'}</h2>
            <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Service Name *</label>
                <select 
                  name="serviceName" 
                  value={formData.serviceName} 
                  onChange={handleInputChange} 
                  required
                  className="mt-1 w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all bg-white text-gray-900 appearance-none" 
                >
                  <option value="" disabled>Select a Print Service</option>
                  <option value="Black & White Print">Black & White Print</option>
                  <option value="Color Print">Color Print</option>
                  <option value="Card Print">Card Print</option>
                  <option value="Invitation Print">Invitation Print</option>
                  <option value="Poster Print">Poster Print</option>
                  <option value="Document Binding">Document Binding</option>
                  <option value="Lamination">Lamination</option>
                  <option value="Photo Print">Photo Print</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Description</label>
                <textarea 
                  name="description" 
                  rows="3" 
                  placeholder="Describe your service (paper quality, sides, binding options, etc.)"
                  value={formData.description} 
                  onChange={handleInputChange} 
                  className="mt-1 w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-400 resize-none" 
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Price (₹) *</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IndianRupee className="h-4 w-4 text-gray-400" />
                  </div>
                  <input 
                    type="number" 
                    step="0.01"
                    name="price" 
                    placeholder="2.50"
                    value={formData.price} 
                    onChange={handleInputChange} 
                    required
                    className="w-full pl-10 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-400" 
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Image URL</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ImageIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    name="imageUrl" 
                    placeholder="https://example.com/image.jpg"
                    value={formData.imageUrl} 
                    onChange={handleInputChange} 
                    className="w-full pl-10 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-400" 
                  />
                </div>
              </div>
              {editingId && (
                <div className="md:col-span-2 flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive !== false}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
                    Service is Active (Visible to customers)
                  </label>
                </div>
              )}
            </div>

            {error && isAdding && (
              <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button 
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all focus:outline-none"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={saving}
                className="px-8 py-3 rounded-xl font-medium text-white bg-orange-500 hover:bg-orange-600 transition-all flex items-center gap-2 shadow-lg shadow-orange-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-5 w-5" />
                )}
                {editingId ? 'Update Service' : 'Save Service'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Services List */}
      {!isAdding && services.length === 0 && !error ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
          <Printer className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Services Yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            You haven't added any print services to your shop. Add your first service to start receiving orders.
          </p>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2 transition-all"
          >
            <Plus className="h-5 w-5" /> Add First Service
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
              {service.imageUrl ? (
                <div className="h-48 w-full bg-gray-100 overflow-hidden relative">
                  <img 
                    src={service.imageUrl} 
                    alt={service.serviceName} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                  />
                  {!service.isActive && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                      Inactive
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-48 w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
                  <ImageIcon className="h-12 w-12 text-gray-300" />
                  {!service.isActive && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                      Inactive
                    </div>
                  )}
                </div>
              )}
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2 gap-4">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-2 leading-tight">{service.serviceName}</h3>
                  <div className="bg-orange-50 text-orange-600 font-bold px-3 py-1 rounded-lg shrink-0">
                    ₹{Number(service.price).toFixed(2)}
                  </div>
                </div>
                
                <p className="text-gray-500 text-sm line-clamp-3 mb-6 min-h-[60px]">
                  {service.description || "No description provided."}
                </p>
                
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => handleEditClick(service)}
                    className="flex-1 justify-center bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors text-sm"
                  >
                    <Edit className="h-4 w-4" /> Edit
                  </button>
                  {/* Delete button stub (backend doesn't support delete yet) */}
                  <button 
                     title="Delete not implemented yet"
                     className="p-2.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
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

export default PrintServices;
