import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import shopService from "../../services/shopService";
import { Store, MapPin, Phone, Edit, MessageSquare, Clock, Mail, Navigation, Save, X, Star, ListOrdered } from "lucide-react";

const defaultHours = {
  monday: "09:00 AM - 06:00 PM",
  tuesday: "09:00 AM - 06:00 PM",
  wednesday: "09:00 AM - 06:00 PM",
  thursday: "09:00 AM - 06:00 PM",
  friday: "09:00 AM - 06:00 PM",
  saturday: "10:00 AM - 04:00 PM",
  sunday: "Closed"
};

const ShopProfile = () => {
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchMyShop();
  }, []);

  const fetchMyShop = async () => {
    try {
      setLoading(true);
      const data = await shopService.getMyShop();
      setShop(data.shop);
      // Initialize form data
      setFormData({
        shopName: data.shop.shopName || "",
        description: data.shop.description || "",
        logoUrl: data.shop.logoUrl || "",
        addressNo: data.shop.addressNo || "",
        street: data.shop.street || "",
        location: data.shop.location || "",
        city: data.shop.city || "",
        pincode: data.shop.pincode || "",
        fullAddress: data.shop.fullAddress || "",
        phone: data.shop.phone || "",
        email: data.shop.email || "",
        whatsapp: data.shop.whatsapp || "",
        directions: data.shop.directions || "",
        storeHours: data.shop.storeHours || defaultHours,
        queueType: data.shop.queueType || "FIFO",
      });
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Please create a shop in the Dashboard first.");
      } else {
        setError("Failed to load shop details.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHourChange = (day, value) => {
    setFormData((prev) => ({
      ...prev,
      storeHours: { ...prev.storeHours, [day]: value }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Auto-generate fullAddress if empty based on parts
      let finalFullAddress = formData.fullAddress;
      if (!finalFullAddress) {
        finalFullAddress = `${formData.addressNo} ${formData.street}, ${formData.location}, ${formData.city} - ${formData.pincode}`;
      }

      const payload = { ...formData, fullAddress: finalFullAddress };
      console.log(payload);
      await shopService.updateShop(payload);

      // Refresh
      await fetchMyShop();
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
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

  if (error && !shop) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-2xl border border-red-100 mt-6 max-w-4xl mx-auto">
        <Store className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <h2 className="text-2xl font-bold">{error}</h2>
      </div>
    );
  }

  // A helper function to generate a map embed URL using the provided address address
  const getMapUrl = () => {
    const query = encodeURIComponent(shop?.fullAddress || `${shop?.city} ${shop?.pincode}`);
    return `https://maps.google.com/maps?q=${query}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6 animate-in fade-in duration-500">

      {/* Header Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-orange-400 via-pink-500 to-orange-600"></div>
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row items-end md:items-center justify-between -mt-12 md:-mt-16 gap-6">
            <div className="flex items-end space-x-6">
              <div className="h-28 w-28 rounded-3xl bg-white p-2 shadow-xl border border-gray-100 flex flex-col items-center justify-center overflow-hidden">
                {shop?.logoUrl ? (
                  <img src={shop.logoUrl} alt={shop.shopName} className="h-full w-full object-cover rounded-2xl" />
                ) : (
                  <Store className="h-12 w-12 text-orange-500 opacity-80" />
                )}
              </div>
              <div className="pb-2">
                <h1 className="text-3xl font-bold text-gray-900">{shop?.shopName}</h1>
                <p className="text-gray-500 font-medium">Shop ID: #{shop?.id}</p>
              </div>
            </div>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-gray-200 active:scale-[0.98]"
              >
                <Edit className="h-5 w-5" /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all"
                >
                  <X className="h-5 w-5" /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-orange-200 active:scale-[0.98] disabled:opacity-70"
                >
                  {saving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Save className="h-5 w-5" />}
                  Save Changes
                </button>
              </div>
            )}
          </div>

          <div className="mt-8 text-gray-600 max-w-3xl leading-relaxed">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Shop Name</label>
                  <input type="text" name="shopName" value={formData.shopName} onChange={handleInputChange} className="mt-1 w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Description</label>
                  <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} className="mt-1 w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Logo Image URL</label>
                  <input type="text" name="logoUrl" value={formData.logoUrl} onChange={handleInputChange} className="mt-1 w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
              </div>
            ) : (
              <p className="text-lg">{shop?.description || "No description provided yet."}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* Left Column: Contact & Address */}
        <div className="lg:col-span-2 space-y-8">

          {/* Contact Information */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Phone className="h-5 w-5 text-orange-500" /> Contact Details
            </h3>

            {isEditing ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Phone</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="mt-1 w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">WhatsApp</label>
                  <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} className="mt-1 w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="mt-1 w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600"><Phone className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Phone</p>
                    <p className="text-gray-900 font-semibold">{shop?.phone || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-600"><MessageSquare className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">WhatsApp</p>
                    <p className="text-gray-900 font-semibold">{shop?.whatsapp || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 md:col-span-2">
                  <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Mail className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Email</p>
                    <p className="text-gray-900 font-semibold">{shop?.email || "Not provided"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Queue Management Section */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <ListOrdered className="h-5 w-5 text-orange-500" /> Queue Strategy
            </h3>
            <p className="text-sm text-gray-500 mb-6 font-medium">Define how orders are ranked and processed in your shop.</p>

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['FIFO', 'SJF', 'MANUAL'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFormData(prev => ({ ...prev, queueType: type }))}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${formData.queueType === type ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}
                    >
                      <p className="font-bold text-gray-900">{type}</p>
                      <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-bold">
                        {type === 'FIFO' ? 'First In First Out' : type === 'SJF' ? 'Shortest Job First' : 'Custom Priority'}
                      </p>
                    </button>
                  ))}
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <p className="text-xs text-blue-800 leading-relaxed font-medium">
                    {formData.queueType === 'FIFO' && "Orders will be sorted by their creation time. Standard first-come, first-served logic."}
                    {formData.queueType === 'SJF' && "Orders with fewer total pages will move to the front of the queue to ensure quick throughput for simple jobs."}
                    {formData.queueType === 'MANUAL' && "You will have full control to move orders up and down the queue manually in the Orders tab."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                  <ListOrdered className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900 capitalize">{shop?.queueType || "FIFO"} Strategy</p>
                  <p className="text-gray-500 font-medium">
                    {shop?.queueType === 'SJF' ? "Prioritizing smaller jobs first." : shop?.queueType === 'MANUAL' ? "Using custom priority levels." : "Processing in sequence of arrival."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Location & Map Area */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-orange-500" /> Location Details
            </h3>

            {isEditing ? (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Shop No / Unit</label>
                    <input type="text" name="addressNo" value={formData.addressNo} onChange={handleInputChange} className="mt-1 w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Street Name</label>
                    <input type="text" name="street" value={formData.street} onChange={handleInputChange} className="mt-1 w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Location / Area</label>
                    <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="mt-1 w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="mt-1 w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Pincode</label>
                    <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="mt-1 w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Full Address (Override for Map)</label>
                  <input type="text" name="fullAddress" value={formData.fullAddress} onChange={handleInputChange} placeholder="Leave blank to auto-generate from above fields" className="mt-1 w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Directions / Landmarks</label>
                  <textarea name="directions" rows="2" value={formData.directions} onChange={handleInputChange} className="mt-1 w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex gap-4 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                  <Navigation className="h-6 w-6 text-orange-600 shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">{shop?.fullAddress || "No full address set"}</p>
                    <p className="text-orange-700 text-sm mt-1">{shop?.directions && `Landmark: ${shop.directions}`}</p>
                  </div>
                </div>

                <div className="h-80 w-full rounded-2xl overflow-hidden shadow-inner border border-gray-200 bg-gray-100 flex items-center justify-center">
                  {shop?.fullAddress ? (
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight="0"
                      marginWidth="0"
                      src={getMapUrl()}
                      title="Shop Location"
                    ></iframe>
                  ) : (
                    <div className="text-center text-gray-400">
                      <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Update your address to see the map</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Feedbacks Section */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Star className="h-5 w-5 text-orange-500" /> Customer Feedbacks
            </h3>

            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No reviews yet.</p>
              <p className="text-sm text-gray-400 mt-1">Once customers place orders and leave reviews, they will appear here.</p>
            </div>
          </div>

        </div>

        {/* Right Column: Store Hours Side Panel */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-3xl shadow-lg border border-gray-800 text-white">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-400" /> Store Trading Hours
            </h3>

            <div className="space-y-4">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                <div key={day} className="flex flex-col sm:flex-row justify-between sm:items-center py-3 border-b border-gray-700/50 last:border-0 gap-2">
                  <span className="capitalize font-medium text-gray-300">{day}</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.storeHours?.[day] || ""}
                      onChange={(e) => handleHourChange(day, e.target.value)}
                      className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-1 text-sm text-white focus:ring-1 focus:ring-orange-500 outline-none w-32 md:w-40 text-right"
                      placeholder="e.g. 9am - 5pm"
                    />
                  ) : (
                    <span className={`font-semibold ${shop?.storeHours?.[day]?.toLowerCase() === 'closed' ? 'text-red-400' : 'text-white'}`}>
                      {shop?.storeHours?.[day] || "Not Set"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopProfile;
