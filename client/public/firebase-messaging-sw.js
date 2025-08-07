importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts(
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js'
);

// Replace these with your own Firebase config keys...
const firebaseConfig = {
  apiKey: 'AIzaSyCgrqLZqv2MgNANhNrLZqi1WdGVNEz-Ai8',
  authDomain: 'minhchi-firebase-project.firebaseapp.com',
  databaseURL: 'https://minhchi-firebase-project-default-rtdb.firebaseio.com',
  projectId: 'minhchi-firebase-project',
  storageBucket: 'minhchi-firebase-project.appspot.com',
  messagingSenderId: '1015743910654',
  appId: '1:1015743910654:web:d3d914057e3d010dcb0baf',
  measurementId: 'G-Y97FXHCHGX'
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/app-logo.png',
    data: payload?.data
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const data = event?.notification?.data;
  const launchUrl = data?.launchUrl || '/';
  event.waitUntil(clients.openWindow(launchUrl));
});
