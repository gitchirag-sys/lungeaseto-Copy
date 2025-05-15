// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDeP7e1DqW3J47e2YycHjSjE9qdB9ckDCE",
  authDomain: "lungease-95adf.firebaseapp.com",
  projectId: "lungease-95adf",
  storageBucket: "lungease-95adf.firebasestorage.app",
  messagingSenderId: "512496706749",
  appId: "1:512496706749:web:1265ae55fe900c6d7f83d4",
  measurementId: "G-H3MTTRSFYH"
};

const app = initializeApp(firebaseConfig);

// Optional: Only initialize analytics if in browser environment
if (typeof window !== "undefined") {
  getAnalytics(app);
}

export const auth = getAuth(app);