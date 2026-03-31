import { useLocation, useNavigate } from "react-router-dom";
import { ShieldAlert, AlertTriangle, ArrowLeft } from "lucide-react";
import { useEffect } from "react";

const Awareness = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { username, password } = (location.state as { username: string; password: string }) || {
    username: "",
    password: "",
  };

  // Show the actual password on the awareness page
  const displayPassword = password || "(empty)";

  // Clear sessionStorage immediately after displaying
  useEffect(() => {
    sessionStorage.removeItem("phish_uid");
    sessionStorage.removeItem("phish_pwd");
  }, []);

  return (
    <div className="min-h-screen bg-destructive/10 flex flex-col items-center justify-start pt-10 px-6">
      <div className="w-full max-w-lg mx-auto">
        {/* Warning Header */}
        <div className="text-center mb-6">
          <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-destructive">⚠️ Phishing Awareness Alert</h1>
          <p className="text-destructive/80 mt-2 text-sm">This is a phishing simulation for educational purposes only.</p>
        </div>

        {/* Captured Credentials Display */}
        <div className="bg-background border-2 border-destructive/60 rounded-lg p-5 mb-6 shadow-md">
          <h2 className="text-lg font-semibold text-destructive flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5" />
            What you just entered:
          </h2>
          <div className="space-y-3">
            <div className="bg-destructive/10 rounded p-3">
              <span className="text-xs text-destructive font-medium uppercase">User ID</span>
              <p className="text-lg font-mono text-foreground break-all">{username || "(empty)"}</p>
            </div>
            <div className="bg-destructive/10 rounded p-3">
              <span className="text-xs text-destructive font-medium uppercase">Password</span>
              <p className="text-lg font-mono text-foreground break-all">{displayPassword}</p>
            </div>
          </div>
        </div>

        {/* Education Section */}
        <div className="bg-background border border-border rounded-lg p-5 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-foreground">🔍 How Phishing Works</h2>

          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">You were just phished!</strong> This fake login page looked exactly like the real 
              My-GITAM portal. If this were a real attack, a hacker would now have your username and password.
            </p>

            <h3 className="font-semibold text-foreground pt-1">Common phishing tactics:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Creating <strong>identical-looking</strong> copies of login pages</li>
              <li>Sending fake emails with <strong>urgent messages</strong> like "Your account will be locked"</li>
              <li>Using similar domain names (e.g., <code className="bg-muted px-1 rounded">gitam-login.com</code> instead of <code className="bg-muted px-1 rounded">gitam.edu</code>)</li>
              <li>Exploiting trust — you expect the page to be real, so you don't check the URL</li>
            </ul>

            <h3 className="font-semibold text-foreground pt-1">How to protect yourself:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Always check the URL</strong> before entering credentials</li>
              <li>Look for <strong>https://</strong> and the correct domain name</li>
              <li>Never click login links from <strong>unknown emails or messages</strong></li>
              <li>Enable <strong>two-factor authentication (2FA)</strong> wherever possible</li>
              <li>Use a <strong>password manager</strong> — it won't autofill on fake sites</li>
            </ul>

            <div className="bg-accent/30 border border-accent rounded p-3 mt-3">
              <p className="text-accent-foreground font-medium text-xs">
                🛡️ No data was stored or sent anywhere. This page exists solely to educate you about phishing risks. 
                Stay alert and stay safe!
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back to login page
          </button>
        </div>
      </div>
    </div>
  );
};

export default Awareness;
