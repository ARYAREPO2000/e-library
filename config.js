// Import the functions you need from the SDKs you need
import firebase from "firebase"
require("firebase/firestore")
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAjBknvY-RxqWYaasbnAGhfhtbAR680M8A",
  authDomain: "e-library-665e8.firebaseapp.com",
  projectId: "e-library-665e8",
  storageBucket: "e-library-665e8.appspot.com",
  messagingSenderId: "441194419489",
  appId: "1:441194419489:web:9d949d7f118370462b9a60"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig)
//const db = getFireStore(app)
export default firebase.firestore();