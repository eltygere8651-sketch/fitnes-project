import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  signOut, 
  getRedirectResult, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Custom global error storage/callback to let UI know about redirect/popup errors
type AuthErrorCallback = (err: any) => void;
let onAuthErrorCallback: AuthErrorCallback | null = null;

export const registerAuthErrorHandler = (callback: AuthErrorCallback) => {
  onAuthErrorCallback = callback;
};

export const loginWithGoogle = async () => {
  try {
    // 1. Try signInWithPopup first (extremely compatible with standalone mobile browsers, safari, etc.)
    await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    console.warn("Popup authentication failed, trying redirect fallback:", error);
    if (onAuthErrorCallback) {
      onAuthErrorCallback(error);
    }
    
    // Only try redirect if it's not a domain unauthorized error, because redirect will also fail
    if (error?.code !== "auth/unauthorized-domain") {
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (redirectError: any) {
        console.error("Redirect login selection failed:", redirectError);
        if (onAuthErrorCallback) {
          onAuthErrorCallback(redirectError);
        }
      }
    }
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  } catch (error: any) {
    console.error("Email login failed:", error);
    if (onAuthErrorCallback) {
      onAuthErrorCallback(error);
    }
    throw error;
  }
};

export const signupWithEmail = async (email: string, pass: string, nickname?: string) => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const defaultAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(nickname || email || cred.user.uid)}`;
    await updateProfile(cred.user, { 
      displayName: nickname || "Usuario", 
      photoURL: defaultAvatar 
    });
    return cred.user;
  } catch (error: any) {
    console.error("Email registration failed:", error);
    if (onAuthErrorCallback) {
      onAuthErrorCallback(error);
    }
    throw error;
  }
};

export const logout = () => signOut(auth);
export { signInAnonymously };

// Handle redirect result on load
getRedirectResult(auth)
  .then((result) => {
    if (result) {
      console.log("Redirect sign-in successful style", result.user.email);
    }
  })
  .catch((error) => {
    console.error("Redirect error on load:", error);
    if (onAuthErrorCallback) {
      onAuthErrorCallback(error);
    }
  });

