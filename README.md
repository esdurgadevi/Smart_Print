# SmartPrint: Real-Time Multi-Vendor Management System

## Objective

The objective of this project is to develop a real-time multi-vendor print shop marketplace that connects students and customers with multiple print shops through a unified digital platform. The system enables users to compare nearby shops based on pricing, queue status, location, and ratings, place print orders with pickup or delivery options, and track order progress in real time. It also provides shop administrators with tools for inventory management, dynamic discount creation, and sales analytics.

---

## Drawbacks in Existing System

Existing print and xerox management practices in colleges and local communities face several limitations:

- Students must physically visit print shops to place orders.
- Long waiting queues waste valuable time during peak academic periods.
- No centralized platform to compare multiple vendors.
- Lack of real-time queue tracking and order status updates.
- No integrated inventory tracking for paper, spirals, and covers.
- Shop owners rely on manual record-keeping.
- Difficulty in predicting demand and managing stock effectively.
- Limited visibility into revenue trends and service performance.
- No automated notifications or delivery coordination.

---

## My Solution Overview

SmartPrint is a Multi-Vendor Print & Xerox Management System that provides a centralized platform for customers, print shops, delivery personnel, and administrators.

### Key Features

- Multi-vendor registration and management
- Real-time shop discovery based on location
- Queue status and estimated waiting time
- Online document upload and order placement
- Automated cost calculation
- Inventory tracking and stock synchronization
- Dynamic discounts and promotional offers
- Delivery assignment with OTP verification
- Customer profile and order history
- Vendor analytics dashboard
- Super Admin control panel

### Modules

- Auth Module
- Shop Admin Module
- Inventory Module
- User Module
- Services Module
- Discount Module
- Super Admin Module
- Feedback Module
- Order Module
- Delivery Module

### Technology Stack

- **Frontend:** React.js, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **ORM:** Sequelize
- **Authentication:** JWT, Bcrypt.js
- **File Processing:** pdf-lib
- **Notifications:** Nodemailer
- **HTTP Client:** Axios

---

## Screenshots

### Shop Profile Management
<img width="745" height="599" alt="image" src="https://github.com/user-attachments/assets/ef08b25a-2025-4eb8-bcbd-f58777974b0e" />

Allows vendors to configure shop details, operating hours, and contact information.

### Order Queue & Management
<img width="839" height="560" alt="image" src="https://github.com/user-attachments/assets/ca274d4f-739b-49b7-a04e-d15d046ec1f2" />

Displays incoming print jobs with status-based filtering and document download options.

### Service Catalog & Stock Linking
<img width="731" height="670" alt="image" src="https://github.com/user-attachments/assets/c51578a4-b08f-456e-b429-a8ca998f309f" />

Enables vendors to define services and link them with inventory items.

### Inventory Tracking System
<img width="772" height="284" alt="image" src="https://github.com/user-attachments/assets/fc2d6d11-a92e-4bb6-ac0d-98d6a8657673" />

Monitors stock levels and alerts vendors when inventory is low.

### Vendor Analytics Dashboard
<img width="878" height="404" alt="image" src="https://github.com/user-attachments/assets/669257c1-1986-43a2-a7e7-1f461539c630" />


Provides revenue trends, order statistics, and service popularity charts.

### Dynamic Discount & Promotion Engine
<img width="877" height="376" alt="image" src="https://github.com/user-attachments/assets/8b2e7c37-e093-4b67-b50e-3b176ec54e9f" />


Allows vendors to create custom discounts and promotional campaigns.

### Storefront Discovery & Ordering
<img width="785" height="661" alt="image" src="https://github.com/user-attachments/assets/be21cf44-82ab-4426-9acb-c0a104f830da" />


Lets customers browse nearby shops and place customized print orders.

### Customer Profile & Order History
<img width="910" height="582" alt="image" src="https://github.com/user-attachments/assets/386081da-35c6-4073-899a-b1852531a509" />


Shows personal information and complete order history.

### Optimized Digital Cart
<img width="899" height="408" alt="image" src="https://github.com/user-attachments/assets/afd114d5-38c8-4540-9dc6-5f8b268f1073" />


Supports multiple print jobs with automatic total calculation and discounts.

### Delivery Logistics Interface
<img width="869" height="344" alt="image" src="https://github.com/user-attachments/assets/05b3be37-2e6c-479e-a757-93905973bc66" />


Used by delivery personnel for order pickup and delivery verification.

### Super Admin Control Panel
<img width="829" height="615" alt="image" src="https://github.com/user-attachments/assets/8cf2f28b-f96e-40ed-8769-3b5aab3c2fd5" />


Provides centralized control over shops, users, and platform-wide monitoring.

---

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/smartprint.git
cd smartprint
```

### 2. Setup Backend

```bash
cd backend
npm install
```

### 3. Create .env file

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=smartprint
JWT_SECRET=your_secret_key
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

### 4. Start Backend Server

```bash
npm start
```

### 5. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```
### 6. Open the Application in 

```bash
http://localhost:5173
```

## Conclusion

SmartPrint transforms traditional print shop operations into a streamlined digital ecosystem by integrating real-time order management, inventory tracking, delivery coordination, and analytics. The platform improves customer convenience while helping vendors optimize their business operations.
