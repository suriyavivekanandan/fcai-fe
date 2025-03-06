import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';

function OtpVerification() {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem('signupEmail');
    
    if (location.state && location.state.email) {
      setEmail(location.state.email);
      setMessage('Verification code has been sent. Please check your inbox and spam folder.');
    } else if (storedEmail) {
      setEmail(storedEmail);
      setMessage('Please enter the verification code sent to your email.');
    } else {
      navigate('/signup');
    }

    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [location, navigate, cooldown]);

  const handleVerify = (e) => {
    e.preventDefault();
    if (!email || !otp) {
      setError('Email and verification code are required');
      return;
    }
    setLoading(true);
    setError('');
    setTimeout(() => {
      setMessage('Account verified successfully! Redirecting to login...');
      localStorage.removeItem('signupEmail');
      setTimeout(() => navigate('/login'), 2000);
      setLoading(false);
    }, 1500);
  };

  const handleResendOtp = () => {
    if (cooldown > 0) return;
    setLoading(true);
    setTimeout(() => {
      setMessage('Verification code resent! Please check your inbox and spam folder.');
      setCooldown(60);
      setLoading(false);
    }, 1000);
  };

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
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" value={email} readOnly className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Verification Code</label>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Enter 6-digit code" />
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
