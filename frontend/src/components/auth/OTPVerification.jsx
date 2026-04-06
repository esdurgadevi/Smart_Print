import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import authService from "../../services/authService";

const OTPVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [timer, setTimer] = useState(60);
  const email = location.state?.email || "";

  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  useEffect(() => {
    let interval;
    if (resendDisabled && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setResendDisabled(false);
      setTimer(60);
    }
    return () => clearInterval(interval);
  }, [resendDisabled, timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await authService.verifyOTP({ email, otp });
      navigate("/login", { state: { message: "Registration successful! Please login." } });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendDisabled(true);
    try {
      await authService.register({ email });
      setError("");
    } catch (err) {
      setError("Failed to resend OTP");
      setResendDisabled(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">Verify OTP</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a 6-digit verification code to <br />
            <span className="font-semibold">{email}</span>
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full px-3 py-2 text-center text-2xl tracking-wider border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="000000"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendDisabled}
              className="text-sm text-orange-600 hover:text-orange-700 disabled:text-gray-400"
            >
              {resendDisabled ? `Resend OTP in ${timer}s` : "Resend OTP"}
            </button>
            <Link to="/register" className="text-sm text-gray-500 hover:text-gray-700 ml-4">
              Back
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OTPVerification;