import { useState, useRef } from "react";

export default function ProfileEdit({ user, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    full_name: user.full_name || "",
    email: user.email || "",
    university: user.university || "",
    passing_year: user.passing_year || "",
    passing_gpa: user.passing_gpa || "",
    profile_image_url: user.profile_image_url || ""
  });
  const [preview, setPreview] = useState(user.profile_image_url || "");
  const fileInputRef = useRef(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        setPreview(result);
        setFormData(prev => ({ ...prev, profile_image_url: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleDeletePhoto = () => {
    setPreview("");
    setFormData(prev => ({ ...prev, profile_image_url: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Photo */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                {preview ? (
                  <img 
                    src={preview} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-4xl">
                      {formData.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {preview && (
                  <button
                    type="button"
                    onClick={handleDeletePhoto}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="mt-4 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Fixed)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  University Name
                </label>
                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) => handleChange("university", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400"
                  placeholder="Enter your university"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passing Year
                </label>
                <input
                  type="text"
                  value={formData.passing_year}
                  onChange={(e) => handleChange("passing_year", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400"
                  placeholder="e.g., 2024"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passing GPA
                </label>
                <input
                  type="text"
                  value={formData.passing_gpa}
                  onChange={(e) => handleChange("passing_gpa", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400"
                  placeholder="e.g., 3.8"
                  step="0.1"
                  min="0"
                  max="4"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
