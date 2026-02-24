const fs = require('fs');
fetch('https://cgec.org.in/1_cgec_cse_.php')
  .then(res => res.text())
  .then(html => fs.writeFileSync('cse.html', html));