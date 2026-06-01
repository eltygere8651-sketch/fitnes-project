import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, registerAuthErrorHandler } from "../lib/firebase";

export interface UserAccessData {
  trialStart: number | null; // Timestamp ms
  subscriptionEnd: number | null; // Timestamp ms
  plan: 'free' | '1mo' | '3mo' | '6mo' | '12mo' | null;
  isValid: boolean;
  daysRemaining: number;
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

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const syncProfile = async (retryCount = 0) => {
          try {
            const userRef = doc(db, "users", u.uid);
            const userSnap = await getDoc(userRef);
            
            let tStart: number | null = null;
            let subEnd: number | null = null;
            let planType: any = null;
            
            const now = Date.now();
            
            if (!userSnap.exists()) {
              // Create user doc without trial
              await setDoc(userRef, {
                email: u.email || "anonymous",
                displayName: u.displayName || "Usuario",
                photoURL: u.photoURL,
                lastLogin: serverTimestamp(),
                trialStart: null,
                plan: "none"
              });
              tStart = null;
              planType = "none";
            } else {
              const data = userSnap.data();
              // Update last login
              await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
              
              tStart = data.trialStart || null;
              subEnd = data.subscriptionEnd || null;
              planType = data.plan || "free";
            }
            
            let isValid = false;
            let daysRemaining = 0;
            const msPerDay = 1000 * 60 * 60 * 24;
            
            // Si es admin nunca caduca o si es master (si su email coincide)
            if (u.email === "eltygere8651@gmail.com") {
               isValid = true;
               daysRemaining = 999;
            } else if (subEnd && subEnd > now) {
               // Plan activo
               isValid = true;
               daysRemaining = Math.max(0, Math.ceil((subEnd - now) / msPerDay));
            } else if (planType === "free" && tStart) {
               // Evaluar Trial (7 días)
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
              daysRemaining
            });

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
      }
      setUser(u);
      setLoading(false);
    });
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      unsubscribe();
    };
  }, []);

  return (
    <FirebaseContext.Provider value={{ user, loading, isOnline, authError, clearAuthError, isAuthModalOpen, setAuthModalOpen, accessData }}>
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
