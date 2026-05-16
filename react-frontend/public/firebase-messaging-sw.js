importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            'AIzaSyByRAc0_v82LHcPJU19SuWWjrt8etZTlww',
  authDomain:        'campusverse-43fc6.firebaseapp.com',
  projectId:         'campusverse-43fc6',
  storageBucket:     'campusverse-43fc6.firebasestorage.app',
  messagingSenderId: '202496667588',
  appId:             '1:202496667588:web:9e85de3ae19aaf26047e91',
});

const messaging = firebase.messaging();

// Handle background push messages
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || 'CampusFlow', {
    body: body || '',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    data: payload.data,
  });
});
