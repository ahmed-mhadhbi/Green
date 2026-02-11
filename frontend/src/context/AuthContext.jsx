import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth";
import { auth } from "../firebase";
import { apiRequest } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [token, setToken] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (!user) {
        setToken(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      const freshToken = await user.getIdToken();
      setToken(freshToken);

      try {
        const data = await apiRequest("/auth/me", { token: freshToken });
        setProfile(data.profile);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async ({ name, email, password, role }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) await updateProfile(cred.user, { displayName: name });
    const freshToken = await cred.user.getIdToken();
    const response = await apiRequest("/auth/register-profile", {
      method: "POST",
      token: freshToken,
      body: { name, role }
    });
    setProfile(response.profile);
  };

  const refreshProfile = async () => {
    if (!auth.currentUser) return;
    const freshToken = await auth.currentUser.getIdToken(true);
    setToken(freshToken);
    const data = await apiRequest("/auth/me", { token: freshToken });
    setProfile(data.profile);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = useMemo(() => ({
    firebaseUser,
    token,
    profile,
    loading,
    login,
    register,
    logout,
    refreshProfile
  }), [firebaseUser, token, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
