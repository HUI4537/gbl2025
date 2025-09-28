 // Scripts for firebase and firebase messaging
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");

const firebaseConfig = {
  apiKey: "AIzaSyAUTzercEsSaUvFQmTIgZi1Oi3ZQ7VHKD8",
  authDomain: "gbl2025-fcc16.firebaseapp.com",
  databaseURL: "https://gbl2025-fcc16-default-rtdb.firebaseio.com",
  projectId: "gbl2025-fcc16",
  storageBucket: "gbl2025-fcc16.appspot.com",
  messagingSenderId: "659066419342",
  appId: "1:659066419342:web:b615e38e021c8d2da5b1df"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log("Received background message ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});