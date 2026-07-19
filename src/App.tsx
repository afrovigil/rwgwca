import { useState, useEffect, useCallback } from "react";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import RecommendationList from "./components/RecommendationList";
import RecommendationForm from "./components/RecommendationForm";
import EmailOutbox from "./components/EmailOutbox";
import { Recommendation, User, EmailLog } from "./types";
import { AlertCircle } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("rwg_token"));
  const [currentTab, setCurrentTab] = useState<string>("dashboard");

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [recommendationToEdit, setRecommendationToEdit] = useState<Recommendation | null>(null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  // 1. Fetching logic
  const fetchData = useCallback(async (activeToken: string) => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const headers = { "x-token": activeToken };

      const [recsRes, emailsRes, usersRes] = await Promise.all([
        fetch("/api/recommendations", { headers }),
        fetch("/api/emails", { headers }),
        fetch("/api/users", { headers }),
      ]);

      if (!recsRes.ok || !emailsRes.ok || !usersRes.ok) {
        throw new Error("Failed to fetch secure data from Express API.");
      }

      const [recsData, emailsData, usersData] = await Promise.all([
        recsRes.json(),
        emailsRes.json(),
        usersRes.json(),
      ]);

      setRecommendations(recsData);
      setEmails(emailsData);
      setUsers(usersData);
    } catch (err: any) {
      setSyncError(err.message || "Data sync failed.");
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // 2. Auth Session verification on mount
  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem("rwg_token");
      if (savedToken) {
        try {
          const response = await fetch("/api/auth/me", {
            headers: { "x-token": savedToken },
          });
          if (response.ok) {
            const data = await response.json();
            setCurrentUser(data.user);
            setToken(savedToken);
            await fetchData(savedToken);
          } else {
            // Token expired or invalid
            localStorage.removeItem("rwg_token");
            setToken(null);
          }
        } catch (err) {
          console.error("Session verification failed", err);
          localStorage.removeItem("rwg_token");
          setToken(null);
        }
      }
      setCheckingSession(false);
    };

    verifySession();
  }, [fetchData]);

  // Periodic poll sync (every 10 seconds) to ensure real-time synchronization between multiple users!
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      fetchData(token);
    }, 10000);

    return () => clearInterval(interval);
  }, [token, fetchData]);

  const handleLoginSuccess = async (user: User, authToken: string) => {
    localStorage.setItem("rwg_token", authToken);
    setCurrentUser(user);
    setToken(authToken);
    await fetchData(authToken);
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "x-token": token },
        });
      } catch (err) {
        console.error(err);
      }
    }
    localStorage.removeItem("rwg_token");
    setCurrentUser(null);
    setToken(null);
    setRecommendations([]);
    setEmails([]);
    setUsers([]);
    setCurrentTab("dashboard");
  };

  const handleTriggerManualSync = async () => {
    if (token) {
      await fetchData(token);
    }
  };

  // 3. Core Database Operations (wrapped in token validation)
  const handleAddMilestone = async (recId: string, title: string) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/recommendations/${recId}/milestones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-token": token,
        },
        body: JSON.stringify({ title }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to add milestone");
      }
      await fetchData(token);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleMilestone = async (recId: string, msId: string, achieved: boolean) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/recommendations/${recId}/milestones/${msId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-token": token,
        },
        body: JSON.stringify({ achieved }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to toggle milestone");
      }
      await fetchData(token);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteMilestone = async (recId: string, msId: string) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/recommendations/${recId}/milestones/${msId}`, {
        method: "DELETE",
        headers: { "x-token": token },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to delete milestone");
      }
      await fetchData(token);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveRecommendation = async (payload: any) => {
    if (!token) return;
    const url = recommendationToEdit
      ? `/api/recommendations/${recommendationToEdit.id}`
      : "/api/recommendations";
    const method = recommendationToEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-token": token,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Failed to save recommendation");
    }

    await fetchData(token);
  };

  const handleDeleteRecommendation = async (recId: string) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/recommendations/${recId}`, {
        method: "DELETE",
        headers: { "x-token": token },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to delete recommendation");
      }
      await fetchData(token);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleTriggerEmailScan = async () => {
    if (!token) return 0;
    try {
      const response = await fetch("/api/emails/trigger", {
        method: "POST",
        headers: { "x-token": token },
      });
      if (!response.ok) {
        throw new Error("Failed to scan upcoming deadlines.");
      }
      const data = await response.json();
      await fetchData(token);
      return data.count || 0;
    } catch (err) {
      console.error(err);
      return 0;
    }
  };

  const handleTriggerIndividualEmail = async (recId: string) => {
    if (!token) return false;
    try {
      const response = await fetch(`/api/recommendations/${recId}/remind`, {
        method: "POST",
        headers: { "x-token": token },
      });
      if (!response.ok) {
        throw new Error("Failed to trigger individual alert.");
      }
      await fetchData(token);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleOpenEditRecommendation = (rec: Recommendation) => {
    setRecommendationToEdit(rec);
    setIsCreateModalOpen(true);
  };

  const handleOpenCreateRecommendation = () => {
    setRecommendationToEdit(null);
    setIsCreateModalOpen(true);
  };

  // 4. Loading state
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-xs font-bold tracking-widest text-slate-500 font-mono uppercase">RWG Portal Loading...</p>
      </div>
    );
  }

  // Not logged in -> show custom Login form
  if (!currentUser || !token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Render sidebar layout
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans selection:bg-blue-100">
      {/* 1. Dark Sidebar / Top header */}
      <Navbar
        user={currentUser}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onLogout={handleLogout}
        isSyncing={isSyncing}
        onTriggerSync={handleTriggerManualSync}
      />

      {/* 2. Right Side Main Content pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sub-Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3 sm:gap-4">
            <h2 className="text-sm sm:text-base font-bold text-slate-800 tracking-wider uppercase font-mono">
              {currentTab === "dashboard" && "Dashboard Analytics"}
              {currentTab === "recommendations" && "Recommendations Registry"}
              {currentTab === "emails" && "Outbox & Reminders"}
            </h2>
            <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded border border-green-200 uppercase flex items-center gap-1 font-mono">
              <span className={`w-1.5 h-1.5 rounded-full bg-green-500 ${isSyncing ? "animate-pulse" : ""}`}></span>
              Live Sync
            </span>
          </div>

          <div className="flex items-center gap-3">
            {currentTab === "recommendations" && currentUser.role === "admin" && (
              <button
                id="header-btn-create-rec"
                onClick={handleOpenCreateRecommendation}
                className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                + New Recommendation
              </button>
            )}
            {currentTab === "dashboard" && currentUser.role === "admin" && (
              <button
                id="header-btn-trigger-scan"
                onClick={handleTriggerEmailScan}
                className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Scan Deadlines
              </button>
            )}
          </div>
        </header>

        {/* Syncing and Connection Error Banner */}
        {syncError && (
          <div className="bg-rose-600 text-white px-4 py-2 text-xs flex items-center gap-2 justify-center font-semibold font-mono animate-fade-in shadow-md">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>REAL-TIME COMPLIANCE SERVER DISCONNECTED: {syncError}</span>
            <button
              onClick={() => fetchData(token)}
              className="underline ml-4 bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded transition"
            >
              Reconnect
            </button>
          </div>
        )}

        {/* Scrollable View Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          {currentTab === "dashboard" && (
            <Dashboard
              recommendations={recommendations}
              emails={emails}
              onTriggerReminders={handleTriggerEmailScan}
              onTriggerIndividualReminder={handleTriggerIndividualEmail}
              userRole={currentUser.role}
            />
          )}

          {currentTab === "recommendations" && (
            <RecommendationList
              recommendations={recommendations}
              users={users}
              currentUser={currentUser}
              onAddMilestone={handleAddMilestone}
              onToggleMilestone={handleToggleMilestone}
              onDeleteMilestone={handleDeleteMilestone}
              onEditRecommendation={handleOpenEditRecommendation}
              onDeleteRecommendation={handleDeleteRecommendation}
              onOpenCreateModal={handleOpenCreateRecommendation}
            />
          )}

          {currentTab === "emails" && (
            <EmailOutbox emails={emails} onTriggerReminders={handleTriggerEmailScan} />
          )}
        </main>
      </div>

      {/* Modal Dialog Form for Recommendation Admin Controls */}
      <RecommendationForm
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setRecommendationToEdit(null);
        }}
        onSave={handleSaveRecommendation}
        recommendationToEdit={recommendationToEdit}
        users={users}
      />
    </div>
  );
}
