import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { auth, db, registerAuthErrorHandler } from "../lib/firebase";

export interface UserAccessData {
  trialStart: number | null; // Timestamp ms
  subscriptionEnd: number | null; // Timestamp ms
  plan: 'free' | '1mo' | '3mo' | '6mo' | '12mo' | null;
  isValid: boolean;
  daysRemaining: number;
  maxUsers: number;
  activeSessionId?: string | null;
}

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  isOnline: boolean;
  authError: any | null;
  clearAuthError: () => void;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (val: boolean) => void;
  accessData: UserAccessData | null;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  loading: true,
  isOnline: true,
  authError: null,
  clearAuthError: () => {},
  isAuthModalOpen: false,
  setAuthModalOpen: () => {},
  accessData: null,
});

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [dbUserProfile, setDbUserProfile] = useState<{ displayName?: string, photoURL?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [authError, setAuthError] = useState<any | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [accessData, setAccessData] = useState<UserAccessData | null>(null);

  const clearAuthError = () => setAuthError(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Register error handler to catch popup and redirect failures
    registerAuthErrorHandler((error: any) => {
      console.warn("Caught authentication error in Provider:", error);
      setAuthError(error);
    });

    let unsubscribeFirestore: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
        unsubscribeFirestore = null;
      }

      if (u) {
        // Listen to Firestore changes in real-time
        const userRef = doc(db, "users", u.uid);
        unsubscribeFirestore = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setDbUserProfile({
              displayName: data.displayName,
              photoURL: data.photoURL
            });

            const tStart = data.trialStart || null;
            const subEnd = data.subscriptionEnd || null;
            const planType = data.plan || "free";
            const allowedUsers = data.maxUsers || 1;
            const now = Date.now();
            const msPerDay = 1000 * 60 * 60 * 24;

            let isValid = false;
            let daysRemaining = 0;

            if (u.email === "eltygere8651@gmail.com") {
              isValid = true;
              daysRemaining = 999;
            } else if (subEnd && subEnd > now) {
              isValid = true;
              daysRemaining = Math.max(0, Math.ceil((subEnd - now) / msPerDay));
            } else if (planType === "free" && tStart) {
              const trialEnd = tStart + 7 * msPerDay;
              if (trialEnd > now) {
                isValid = true;
                daysRemaining = Math.max(0, Math.ceil((trialEnd - now) / msPerDay));
              }
            }

            setAccessData({
              trialStart: tStart,
              subscriptionEnd: subEnd,
              plan: planType,
              isValid,
              daysRemaining,
              maxUsers: allowedUsers,
              activeSessionId: data.activeSessionId || null
            });
          }
        }, (err) => {
          console.error("Firestore onSnapshot error:", err);
        });

        const syncProfile = async (retryCount = 0) => {
          try {
            const userRef = doc(db, "users", u.uid);
            const userSnap = await getDoc(userRef);
            
            if (!userSnap.exists()) {
              // Create user doc without trial
              const defaultAvatar = u.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(u.displayName || u.email || u.uid)}`;
              await setDoc(userRef, {
                email: u.email || "anonymous",
                displayName: u.displayName || "Usuario",
                photoURL: defaultAvatar,
                lastLogin: serverTimestamp(),
                trialStart: null,
                plan: "none",
                maxUsers: 1
              });
            } else {
              // Update last login
              await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
            }
          } catch (e) {
            console.error("Profile sync attempt failed", e);
            if (retryCount < 2) {
              setTimeout(() => syncProfile(retryCount + 1), 2000);
            }
          }
        };
        syncProfile();
      } else {
        setAccessData(null);
        setDbUserProfile(null);
      }
      setUser(u);
      setLoading(false);
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      unsubscribe();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, []);

  const mergedUser = useMemo(() => {
    if (!user) return null;
    const u = Object.create(user);
    if (dbUserProfile?.displayName) {
      Object.defineProperty(u, "displayName", {
        value: dbUserProfile.displayName,
        writable: true,
        configurable: true,
        enumerable: true
      });
    }
    if (dbUserProfile?.photoURL) {
      Object.defineProperty(u, "photoURL", {
        value: dbUserProfile.photoURL,
        writable: true,
        configurable: true,
        enumerable: true
      });
    }
    return u as User;
  }, [user, dbUserProfile]);

  return (
    <FirebaseContext.Provider value={{ user: mergedUser, loading, isOnline, authError, clearAuthError, isAuthModalOpen, setAuthModalOpen, accessData }}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Error handler utility from skill
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
