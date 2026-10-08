import { CheckCircle } from "lucide-react";

export default function SuccessModal({ type, name, onOk }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl px-10 py-10 flex flex-col items-center min-w-[320px]">
        <CheckCircle className="w-16 h-16 text-green-400 mb-4" strokeWidth={1.5} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {type === "register" ? "Registration Successful!" : "Welcome Back!"}
        </h2>
        <p className="text-gray-500 mb-6">
          {type === "register"
            ? `Welcome to the platform, ${name}`
            : `Welcome back, ${name}`}
        </p>
        <button
          onClick={onOk}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-2 rounded transition"
        >
          {type === "register" ? "OK" : "Go to Dashboard"}
        </button>
      </div>
    </div>
  );
}