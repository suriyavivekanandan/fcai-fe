import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import UserService from '../service/auth.service';

function OtpVerification() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  // Extract email from query parameters
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email || !otp) {
      setError('Email and verification code are required');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const response = await UserService.verifyOtp({ email, otp });
      setMessage(response.message); // Assuming the API returns a message
      setTimeout(() => {
        localStorage.removeItem('signupEmail');
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    try {
      // Call the resend OTP API (you may need to implement this in UserService)
      await UserService.resendOtp({ email });
      setMessage('Verification code resent! Please check your inbox and spam folder.');
      setCooldown(60);
    } catch (error) {
      setError(error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Cooldown timer for resend OTP
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center">
            <KeyRound className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Verify your email</h2>
        <p className="mt-2 text-center text-sm text-gray-600">We've sent a verification code to your email.</p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && <div className="mb-4 text-red-700">{error}</div>}
          {message && <div className="mb-4 text-green-700">{message}</div>}
          <form className="space-y-6" onSubmit={handleVerify}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter 6-digit code"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2 bg-green-600 text-white rounded">
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
          <button onClick={handleResendOtp} disabled={cooldown > 0 || loading} className="mt-4 w-full py-2 bg-gray-300 rounded">
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OtpVerification;