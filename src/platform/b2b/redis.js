import rp from 'request-promise-native';
class RedisCache {
    
    constructor () {    
        this.config = require('config');
        this.redis = require('redis');
        let rc = this.redis.createClient(this.config.redis);
        rc.on('error', function (err) {
          rc = this.redis.createClient(this.config.redis);
        });
  
        if (this.config.redis.auth) {
          rc.auth(this.config.redis.auth);
        }
        this.redisClient = rc;
    }

    cacheCartId (sessionId, cartId) {        
        this.redisClient.set("cart_" + cartId, JSON.stringify({
          session: sessionId,
          created_at: new Date(),
        }));
    }

    cacheProductId (sku, id) {
        this.redisClient.set("product_" + sku, JSON.stringify({
          item_id: id,
          created_at: new Date(),
        }));
    }

    cacheBasket(cartId, cartItems) {
      this.redisClient.set("basket_" + cartId, JSON.stringify({
        items: cartItems,
        created_at: new Date(),
      }));
    }

    cachePaymentMethods(gci, methods) {
      this.redisClient.set("payment_methods_" + gci, JSON.stringify({
        items: methods,
        created_at: new Date(),
      }));
    }

    hasBasketItem(cartId, itemId, successCallback, errorCallback) {
      const key = "basket_" + cartId;
      this.redisClient.get(key, (err, value) => {
        if(value) {
          const obj = JSON.parse(value);
          const result = obj.items.filter(item => item.item_id === itemId).length > 0;
          successCallback(result);
        } else {
          errorCallback(err);
        }
      });
    }

    hasPaymentMethods(gci, successCallback, errorCallback) {
      const key = "payment_methods_" + gci;
      this.redisClient.get(key, (err, value) => {
        if(value) {
          const obj = JSON.parse(value);
          const result = obj.items.length > 0;
          successCallback(result);
        } else {
          successCallback(false);
        }
      });
    }

    findSession(cartId, successCallback, errorCallback) {
        const key = "cart_" + cartId;
        this.redisClient.get(key, (err, value) => {
          if(value) {
            successCallback(value);
          } else {
            errorCallback(err);
          }
        });
      }

      findProductId(sku, successCallback, errorCallback) {
        const key = "sku_" + sku;
        this.redisClient.get(key, (err, value) => {
          if(value) {
            successCallback(value);
          } else {                                          
              const options = {
                  uri: 'https://b2bapieu.planetb2b.com/api/product/symbol/'+sku+'/?cache=false&format=json&frontend_id=3&gci=1078',
                  headers: {
                      'User-Agent': 'Request-Promise'
                  },
                  json: true
              };
              rp(options).then(function (repos) {
                successCallback(repos[0].pk);
              }).catch(function (err) {
                console.error('Error during call: b2bapieu.planetb2b.com/api/product/symbol/', err);
                
              });
          }
        });
      }

      getPaymentMethods(gci, successCallback, errorCallback) {
        const key = "payment_methods_" + gci;
        this.redisClient.get(key, (err, value) => {
          if(value) {
            successCallback(value);
          } else {
            errorCallback(err);
          }
        });
      }

      findSessionWrapper(cartId) {
        const that = this;
        return new Promise((resolve, reject) => {
          that.findSession(cartId, (successResponse) => {
              resolve(successResponse);
            }, (errorResponse) => {
              reject(errorResponse)
            });
        });
     }

     findProductIdWrapper(sku) {
        const that = this;
        return new Promise((resolve, reject) => {
          that.findProductId(sku, (successResponse) => {
              resolve(successResponse);
            }, (errorResponse) => {
              reject(errorResponse)
            });
        });
     }

    hasBasketItemWrapper(cartId, itemId) {
      const that = this;
      return new Promise((resolve, reject) => {
        that.hasBasketItem(cartId, itemId, (successResponse) => {
            resolve(successResponse);
          }, (errorResponse) => {
            reject(errorResponse)
          });
      });
   }
   
   hasPaymentMethodsWrapper(gci) {
    const that = this;
    return new Promise((resolve, reject) => {
      that.hasPaymentMethods(gci, (successResponse) => {
          resolve(successResponse);
        }, (errorResponse) => {
          reject(errorResponse)
        });
    });
  }

  getPaymentMethodsWrapper(gci) {
    const that = this;
    return new Promise((resolve, reject) => {
      that.getPaymentMethods(gci, (successResponse) => {
          resolve(successResponse);
        }, (errorResponse) => {
          reject(errorResponse)
        });
    });
  }
  
}
module.exports = RedisCache;