importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyD9xCT9U1z6tGRAMEz9kS-glyfaPewEouQ",
  authDomain: "maplesearch-cee92.firebaseapp.com",
  projectId: "maplesearch-cee92",
  storageBucket: "maplesearch-cee92.firebasestorage.app",
  messagingSenderId: "82569881003",
  appId: "1:82569881003:web:623e3c08a80b4a15b89eee",
  measurementId: "G-WSZNYBV1E2"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] 收到背景推播: ', payload);
  
  if (payload.notification) {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/icons/icon.svg'
    };
  
    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});
