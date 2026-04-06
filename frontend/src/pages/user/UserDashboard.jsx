import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import shopService from "../../services/shopService";
import { Store, MapPin, Search } from "lucide-react";

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState("");
  
  const [selectedService, setSelectedService] = useState("");
  const [selectedSort, setSelectedSort] = useState("");
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    // Try to get user location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
          fetchShops(position.coords.latitude, position.coords.longitude, selectedService, selectedSort);
        },
        (error) => {
          console.log("Location access denied or failed", error);
          setLocationError("Showing all shops. Enable location to see nearby shops first.");
          fetchShops(null, null, selectedService, selectedSort); 
        }
      );
    } else {
      fetchShops(null, null, selectedService, selectedSort);
    }
  }, []);

  useEffect(() => {
    if (coords) {
      fetchShops(coords.lat, coords.lng, selectedService, selectedSort);
    } else {
      fetchShops(null, null, selectedService, selectedSort);
    }
  }, [selectedService, selectedSort]);

  const fetchShops = async (lat, lng, service, sort) => {
    try {
      setLoading(true);
      const data = await shopService.getAllShops(lat, lng, service, sort);
      setShops(data.shops);
    } catch (error) {
      console.error("Failed to fetch shops", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-10 md:p-16 mb-12 text-center text-white shadow-lg overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1546746401-085e2b8cb1da?auto=format&fit=crop&q=80')] opacity-10 mix-blend-overlay bg-cover bg-center"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Find the Best Print Shops Near You</h1>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto mb-10">
            Order prints, notebooks, and cards from local vendors with ease.
          </p>
          
          <div className="max-w-2xl mx-auto bg-white rounded-full p-2 flex shadow-xl">
            <div className="flex-1 flex items-center px-4">
              <MapPin className="h-6 w-6 text-gray-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Search shops or services..." 
                className="w-full px-4 py-3 outline-none text-gray-700 bg-transparent text-lg"
              />
            </div>
            
            <div className="flex-1 flex gap-2 items-center px-2 border-l border-gray-100">
               <select 
                 value={selectedService} 
                 onChange={(e) => setSelectedService(e.target.value)}
                 className="outline-none text-gray-600 bg-transparent py-3 flex-1 font-medium bg-white"
               >
                 <option value="">All Services</option>
                 <option value="Black & White Print">B&W Print</option>
                 <option value="Color Print">Color Print</option>
                 <option value="Card Print">Card Print</option>
                 <option value="Invitation Print">Invitation Print</option>
                 <option value="Poster Print">Poster Print</option>
                 <option value="Document Binding">Document Binding</option>
                 <option value="Lamination">Lamination</option>
                 <option value="Photo Print">Photo Print</option>
               </select>

               <select 
                 value={selectedSort} 
                 onChange={(e) => setSelectedSort(e.target.value)}
                 className="outline-none text-gray-600 bg-transparent py-3 font-medium bg-white"
               >
                 <option value="">Sort by Distance</option>
                 <option value="cost_low">Cost: Low to High</option>
               </select>
            </div>

            <button className="bg-gray-900 hover:bg-black ml-2 text-white px-8 py-4 rounded-full font-bold transition-all flex items-center gap-2 active:scale-[0.98]">
              <Search className="h-5 w-5" />
              Search
            </button>
          </div>
        </div>
      </div>

      {locationError && (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl mb-8 flex items-center justify-center font-medium">
          {locationError}
        </div>
      )}

      {/* Recommended Shops */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold font-heading text-gray-900 flex items-center gap-3">
          <Store className="h-8 w-8 text-orange-500" />
          {shops.length > 0 && shops[0].distance_km !== undefined ? "Nearby Print Shops" : "All Print Shops"}
        </h2>
        <span className="text-gray-500 font-medium">{shops.length} shops found</span>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-pulse">
          {[1,2,3,4].map(n => (
            <div key={n} className="bg-gray-100 rounded-3xl h-80"></div>
          ))}
        </div>
      ) : shops.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl">
          <Store className="h-20 w-20 mx-auto text-gray-300 mb-4" />
          <h3 className="text-2xl font-bold text-gray-900">No Shops Found</h3>
          <p className="text-gray-500 mt-2">Check back later for new print shops in your area.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {shops.map((shop) => (
            <div 
              key={shop.id} 
              onClick={() => navigate(`/dashboard/shop/${shop.id}`)}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col"
            >
              <div className="h-56 bg-gray-100 relative overflow-hidden">
                {shop.logoUrl ? (
                  <img src={shop.logoUrl} alt={shop.shopName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-orange-100">
                    <Store className="h-16 w-16 text-orange-400 opacity-50" />
                  </div>
                )}
                {/* Distance Badge */}
                {shop.distance_km !== undefined && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-gray-900 shadow-sm flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-orange-500" />
                    {Number(shop.distance_km).toFixed(1)} km
                  </div>
                )}
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight group-hover:text-orange-500 transition-colors">
                  {shop.shopName}
                </h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{shop.description}</p>
                
                <div mt-auto className="mt-auto">
                  <div className="flex items-center gap-2 text-sm text-gray-600 border-t border-gray-100 pt-4">
                    <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="truncate">{shop.address}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;