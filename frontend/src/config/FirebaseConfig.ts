import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const config = {
    apiKey: `${import.meta.env.VITE_FIREBASE_API_KEY}`,
    authDomain: "learning-authentication-19cd1.firebaseapp.com",
    projectId: "learning-authentication-19cd1",
    storageBucket: "learning-authentication-19cd1.firebasestorage.app",
    messagingSenderId: "997665986442",
    appId: "1:997665986442:web:d7704f67b45731dd8f1a73"
}

const app = initializeApp(config)

export const auth = getAuth(app)