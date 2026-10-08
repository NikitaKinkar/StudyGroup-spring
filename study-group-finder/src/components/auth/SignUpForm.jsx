import { useState } from "react";
import { Eye, EyeOff, User, Mail, Lock, GraduationCap, Calendar, Award, ArrowRight } from "lucide-react";

export default function SignUpForm({ onSignUp, onSwitch }) {
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirm_password: "", university: "", passing_year: "", passing_gpa: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      alert("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSignUp(form);
    } finally {
      setIsSubmitting(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Student Account</h2>
        <p className="text-xs text-slate-500 mt-1">Join StudyConnect to collaborate with college peers.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Full Name & Email Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              placeholder="Full Name"
              value={form.name}
              onChange={set("name")}
              required
              className="w-full bg-slate-50/80 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 font-medium"
            />
          </div>

          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="Student Email"
              value={form.email}
              onChange={set("email")}
              required
              className="w-full bg-slate-50/80 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Passwords Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={set("password")}
              required
              className="w-full bg-slate-50/80 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={form.confirm_password}
              onChange={set("confirm_password")}
              required
              className="w-full bg-slate-50/80 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 font-medium"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* University Info */}
        <div className="relative">
          <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            placeholder="College / University Name"
            value={form.university}
            onChange={set("university")}
            className="w-full bg-slate-50/80 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 font-medium"
          />
        </div>

        {/* Passing Year & GPA Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              placeholder="Graduation Year (e.g. 2026)"
              value={form.passing_year}
              onChange={set("passing_year")}
              className="w-full bg-slate-50/80 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 font-medium"
            />
          </div>

          <div className="relative">
            <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Current GPA / CGPA"
              value={form.passing_gpa}
              onChange={set("passing_gpa")}
              className="w-full bg-slate-50/80 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 rounded-xl shadow-md shadow-orange-500/25 tracking-wide text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70"
        >
          <span>{isSubmitting ? "Creating Account..." : "Join StudyConnect"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <p className="text-xs text-slate-500 mt-4 text-center">
        Already have an account?{" "}
        <button onClick={onSwitch} className="font-bold text-orange-600 hover:underline">
          Sign In
        </button>
      </p>
    </div>
  );
}