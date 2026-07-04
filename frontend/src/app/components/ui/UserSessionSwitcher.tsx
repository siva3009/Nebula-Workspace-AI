import React, { useEffect, useState } from "react";
import { Users, ChevronDown, Check } from "lucide-react";
import { fetchUsers, loginSimulatedUser } from "../../services/chatService";

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: string;
  avatar?: string; // tone color gradient
  name?: string;
  title?: string;
}

interface Props {
  onUserChange?: (user: UserProfile) => void;
}

export function UserSessionSwitcher({ onUserChange }: Props) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const directory = await fetchUsers();
        setUsers(directory);
        
        // Retrieve session or default
        const saved = localStorage.getItem("nebula_current_user");
        let active: UserProfile | null = null;
        if (saved) {
          try {
            active = JSON.parse(saved);
            // Verify it exists in directory
            const exists = directory.find((u) => u.id === active?.id);
            if (!exists) active = null;
          } catch (_) {
            active = null;
          }
        }
        
        if (!active && directory.length > 0) {
          // Default to Alex Stratos
          active = directory.find((u) => u.username === "alex") || directory[0];
        }

        if (active) {
          setActiveUser(active);
          localStorage.setItem("nebula_current_user", JSON.stringify(active));
          
          // Perform login to populate sessionStorage with JWT
          try {
            const loginRes = await loginSimulatedUser(active.username);
            if (onUserChange) onUserChange(loginRes.user);
          } catch (loginErr) {
            console.error("Failed to perform default simulated user login", loginErr);
          }
        }
      } catch (err) {
        console.error("Failed to load user directory for switcher", err);
      }
    };

    loadUsers();

    // Listen to storage events from other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "nebula_current_user" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setActiveUser(parsed);
          if (onUserChange) onUserChange(parsed);
        } catch (_) {}
      }
    };
    
    // Listen to 401 unauthorized session expiry
    const handleUnauthorized = async () => {
      sessionStorage.removeItem("nebula_access_token");
      setOpen(true); // Redirect user to UserSessionSwitcher visually
      
      const saved = localStorage.getItem("nebula_current_user");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Trigger simulated login flow
          const loginRes = await loginSimulatedUser(parsed.username);
          setActiveUser(loginRes.user);
          localStorage.setItem("nebula_current_user", JSON.stringify(loginRes.user));
          if (onUserChange) onUserChange(loginRes.user);
          setTimeout(() => setOpen(false), 800);
        } catch (e) {
          console.error("Simulated re-login retry failed", e);
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("nebula-auth-unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("nebula-auth-unauthorized", handleUnauthorized);
    };
  }, [onUserChange]);

  const selectUser = async (user: UserProfile) => {
    try {
      const loginRes = await loginSimulatedUser(user.username);
      setActiveUser(loginRes.user);
      localStorage.setItem("nebula_current_user", JSON.stringify(loginRes.user));
      setOpen(false);
      if (onUserChange) onUserChange(loginRes.user);
    } catch (err) {
      console.error("Failed simulated user login selection", err);
    }
  };

  if (!activeUser) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="group flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-1.5 transition hover:bg-white/[0.05]"
        title="Switch simulated user session"
      >
        <div className={`grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br ${activeUser.avatar || "from-violet-500 to-sky-400"} text-[9px] text-[#0A0A0B] font-semibold shrink-0`}>
          {activeUser.name?.split(" ").map((n) => n[0]).join("") || activeUser.username.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex flex-col items-start leading-none">
          <span className="text-[11.5px] font-medium text-white/90">{activeUser.name}</span>
          <span className="text-[9px] text-white/40 mt-0.5">{activeUser.title}</span>
        </div>
        <ChevronDown className="h-3 w-3 text-white/45 transition group-hover:text-white/70" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 z-50 w-56 origin-top-right rounded-xl border border-white/[0.08] bg-[#0C0C0E]/95 p-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md">
            <div className="px-2.5 py-1.5 text-[9px] tracking-wider text-white/40 uppercase">
              Simulate User Session
            </div>
            <div className="space-y-0.5 mt-1">
              {users.map((u) => {
                const active = u.id === activeUser.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => selectUser(u)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12.5px] transition ${
                      active ? "bg-white/[0.05] text-white" : "text-white/60 hover:bg-white/[0.03] hover:text-white"
                    }`}
                  >
                    <div className={`grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br ${u.avatar || "from-violet-500 to-sky-400"} text-[10px] text-[#0A0A0B] font-semibold`}>
                      {u.name?.split(" ").map((n) => n[0]).join("") || u.username.slice(0,2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{u.name}</div>
                      <div className="truncate text-[10px] text-white/35 mt-0.5">{u.title}</div>
                    </div>
                    {active && <Check className="h-3.5 w-3.5 text-sky-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Global utility helper to retrieve active user from localStorage safely
export function getSimulatedUser(): UserProfile | null {
  const saved = localStorage.getItem("nebula_current_user");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (_) {}
  }
  return null;
}
