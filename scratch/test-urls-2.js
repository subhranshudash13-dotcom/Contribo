const https = require('https');

const urls = [
  'https://logo.clearbit.com/52north.org',
  'https://logo.clearbit.com/aflplus.plus',
  'https://github.com/52North.png',
  'https://github.com/AFLplusplus.png',
  'https://github.com/3DTK.png'
];

urls.forEach(url => {
  https.get(url, (res) => {
    console.log(`${res.statusCode} - ${url}`);
  }).on('error', (e) => {
    console.error(e);
  });
});
