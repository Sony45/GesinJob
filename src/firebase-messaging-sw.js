importScripts('https://www.gstatic.com/firebasejs/7.24.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.24.0/firebase-messaging.js');
 
firebase.initializeApp({
    apiKey: 'AIzaSyDCRdqs327dHMVdUiBmIppVZDx1OjxvysI',
    authDomain: 'orange-eaad6.firebaseapp.com',
    databaseURL: 'https://orange-eaad6.firebaseio.com',
    projectId: 'orange-eaad6',
    storageBucket: 'orange-eaad6.appspot.com',
    messagingSenderId: '1045181441184',
    appId: '1:1045181441184:web:6495ff95130d0a779495c5'
    // , measurementId: 'G-L69NY7ZQM4'
});
 
const messaging = firebase.messaging();