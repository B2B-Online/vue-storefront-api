
import AbstractCartProxy from '../abstract/cart'
import { multiStoreConfig } from './util'
import rp from 'request-promise-native';
import e, { response } from 'express';
/**
 * Specification https://github.com/DivanteLtd/storefront-integration-sdk/blob/tutorial/Dynamic%20API%20specification.md
 */
class CartProxy extends AbstractCartProxy {
    constructor (config, req) {    
      super(config, req)
      this.config = require('config');
      this.redis = require('redis');
    }

    saveInRedis (sessionId, cartId) {
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

    create (customerToken) {
      const options = {
        uri: 'https://cartapi.systemb2b.pl/api/get_or_create_cart/gci/1078',
        method: 'GET',
        headers: {
            'User-Agent': 'Request-Promise'
        },
        //json: true,
        //timeout: 15000,
        qs: {
          //user_id : "9b06dc1de20040a6822dabbd29797b1c",
          format: "json",
          title: "default",
          //session_key: "test123"
        }
     };
     
     if(customerToken) {
       options.qs.user_id = customerToken;
     } else {
       const uuid = require('uuid');
       options.qs.session_key = uuid.v1();
     } 
     const that = this;
     return  rp(options)
     .then(function (resp) {
        const json = JSON.parse(resp);         
       that.saveInRedis(json.session, json.cart_id);   
       return new Promise((resolve, reject) => {
         resolve(json.cart_id);
       })
     })
     .catch(function (err) {
       console.error('Error during call: b2bapieu.planetb2b.com/api/product/symbol/', err);  
       reject();     
     }); 
    }
    

   async pull (token, cartId, params) {
    const options = {
      uri: 'https://cartapi.systemb2b.pl/api/get_or_create_cart/gci/1078',
      method: 'GET',
      headers: {
          'User-Agent': 'Request-Promise'
      },
      json: true,
      //timeout: 15000,
      qs: {         
        cache: false,
        format: "json",
        title: "default",         
      }
    };

    if(!token) {               
       const res = await this.findSessionWrapper(cartId);
       options.qs.session_key = JSON.parse(res).session;
    } else {
      options.qs.user_id = customerToken;
    }
    
    return  rp(options).then(function (resp) {      
      const basket = [];
      resp.products.forEach(item => {
        basket.push({
          //"item_id": 66257,
          //"sku": "WS08-M-Black",
          //"qty": 1,
          //"name": "Minerva LumaTech&trade; V-Tee",
          //"price": 32,
          //"product_type": "configurable",
          //"quote_id": "dceac8e2172a1ff0cfba24d757653257",    
          //"product_option": { }
        })
      });               
      return new Promise((resolve, reject) => {
        resolve(basket);
      })
    }).catch(function (err) {
      console.error('Error during call: b2bapieu.planetb2b.com/api/product/symbol/', err);  
      reject();     
    }); 

  }

  update (customerToken, cartId, cartItem) {
    const options = {
      uri: 'https://cartapi.systemb2b.pl/api/get_or_create_cart/gci/1078',
      method: 'GET',
      headers: {
        'User-Agent': 'Request-Promise'
      },
      json: true,
      //timeout: 15000,
      qs: {       
        format: "json",
        title: "default",
      }
   };

   if(!token) {               
     const res = await this.findSessionWrapper(cartId);
     options.qs.session_key = JSON.parse(res).session;
   } else {
     options.qs.user_id = customerToken;
   }
   //product_id=311340&quantity=1&customer_code=&variant_id=252245
    return new Promise((resolve, reject) => {
        resolve([]);
      })        
  }
  
    applyCoupon (customerToken, cartId, coupon) {
      return new Promise((resolve, reject) => {
        resolve([]);
      })     
    }
  
    deleteCoupon (customerToken, cartId) {
      return new Promise((resolve, reject) => {
        resolve([]);
      })     
    }
  
    getCoupon (customerToken, cartId) {
        return new Promise((resolve, reject) => {
          resolve([]);
        })     
    }
  

    delete (customerToken, cartId, cartItem) {
        
      return new Promise((resolve, reject) => {
            resolve({
                "code": 200,
                "result": cartId
              });
      })     
    }

  
    totals (customerToken, cartId, params) {
      return new Promise((resolve, reject) => {
        resolve([]);
      });     
    }

    getShippingMethods (customerToken, cartId, address) {
        const result = [
          {
            "carrier_code":"flatrate",
            "method_code":"flatrate",
            "carrier_title":"Flat Rate",
            "method_title":"Fixed",
            "amount":5,
            "base_amount":5,
            "available":true,
            "error_message":"",
            "price_excl_tax":5,
            "price_incl_tax":5
          },
          {
            "carrier_code":"tablerate",
            "method_code":"bestway",
            "carrier_title":"Best Way",
            "method_title":"Table Rate",
            "amount":15,
            "base_amount":15,
            "available":true,
            "error_message":"",
            "price_excl_tax":15,
            "price_incl_tax":15
        }];
        return new Promise((resolve, reject) => {
            resolve(result);
          });         
    }
    
    getPaymentMethods (customerToken, cartId) {
        const result = {
          "payment_methods":[
              {
                "code":"cashondelivery",
                "title":"Cash On Delivery"
              },
              {
                "code":"checkmo",
                "title":"Check / Money order"
              }
            ]
        };
        return new Promise((resolve, reject) => {
            resolve(result);
        });   
    }
    
    setShippingInformation (customerToken, cartId, address) {
        const result = {
          "payment_methods":[
            {
              "code":"cashondelivery",
              "title":"Cash On Delivery"
            },
            {
              "code":"checkmo",
              "title":"Check / Money order"
            }
          ],
          "totals":
            {
            /*  "grand_total":66,
              "base_grand_total":66,
              "subtotal":56,
              "base_subtotal":56,
              "discount_amount":0,
              "base_discount_amount":0,
              "subtotal_with_discount":56,
              "base_subtotal_with_discount":56,
              "shipping_amount":10,
              "base_shipping_amount":10,
              "shipping_discount_amount":0,
              "base_shipping_discount_amount":0,
              "tax_amount":0,
              "base_tax_amount":0,
              "weee_tax_applied_amount":null,
              "shipping_tax_amount":0,
              "base_shipping_tax_amount":0,
              "subtotal_incl_tax":56,
              "shipping_incl_tax":10,
              "base_shipping_incl_tax":10,
              "base_currency_code":"USD",
              "quote_currency_code":"USD",
              "items_qty":2,*/
              "items":[
                /*{
                  "item_id":7604,
                  "price":28,
                  "base_price":28,
                  "qty":2,
                  "row_total":56,
                  "base_row_total":56,
                  "row_total_with_discount":0,
                  "tax_amount":0,
                  "base_tax_amount":0,
                  "tax_percent":0,
                  "discount_amount":0,
                  "base_discount_amount":0,
                  "discount_percent":0,
                  "price_incl_tax":28,
                  "base_price_incl_tax":28,
                  "row_total_incl_tax":56,
                  "base_row_total_incl_tax":56,
                  "options":"[{\"value\":\"Blue\",\"label\":\"Color\"},{\"value\":\"XS\",\"label\":\"Size\"}]",
                  "weee_tax_applied_amount":null,
                  "weee_tax_applied":null,
                  "name":"Tiffany Fitness Tee"}*/
                ],
                "total_segments":[/*
                  {"code":"subtotal","title":"Subtotal","value":56},
                  {"code":"shipping","title":"Shipping & Handling (Flat Rate - Fixed)","value":10},
                  {"code":"tax","title":"Tax","value":0,"extension_attributes":{"tax_grandtotal_details":[]}},
                  {"code":"grand_total","title":"Grand Total","value":66,"area":"footer"}*/
                ]
            }
        };
        return new Promise((resolve, reject) => {
            resolve(result);
        });
    }
}
module.exports = CartProxy;