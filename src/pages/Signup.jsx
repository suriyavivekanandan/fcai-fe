import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import UserService from '../service/auth.service';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !password || !confirmPassword || !name) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Send email as part of the registration data
      const response = await UserService.register({ 
        firstName: name, 
        email, 
        password 
      });
      setMessage(response.message); // Assuming the API returns a message

      // Navigate to the verification page with email as a search parameter
      setTimeout(() => {
        navigate(`/otp-verification?email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or <Link to="/login" className="font-medium text-green-600 hover:text-green-500">sign in</Link>
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && <div className="mb-4 text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded">{error}</div>}
          {message && <div className="mb-4 text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded">{message}</div>}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded" required />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded" required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded" required />
            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border rounded" required />
            <button type="submit" disabled={loading} className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700">{loading ? 'Processing...' : 'Continue'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;