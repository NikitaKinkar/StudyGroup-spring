import { CheckCircle, X } from "lucide-react";

export default function PasswordResetSuccessModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Password Updated Successfully!
          </h3>
          
          <p className="text-gray-600 mb-6">
            Your password has been updated successfully. You can now sign in with your new password.
          </p>
          
          <button
            onClick={onClose}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg transition"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
