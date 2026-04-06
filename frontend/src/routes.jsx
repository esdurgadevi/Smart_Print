// import { Navigate } from "react-router-dom";
// import { isAuthenticated, getUserRole } from "./utils/auth.js";

// // Layouts
// import AdminLayout from "./layouts/AdminLayout";
// import StudentLayout from "./layouts/StudentLayout";

// // Auth Pages
// import Login from "./pages/auth/Login";
// import Register from "./pages/auth/Register";
// import ForgotPassword from "./pages/auth/ForgotPassword";
// import ResetPassword from "./pages/auth/ResetPassword";

// // Admin Pages
// import AdminDashboard from './pages/admin/Dashboard';
// import StudentDashboard from './pages/student/Dashboard.jsx';
// // NotFound
// import NotFound from "./pages/NotFound";


// // ProtectedRoute
// const ProtectedRoute = ({ children, role }) => {
//   if (!isAuthenticated()) {
//     return <Navigate to="/login" replace />;
//   }

//   if (role && getUserRole() !== role.toLowerCase()) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };

// const routes = [
//   { path: "/", element: <Navigate to="/login" replace /> },
//   { path: "/login", element: <Login /> },
//   { path: "/register", element: <Register /> },
//   { path: "/forgot-password", element: <ForgotPassword /> },
//   { path: "/reset-password/:token", element: <ResetPassword /> },
//   {
//     path: "/admin",
//     element: (
//       <ProtectedRoute role="admin">
//         <AdminLayout />
//       </ProtectedRoute>
//     ),
//     children: [
//       { index: true, element: <AdminDashboard /> },
//       { path: 'dashboard', element: <AdminDashboard /> },
//     ],
//   },
//   {
//     path: "/student",
//     element: (
//       <ProtectedRoute role="student">
//         <StudentLayout />
//       </ProtectedRoute>
//     ),
//     children: [
//       { index: true, element: <StudentDashboard /> },
//       { path: 'dashboard', element: <StudentDashboard /> },
//     ],
//   },
//   { path: "*", element: <NotFound /> },
// ];

// export default routes;
