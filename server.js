'use strict';

let express = require('express'),
    app     = express();

app.use(express.static('public'));

//
// Run Server
//

let port = 80;

try {
    let config = require('./config.json');
    port = config.port;
} catch (e) {
    console.log('No config.json file found ... OK', e);
}

app.listen(port);
console.log( `Node server running at port ${port}, static files located in ./public directory`);

require('fs').writeFileSync( './.killLastInstance', `kill ${process.pid}` );
