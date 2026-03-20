<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBnkYvFxEiy9RZXvbPvqV2pk5quGmEV3YQ",
    authDomain: "schoolconnect-ai-nigeria.firebaseapp.com",
    projectId: "schoolconnect-ai-nigeria",
    storageBucket: "schoolconnect-ai-nigeria.firebasestorage.app",
    messagingSenderId: "35165386800",
    appId: "1:35165386800:web:7ad4ff92b6100f9b1795f5",
    measurementId: "G-N3JR7PKZ8S"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>
