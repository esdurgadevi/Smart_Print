import React, { useState, useEffect } from "react";
import deliveryService from "../../services/deliveryService";
import { MapPin, CheckCircle, Clock } from "lucide-react";

const DeliveryDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [nearbyOrders, setNearbyOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [addressForm, setAddressForm] = useState({ doorNo: "", street: "", city: "", pincode: "" });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, pendingRes, myOrdersRes] = await Promise.all([
        deliveryService.getDeliveryProfile(),
        deliveryService.getNearbyOrders(10),
        deliveryService.getMyDeliveries()
      ]);
      setProfile(profileRes);
      setIsOnline(profileRes.isOnline);
      setAddressForm({
        doorNo: profileRes.doorNo || "",
        street: profileRes.street || "",
        city: profileRes.city || "",
        pincode: profileRes.pincode || ""
      });
      setNearbyOrders(pendingRes.orders);
      setMyOrders(myOrdersRes.orders);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Simulate polling every 10 seconds for nearby orders
    const interval = setInterval(() => {
      if (isOnline) {
        deliveryService.getNearbyOrders(10).then(res => setNearbyOrders(res.orders));
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isOnline]);

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await deliveryService.updateDeliveryProfile(addressForm);
      setProfile(res.profile);
      alert("Address updated safely!");
    } catch (error) {
      alert("Failed to update address");
    }
  };

  const handleToggleOnline = async () => {
    const newState = !isOnline;

    if (newState) {
      // Going Online: Request real location
      if (!("geolocation" in navigator)) {
        alert("Geolocation is not supported by your browser.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            await deliveryService.updateLocation({
              latitude,
              longitude,
              isOnline: true,
            });
            setIsOnline(true);
            fetchDashboardData();
          } catch (error) {
            console.error("Server sync failed:", error);
            alert("Failed to sync status with server.");
          }
        },
        (error) => {
          alert("Location access is mandatory to receive delivery requests.");
          console.error("Geo error:", error);
        },
        { enableHighAccuracy: true }
      );
    } else {
      // Going Offline
      try {
        setIsOnline(false);
        await deliveryService.updateLocation({
          latitude: profile?.currentLatitude || 0,
          longitude: profile?.currentLongitude || 0,
          isOnline: false,
        });
        fetchDashboardData();
      } catch (error) {
        console.error("Offline sync failed:", error);
      }
    }
  };

  const acceptOrder = async (id) => {
    try {
      await deliveryService.acceptOrder(id);
      alert("Order accepted!");
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to accept order (maybe someone else got it)");
      fetchDashboardData();
    }
  };

  const updateDeliveryStatus = async (id, status) => {
    try {
      await deliveryService.updateDeliveryStatus(id, status);
      fetchDashboardData();
    } catch (error) {
      alert("Failed to update status");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Driver Status</h2>
          <p className="text-gray-500">Total Deliveries: {profile?.totalDeliveries || 0}</p>
        </div>
        <button
          onClick={handleToggleOnline}
          className={`px-6 py-2 rounded-full font-bold text-white transition-colors ${isOnline ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 hover:bg-gray-500"
            }`}
        >
          {isOnline ? "ACTIVE (Looking for jobs)" : "OFFLINE"}
        </button>
      </div>

      {!profile?.doorNo && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-4 text-orange-600">Please complete your driver profile. We need your address!</h3>
          <form className="grid grid-cols-2 gap-4" onSubmit={handleUpdateAddress}>
            <input type="text" placeholder="Door No" value={addressForm.doorNo} onChange={e => setAddressForm({ ...addressForm, doorNo: e.target.value })} required className="border p-2 rounded" />
            <input type="text" placeholder="Street" value={addressForm.street} onChange={e => setAddressForm({ ...addressForm, street: e.target.value })} required className="border p-2 rounded" />
            <input type="text" placeholder="City" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} required className="border p-2 rounded" />
            <input type="text" placeholder="Pincode" value={addressForm.pincode} onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })} required className="border p-2 rounded" />
            <button type="submit" className="col-span-2 bg-orange-500 text-white p-2 rounded hover:bg-orange-600">Update Profile</button>
          </form>
        </div>
      )}

      {isOnline && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-4 cursor-pointer">Live Incoming Requests ({nearbyOrders.length})</h3>

          {nearbyOrders.length === 0 ? (
            <p className="text-gray-500 italic">Scanning 10km radius... No pending orders right now.</p>
          ) : (
            <div className="space-y-4">
              {nearbyOrders.map(order => (
                <div key={order.id} className="border p-4 rounded-lg flex justify-between items-center border-orange-200 bg-orange-50">
                  <div>
                    <h4 className="font-bold">Pickup from: {order.shop?.shopName}</h4>
                    <p className="text-sm"><MapPin className="inline w-4 h-4 mr-1 text-gray-500" />{order.shop?.fullAddress}</p>
                    <p className="text-sm mt-2 font-medium">Deliver To:</p>
                    <p className="text-sm text-gray-600">{order.deliveryAddress?.doorNo}, {order.deliveryAddress?.street}, {order.deliveryAddress?.city} - {order.deliveryAddress?.pincode}</p>
                    <p className="text-xs text-orange-600 mt-2 font-semibold"><Clock className="inline w-3 h-3 mr-1" />Est. distance to shop: {order.pickupDistanceKm} km</p>
                  </div>
                  <div>
                    <div className="font-bold text-center mb-2">₹{order.totalAmount}</div>
                    <button onClick={() => acceptOrder(order.id)} className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800">
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-bold text-lg mb-4">My Deliveries</h3>
        <div className="space-y-4">
          {myOrders.length === 0 ? (
            <p className="text-gray-500">No assigned delivery jobs.</p>
          ) : (
            myOrders.map(order => (
              <div key={order.id} className="border p-4 rounded-lg flex justify-between items-center">
                <div>
                  <h4 className="font-bold">Order #{order.id} - {order.shop?.shopName}</h4>
                  <p className="text-sm">User: {order.user?.name} | User Phone: {order.user?.mobile}</p>
                  <p className="text-sm text-gray-500 mt-1">Status: <span className="font-semibold capitalize">{order.deliveryStatus}</span></p>
                </div>
                <div className="space-x-2">
                  {order.deliveryStatus === 'assigned' && (
                    <button onClick={async () => {
                      const otp = prompt("Enter 6-digit Pickup OTP provided by Shop Admin:");
                      if (!otp) return;
                      try {
                        await deliveryService.verifyPickup(order.id, otp.trim());
                        fetchDashboardData();
                      } catch (e) {
                         alert(e.response?.data?.message || "Invalid OTP");
                      }
                    }} className="bg-blue-500 text-white px-4 py-2 rounded font-bold hover:bg-blue-600">
                      Verify Pickup
                    </button>
                  )}
                  {order.deliveryStatus === 'picked_up' && (
                    <button onClick={async () => {
                      const otp = prompt("Enter 6-digit Delivery OTP provided by User:");
                      if (!otp) return;
                      try {
                        await deliveryService.verifyDelivery(order.id, otp.trim());
                        fetchDashboardData();
                      } catch (e) {
                         alert(e.response?.data?.message || "Invalid OTP");
                      }
                    }} className="bg-green-500 text-white px-4 py-2 rounded font-bold hover:bg-green-600">
                      Verify Delivery
                    </button>
                  )}
                  {order.deliveryStatus === 'delivered' && (
                    <span className="text-green-600 font-bold"><CheckCircle className="inline w-5 h-5 mr-1" />Delivered</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
