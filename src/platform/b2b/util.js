class B2bConfiguration {
    constructor() {        
        this.config = require('config');
        this.frontendId = 3;
        this.gci = 1078;
        this.cartApiUrl = `https://cartapi.systemb2b.pl/api`;
        //this.b2bApiUrl = 'http://b2bapi-eu.i-shark.net/api';
        this.b2bApiUrl = 'https://b2bapieu.planetb2b.com/api';
    }
}

module.exports = B2bConfiguration