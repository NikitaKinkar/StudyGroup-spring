import { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function ForgotPasswordForm({ onBack, onResetSuccess }) {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: email verification, 2: password reset
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate email verification (in real app, this would send OTP to email)
    setTimeout(() => {
      // Check if email exists in localStorage
      const users = JSON.parse(localStorage.getItem("studyconnect_users") || "[]");
      const userExists = users.some(u => u.email === email);
      
      if (!userExists) {
        alert("No account found with this email address.");
        setLoading(false);
        return;
      }
      
      setStep(2);
      setLoading(false);
    }, 1000);
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      setLoading(false);
      return;
    }
    
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long!");
      setLoading(false);
      return;
    }
    
    // Update password in localStorage
    const users = JSON.parse(localStorage.getItem("studyconnect_users") || "[]");
    const updatedUsers = users.map(u => 
      u.email === email ? { ...u, password_hash: newPassword } : u
    );
    localStorage.setItem("studyconnect_users", JSON.stringify(updatedUsers));
    
    setTimeout(() => {
      setLoading(false);
      onResetSuccess();
    }, 1000);
  };

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Sign In
      </button>

      <h2 className="text-2xl font-bold text-gray-900 mb-5">
        {step === 1 ? "Forgot Password" : "Reset Password"}
      </h2>

      {step === 1 ? (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Enter your email address and we'll help you reset your password.
          </p>
          
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          />
          
          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-medium py-2 rounded transition"
          >
            {loading ? "Verifying..." : "Continue"}
          </button>
        </form>
      ) : (
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Enter your new password below for {email}
          </p>
          
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:border-orange-400"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:border-orange-400"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          <button
            type="submit"
            disabled={loading || !newPassword || !confirmPassword}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-medium py-2 rounded transition"
          >
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>
      )}
      
      {step === 2 && (
        <button
          onClick={() => setStep(1)}
          className="w-full text-center text-sm text-gray-600 hover:text-gray-900 mt-3 transition"
        >
          Use different email
        </button>
      )}
    </div>
  );
}
