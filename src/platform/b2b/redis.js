import rp from 'request-promise-native';
import B2bConfiguration from  './util';

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
        this.apiConfig = new B2bConfiguration();
        this.redisClient = rc;
        this.expireTime = 7200;
    }

    cacheCartId (sessionId, cartId) {        
      const key =   "cart_" + cartId;
      this.redisClient.set(key, JSON.stringify({
          session: sessionId,
          created_at: new Date(),
        }));
        this.redisClient.expire(key, this.expireTime);   
    }

    cacheProductId (sku, id) {
      const key = "product_" + sku;
      this.redisClient.set(key, JSON.stringify({
          item_id: id,
          created_at: new Date(),
      }));
      this.redisClient.expire(key, this.expireTime);
    }

    cacheBasket(cartId, cartItems) {
      const key = "basket_" + cartId;
      this.redisClient.set(key, JSON.stringify({
        items: cartItems,
        created_at: new Date(),
      }));
      this.redisClient.expire(key, this.expireTime);
    }

    cachePaymentMethods(gci, methods) {
      this.redisClient.set("payment_methods_" + gci, JSON.stringify({
        items: methods,
        created_at: new Date(),
      }));
    }

    cacheShippingMethods(gci, methods) {
      this.redisClient.set("shipping_methods_" + gci, JSON.stringify({
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
        const that  = this;
        this.redisClient.get(key, (err, value) => {
          if(value) {
            successCallback(value);
          } else {                                          
              const options = {
                  uri: `${that.apiConfig.b2bApiUrl}/product/symbol/${sku}/?cache=false&format=json&frontend_id=${that.apiConfig.frontendId}&gci=${that.apiConfig.gci}`,
                  headers: {
                      'User-Agent': 'Request-Promise'
                  },
                  json: true
              };
              rp(options).then(function (resp) {
                if(resp && resp.length == 1) {
                  successCallback(resp[0].pk);
                } else {
                  const error = {
                    code: 500,
                    errorMessage: `Product ${sku} not available for frontend_id=${that.apiConfig.frontendId} and gci=${that.apiConfig.gci}`
                  }
                  errorCallback(error);
                }

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

      getShippingMethodsAsJson(gci, successCallback, errorCallback) {
        const key = "shipping_methods_" + gci;
        this.redisClient.get(key, (err, value) => {
          if(value) {
            successCallback(JSON.parse(value));
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

  getShippingMethodsWrapperAsJson(gci) {
    const that = this;
    return new Promise((resolve, reject) => {
      that.getShippingMethodsAsJson(gci, (successResponse) => {
          resolve(successResponse);
        }, (errorResponse) => {
          reject(errorResponse)
        });
    });
  }
}
module.exports = RedisCache;