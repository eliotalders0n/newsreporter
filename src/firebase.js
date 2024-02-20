import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZ8hosDbUffyNm_7uzacxuljOpK0TOmWQ",
  authDomain: "zanis-app.firebaseapp.com",
  projectId: "zanis-app",
  storageBucket: "zanis-app.appspot.com",
  messagingSenderId: "141780524287",
  appId: "1:141780524287:web:466f9f1e060fc89fb1c0ca",
  measurementId: "G-60M6Q5K8JK"
};
firebase.initializeApp(firebaseConfig);
export default firebase;