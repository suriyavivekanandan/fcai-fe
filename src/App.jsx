import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import PasswordReset from './pages/PasswordReset';
import OtpVerification from './pages/OtpVerification';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import InitialWeightEntry from './pages/InitialEntry';
import RemainingWeightEntry from './pages/RemainingEntry';
import DataPage from './pages/DataView';
import FoodAnalysis from './pages/FoodAnalysis';
import BookingEntry from './pages/Bookings';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/password-reset" element={<PasswordReset />} />
        <Route path="/otp-verification" element={<OtpVerification />} />
        <Route path="/initial-entry" element={<InitialWeightEntry />} />
        <Route path="/remaining-entry" element={<RemainingWeightEntry />} />
        <Route path="/data-view" element={<DataPage />} />
        <Route path="/food-analysis" element={<FoodAnalysis />} />
        <Route path="/bookings" element={<BookingEntry />} />
        <Route path="*" element={<Signup />} /> {/* Default Route */}
      </Routes>
    </Router>
  );
}

export default App;
