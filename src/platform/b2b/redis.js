class RedisCache {
    constructor () {    
        this.config = require('config');
        this.redis = require('redis');
    }

    cacheCartId (sessionId, cartId) {
        let redisClient = this.redis.createClient(this.config.redis);
        redisClient.on('error', function (err) {
          redisClient = this.redis.createClient(this.config.redis);
        });
  
        if (this.config.redis.auth) {
          redisClient.auth(this.config.redis.auth);
        }
  
        redisClient.set("cart_" + cartId, JSON.stringify({
          session: sessionId,
          created_at: new Date(),
        }));
    }

    cacheProductId (sku, id) {
        let redisClient = this.redis.createClient(this.config.redis);
        redisClient.on('error', function (err) {
          redisClient = this.redis.createClient(this.config.redis);
        });
  
        if (this.config.redis.auth) {
          redisClient.auth(this.config.redis.auth);
        }
  
        redisClient.set("product_" + sku, JSON.stringify({
          item_id: id,
          created_at: new Date(),
        }));
    }

    findSession(cartId, successCallback, errorCallback) {
        let redisClient = this.redis.createClient(this.config.redis);
        redisClient.on('error', function (err) {
          redisClient = this.redis.createClient(this.config.redis);
        });
        
        if (this.config.redis.auth) {
          redisClient.auth(this.config.redis.auth);
        }
        const key = "cart_" + cartId;
        redisClient.get(key, (err, value) => {
          if(value) {
            successCallback(value);
          } else {
            errorCallback(err);
          }
        });
      }

      findProductId(sku, successCallback, errorCallback) {
        let redisClient = this.redis.createClient(this.config.redis);
        redisClient.on('error', function (err) {
          redisClient = this.redis.createClient(this.config.redis);
        });
        
        if (this.config.redis.auth) {
          redisClient.auth(this.config.redis.auth);
        }
        const key = "sku_" + cartId;
        redisClient.get(key, (err, value) => {
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
  
}
module.exports = RedisCache;