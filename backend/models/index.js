import User from "./userModel.js";
import Shop from "./shopModel.js";
import Service from "./serviceModel.js";
import Order from "./orderModel.js";
import Feedback from "./feedbackModel.js";
import Discount from "./discountModel.js";
import DeliveryPerson from "./deliveryPersonModel.js";

// Define Associations

// 1. User (Shop Admin) -> Shop (1:1)
User.hasOne(Shop, { foreignKey: "adminId", as: "shop" });
Shop.belongsTo(User, { foreignKey: "adminId", as: "admin" });

// 2. Shop -> Service (1:N)
Shop.hasMany(Service, { foreignKey: "shopId", as: "services", onDelete: "CASCADE" });
Service.belongsTo(Shop, { foreignKey: "shopId", as: "shop" });

// 3. User -> Order (1:N)
User.hasMany(Order, { foreignKey: "userId", as: "orders" });
Order.belongsTo(User, { foreignKey: "userId", as: "user" });

// 4. Shop -> Order (1:N)
Shop.hasMany(Order, { foreignKey: "shopId", as: "orders" });
Order.belongsTo(Shop, { foreignKey: "shopId", as: "shop" });

// 5. Service -> Order (1:N)
Service.hasMany(Order, { foreignKey: "serviceId", as: "orders" });
Order.belongsTo(Service, { foreignKey: "serviceId", as: "service" });

// 6. Shop -> Feedback (1:N)
Shop.hasMany(Feedback, { foreignKey: "shopId", as: "feedbacks", onDelete: "CASCADE" });
Feedback.belongsTo(Shop, { foreignKey: "shopId", as: "shop" });

// 7. User -> Feedback (1:N)
User.hasMany(Feedback, { foreignKey: "userId", as: "feedbacks", onDelete: "CASCADE" });
Feedback.belongsTo(User, { foreignKey: "userId", as: "user" });

// 8. Service -> Discount (1:N)
Service.hasMany(Discount, { foreignKey: "serviceId", as: "discounts", onDelete: "CASCADE" });
Discount.belongsTo(Service, { foreignKey: "serviceId", as: "service" });

// 9. Shop -> Discount (1:N)
Shop.hasMany(Discount, { foreignKey: "shopId", as: "discounts", onDelete: "CASCADE" });
Discount.belongsTo(Shop, { foreignKey: "shopId", as: "shop" });

// 10. Order -> Feedback (1:1)
Order.hasOne(Feedback, { foreignKey: "orderId", as: "feedback", onDelete: "CASCADE" });
Feedback.belongsTo(Order, { foreignKey: "orderId", as: "order" });

// 11. User -> DeliveryPerson (1:1)
User.hasOne(DeliveryPerson, { foreignKey: "userId", as: "deliveryProfile" });
DeliveryPerson.belongsTo(User, { foreignKey: "userId", as: "user" });

// 12. DeliveryPerson -> Order (1:N)
User.hasMany(Order, { foreignKey: "deliveryPersonId", as: "deliveryOrders" });
Order.belongsTo(User, { foreignKey: "deliveryPersonId", as: "deliveryPerson" });

export { User, Shop, Service, Order, Feedback, Discount, DeliveryPerson };
