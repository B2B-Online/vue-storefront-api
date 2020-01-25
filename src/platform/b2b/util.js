class B2bConfiguration {
    constructor() {
        this.config = require('config');
        this.gci = 1078
        this.cartApiUrl = `https://cartapi.systemb2b.pl/api/get_or_create_cart/gci/${this.gci}`
    }
}