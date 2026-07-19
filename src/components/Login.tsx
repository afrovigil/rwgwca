import React, { useState } from "react";
import { Shield, Lock, Mail, User, UserPlus, KeyRound, CheckCircle } from "lucide-react";

interface LoginProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"assignee" | "auditor" | "admin">("assignee");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const url = isRegister ? "/api/auth/register" : "/api/auth/login";
    const payload = isRegister ? { name, email, password, role } : { email, password };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || "Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail: string, quickPass: string) => {
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: quickEmail, password: quickPass }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || "Quick login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-screen" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto w-full max-w-md">
        <div className="flex justify-center select-none">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-10 h-10 object-contain rounded"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.classList.remove("hidden");
            }}
          />
          <div className="h-10 w-10 bg-slate-900 border border-slate-850 flex items-center justify-center text-white font-bold text-lg rounded shadow-sm hidden">
            R
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900 font-display uppercase">
          RWG Compliance Monitor
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500 font-mono tracking-widest uppercase">
          Recommendation Working Group Portal
        </p>
      </div>

      <div className="mt-6 sm:mx-auto w-full max-w-md">
        <div className="bg-white py-8 px-6 border border-slate-200 shadow-sm rounded sm:px-10">
          <div className="flex border-b border-slate-200 mb-6 pb-2">
            <button
              id="tab-signin"
              onClick={() => {
                setIsRegister(false);
                setError("");
              }}
              className={`w-1/2 text-center pb-2 font-bold text-xs uppercase tracking-wider transition-colors duration-200 cursor-pointer ${
                !isRegister
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Sign In
            </button>
            <button
              id="tab-signup"
              onClick={() => {
                setIsRegister(true);
                setError("");
              }}
              className={`w-1/2 text-center pb-2 font-bold text-xs uppercase tracking-wider transition-colors duration-200 cursor-pointer ${
                isRegister
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div id="login-error-alert" className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded flex items-start gap-2 animate-fade-in font-mono">
                <span className="font-bold">ERROR:</span> {error}
              </div>
            )}

            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Full Name</label>
                <div className="relative rounded shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold text-slate-700"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Email Address</label>
              <div className="relative rounded shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold text-slate-700"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Password</label>
              <div className="relative rounded shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold text-slate-700"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isRegister && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">System Role</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    id="role-assignee"
                    type="button"
                    onClick={() => setRole("assignee")}
                    className={`py-2 px-3 text-[10px] font-bold uppercase tracking-wider border rounded transition-all text-center cursor-pointer ${
                      role === "assignee"
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Assignee
                  </button>
                  <button
                    id="role-auditor"
                    type="button"
                    onClick={() => setRole("auditor")}
                    className={`py-2 px-3 text-[10px] font-bold uppercase tracking-wider border rounded transition-all text-center cursor-pointer ${
                      role === "auditor"
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Auditor
                  </button>
                  <button
                    id="role-admin"
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`py-2 px-3 text-[10px] font-bold uppercase tracking-wider border rounded transition-all text-center cursor-pointer ${
                      role === "admin"
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Admin
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  {role === "assignee" && "Can track assigned tasks and check off milestones."}
                  {role === "auditor" && "Read-only access to inspect status lists and notifications."}
                  {role === "admin" && "Full administrative control to create actions, edit details, and trigger alerts."}
                </p>
              </div>
            )}

            <button
              id="btn-auth-submit"
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded shadow-sm text-xs font-bold uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-1 font-mono text-[10px]">
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  PROCESSING...
                </span>
              ) : isRegister ? (
                <span className="flex items-center gap-1.5"><UserPlus className="h-4 w-4" /> Create Account</span>
              ) : (
                <span className="flex items-center gap-1.5"><KeyRound className="h-4 w-4" /> Sign In</span>
              )}
            </button>
          </form>

          {/* Quick Demo Logins block */}
          {!isRegister && (
            <div className="mt-6">
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-mono">
                  <span className="bg-white px-2 text-slate-400 font-bold">Quick Access</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  id="btn-quick-admin"
                  type="button"
                  onClick={() => handleQuickLogin("admin@rwg.com", "admin")}
                  className="p-2.5 border border-slate-200 rounded text-left bg-slate-50 hover:bg-slate-100 transition-all text-xs flex flex-col justify-between cursor-pointer"
                >
                  <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                    <Shield className="h-3 w-3 text-blue-600" /> Administrator
                  </span>
                  <span className="text-slate-400 mt-0.5 font-mono text-[9px]">admin@rwg.com</span>
                </button>

                <button
                  id="btn-quick-assignee"
                  type="button"
                  onClick={() => handleQuickLogin("assignee@rwg.com", "assignee")}
                  className="p-2.5 border border-slate-200 rounded text-left bg-slate-50 hover:bg-slate-100 transition-all text-xs flex flex-col justify-between cursor-pointer"
                >
                  <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                    <CheckCircle className="h-3 w-3 text-emerald-500" /> Assignee (Sarah)
                  </span>
                  <span className="text-slate-400 mt-0.5 font-mono text-[9px]">assignee@rwg.com</span>
                </button>

                <button
                  id="btn-quick-dev"
                  type="button"
                  onClick={() => handleQuickLogin("dev@rwg.com", "dev")}
                  className="p-2.5 border border-slate-200 rounded text-left bg-slate-50 hover:bg-slate-100 transition-all text-xs flex flex-col justify-between cursor-pointer"
                >
                  <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                    <CheckCircle className="h-3 w-3 text-emerald-500" /> Assignee (John)
                  </span>
                  <span className="text-slate-400 mt-0.5 font-mono text-[9px]">dev@rwg.com</span>
                </button>

                <button
                  id="btn-quick-auditor"
                  type="button"
                  onClick={() => handleQuickLogin("auditor@rwg.com", "auditor")}
                  className="p-2.5 border border-slate-200 rounded text-left bg-slate-50 hover:bg-slate-100 transition-all text-xs flex flex-col justify-between cursor-pointer"
                >
                  <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                    <User className="h-3 w-3 text-amber-500" /> Auditor (James)
                  </span>
                  <span className="text-slate-400 mt-0.5 font-mono text-[9px]">auditor@rwg.com</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
