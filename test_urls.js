const https = require('https');

https.get('https://sacred-texts.com/tarot/pkt/img/ar00.jpg', (res) => {
  console.log('ar00.jpg status:', res.statusCode);
}).on('error', (e) => {
  console.error(e);
});

https.get('https://sacred-texts.com/tarot/pkt/img/cu01.jpg', (res) => {
  console.log('cu01.jpg status:', res.statusCode);
}).on('error', (e) => {
  console.error(e);
});
