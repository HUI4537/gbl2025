 // Scripts for firebase and firebase messaging
 importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
 importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");

 // Initialize the Firebase app in the service worker by passing the generated config

 const firebaseConfig = {
	apiKey: "AIzaSyB06ZvqghKGdL1SKXcSpS6dmOlMkGQI9Mk",
	authDomain:"gbl2023.firebaseapp.com",
	databaseURL: "https://gbl2023-default-rtdb.firebaseio.com",
	projectId: "gbl2023",
	storageBucket: "gbl2023.appspot.com",
	messagingSenderId: "150648494906",
	appId: "1:150648494906:web:78c00036f883cd18318e03",
};


 firebase.initializeApp(firebaseConfig);

 // Retrieve firebase messaging
 const messaging = firebase.messaging();

 messaging.onBackgroundMessage(function(payload) {
   console.log("Received background message ", payload);

   const notificationTitle = payload.notification.title;
   const notificationOptions = {
     body: payload.notification.body,
   };

   self.registration.showNotification(notificationTitle, notificationOptions);
 });