const https = require('https');

const urls = [
  'https://raw.githubusercontent.com/52North/52North.github.io/master/images/52n-logo.png',
  'https://aflplus.plus/assets/images/logo.png',
  'https://raw.githubusercontent.com/3DTK/3DTK/master/doc/logo3dtk.png'
];

urls.forEach(url => {
  https.get(url, (res) => {
    console.log(`${res.statusCode} - ${url}`);
  }).on('error', (e) => {
    console.error(e);
  });
});
