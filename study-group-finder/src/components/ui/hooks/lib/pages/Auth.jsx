import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import SignInForm from "../components/auth/SignInForm";
import SignUpForm from "../components/auth/SignUpForm";
import SuccessModal from "../components/auth/SuccessModal";

export default function Auth() {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [successModal, setSuccessModal] = useState(null); // { type: "register"|"login", name }

  const handleSignUp = async ({ name, email, password, university, passing_year }) => {
    // Check if email already exists
    const existing = await base44.entities.UserProfile.filter({ email });
    if (existing && existing.length > 0) {
      alert("An account with this email already exists.");
      return;
    }
    await base44.entities.UserProfile.create({
      full_name: name,
      email,
      password_hash: password,
      university,
      passing_year,
    });
    setSuccessModal({ type: "register", name });
  };

  const handleSignIn = async ({ email, password }) => {
    const users = await base44.entities.UserProfile.filter({ email });
    if (!users || users.length === 0) {
      alert("No account found with this email.");
      return;
    }
    const user = users[0];
    if (user.password_hash !== password) {
      alert("Incorrect password.");
      return;
    }
    localStorage.setItem("studyconnect_user", JSON.stringify(user));
    setSuccessModal({ type: "login", name: user.full_name });
  };

  const handleSuccessOk = () => {
    if (successModal?.type === "register") {
      setSuccessModal(null);
      setMode("signin");
    } else {
      window.location.href = createPageUrl("Dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex w-[820px] max-w-full min-h-[480px]">
        {/* Left panel - image side */}
        <div
          className="hidden md:flex flex-col justify-between w-[45%] relative"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/30 rounded-l-2xl" />
          <div className="relative z-10 p-8 flex-1 flex flex-col justify-between">
            {mode === "signin" ? (
              <>
                <div />
                <div>
                  <h2 className="text-white text-2xl font-bold leading-tight mb-6">
                    Pull Up a Chair,<br />Join Us!
                  </h2>
                  <button
                    onClick={() => setMode("signup")}
                    className="border-2 border-white text-white px-8 py-2 rounded-full font-bold tracking-widest hover:bg-white hover:text-gray-800 transition"
                  >
                    SIGN UP
                  </button>
                </div>
              </>
            ) : (
              <>
                <div />
                <div>
                  <h2 className="text-white text-2xl font-bold leading-tight mb-6">
                    Welcome Back<br />Your Seat Is Waiting!
                  </h2>
                  <button
                    onClick={() => setMode("signin")}
                    className="border-2 border-white text-white px-8 py-2 rounded-full font-bold tracking-widest hover:bg-white hover:text-gray-800 transition"
                  >
                    SIGN IN
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right panel - form side */}
        <div className="flex-1 flex flex-col justify-center px-10 py-10">
          {mode === "signin" ? (
            <SignInForm onSignIn={handleSignIn} onSwitch={() => setMode("signup")} />
          ) : (
            <SignUpForm onSignUp={handleSignUp} onSwitch={() => setMode("signin")} />
          )}
        </div>
      </div>

      {successModal && (
        <SuccessModal
          type={successModal.type}
          name={successModal.name}
          onOk={handleSuccessOk}
        />
      )}
    </div>
  );
}