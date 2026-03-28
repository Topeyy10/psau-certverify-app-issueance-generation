"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { getLoggedInUser } from "@/aactions/auth";
import type { User, UserRole } from "@/types";

type UserContextType = {
  user: User;
  role: UserRole;
  setRole: (r: UserRole) => void;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  role: null,
  setRole: (_: UserRole) => {},
  refreshUser: async () => {},
});

interface UserProviderProps {
  initialUser: User;
  children: React.ReactNode;
}

const extractRoleFromUser = (user: User): UserRole => {
  if (!user) return null;

  const labels = Array.isArray(user.labels) ? user.labels : [];
  if (labels.length === 0) return "user";

  if (labels.includes("admin")) return "admin";
  if (labels.includes("issuer")) return "issuer";
  if (labels.includes("user")) return "user";

  return "user";
};

export function UserProvider({ initialUser, children }: UserProviderProps) {
  const [user, setUser] = useState<User>(initialUser);
  const [role, setRole] = useState<UserRole>(extractRoleFromUser(initialUser));

  const refreshUser = async (): Promise<void> => {
    try {
      const updatedUser = await getLoggedInUser();
      setUser(updatedUser);
      setRole(extractRoleFromUser(updatedUser));
    } catch (error) {
      console.error("Failed to refresh user:", error);
      setUser(null);
      setRole(null);
    }
  };

  useEffect(() => {
    setRole(extractRoleFromUser(user));
  }, [user]);

  return (
    <UserContext.Provider
      value={{
        user,
        role,
        setRole,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
