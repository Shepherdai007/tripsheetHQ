importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDFXRuGqQ8qmUIe08G8xJh_xcv_vRQDE-U",
  authDomain: "tripsheethq.firebaseapp.com",
  projectId: "tripsheethq",
  storageBucket: "tripsheethq.firebasestorage.app",
  messagingSenderId: "470095071606",
  appId: "1:470095071606:web:c76fc911e0cba7c628d257",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || "TripsheetHQ", {
    body: body || "You have a new message.",
    icon: "/android-chrome-192x192.png",
    badge: "/favicon-32x32.png",
  });
});