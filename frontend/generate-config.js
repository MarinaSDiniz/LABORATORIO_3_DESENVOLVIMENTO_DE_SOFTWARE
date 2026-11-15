const fs = require('fs');
const url = process.env.API_BASE_URL || '';
fs.writeFileSync('js/config.js', 'window.APP_CONFIG = ' + JSON.stringify({ API_BASE_URL: url }) + ';\n');
console.log('config.js gerado, API_BASE_URL=' + url);
