import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Terminal, Lock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("admin_token", data.token);
        navigate("/admin-dashboard");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 left-4 flex items-center gap-2 opacity-50">
        <Terminal className="w-5 h-5" />
        <span className="text-sm">SYSTEM_AUTH_GATEWAY_v1.0</span>
      </div>

      <Card className="w-full max-w-md border-green-500/30 bg-black/80 backdrop-blur shadow-[0_0_15px_rgba(0,255,0,0.1)]">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-500/10 rounded-full border border-green-500/20">
              <Lock className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <CardTitle className="text-2xl tracking-widest text-green-500">ROOT ACCESS</CardTitle>
          <CardDescription className="text-green-500/60 uppercase text-xs">
            Authenticate to proceed
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded text-sm">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="root@system.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/50 border-green-500/30 text-green-500 placeholder:text-green-500/30 focus:border-green-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/50 border-green-500/30 text-green-500 placeholder:text-green-500/30 focus:border-green-500"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full bg-green-500 text-black hover:bg-green-400 font-bold tracking-widest uppercase transition-all"
              disabled={loading}
            >
              {loading ? "AUTHENTICATING..." : "INITIATE LOGIN"}
            </Button>
            <div className="text-center">
              <button 
                type="button" 
                className="text-xs text-green-500/50 hover:text-green-500 underline underline-offset-4"
                onClick={() => alert("Simulated reset. Check backend logs if connected to reset endpoint.")}
              >
                EMERGENCY OVERRIDE (RESET)
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
      
      <div className="fixed bottom-4 text-center text-green-500/30 text-xs w-full">
        WARNING: UNAUTHORIZED ACCESS IS STRICTLY PROHIBITED.
      </div>
    </div>
  );
}
