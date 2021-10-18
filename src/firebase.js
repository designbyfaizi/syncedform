import firebase from "firebase/app";
import "firebase/firestore";

const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyBdUeJ6xRElL7x0M5zjpuvRM091Rzbt_kA",
    authDomain: "syncedform.firebaseapp.com",
    projectId: "syncedform",
    storageBucket: "syncedform.appspot.com",
    messagingSenderId: "10639229190",
    appId: "1:10639229190:web:04841fcf2d65b47eb19e87",
    measurementId: "G-149Z16BZ0P",
});

const db = firebaseApp.firestore();

export { db };
