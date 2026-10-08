import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";

export default function SignInForm({ onSignIn, onSwitch, onForgotPassword }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSignIn({ email, password });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to Your Account</h2>
        <p className="text-xs text-slate-500 mt-1">Enter your student credentials to access your study groups.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Student Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="e.g. student@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-50/80 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Password
            </label>
            <button 
              type="button" 
              onClick={onForgotPassword}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-50/80 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 rounded-xl shadow-md shadow-orange-500/25 tracking-wide text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 cursor-pointer"
        >
          <span>{isSubmitting ? "Signing In..." : "Sign In to Hub"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* 1-Click Quick Demo Login */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              onSignIn({ email: "dineshmatti707@gmail.com", password: "password123" });
            }}
            className="w-full py-2.5 px-4 rounded-xl border border-dashed border-orange-300 bg-orange-50/60 hover:bg-orange-100/70 text-orange-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>Quick Demo Sign In (1-Click)</span>
          </button>
        </div>
      </form>

      <p className="text-xs text-slate-500 mt-6 text-center">
        Don't have an account yet?{" "}
        <button onClick={onSwitch} className="font-bold text-orange-600 hover:underline">
          Create Account
        </button>
      </p>
    </div>
  );
}