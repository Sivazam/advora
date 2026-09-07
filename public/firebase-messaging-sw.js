// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCgC4k_5gTKrIrGFyo_O8alDLZU5vaWITI",
  authDomain: "advoraservices-c3d9e.firebaseapp.com",
  projectId: "advoraservices-c3d9e",
  storageBucket: "advoraservices-c3d9e.firebasestorage.app",
  messagingSenderId: "929782893992",
  appId: "1:929782893992:web:c6b041b1b9910dd028619d"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message: ', payload);
  const notificationTitle = payload.notification.title || 'Advora Tax Services';
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/navLogo.webp',
    data: {
      url: payload.data ? payload.data.link : '/portal'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/portal';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (new URL(client.url).origin === self.location.origin && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(urlToOpen);
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
