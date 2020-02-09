import AbstractCartProxy from '../abstract/cart'
import B2bConfiguration from  './util';
import rp from 'request-promise-native';
import e, { response } from 'express';
import RedisCache from './redis';
/**
 * Specification :
 *  https://github.com/DivanteLtd/storefront-integration-sdk/blob/tutorial/Dynamic%20API%20specification.md
 * 
 */
class CartProxy extends AbstractCartProxy {
    constructor (config, req) {    
      super(config, req)
      this.redis = require('redis');
      this.redisCache = new RedisCache();
      this.apiConfig = new B2bConfiguration();
      this.gci = this.apiConfig.gci;
      //this.cartApiUrl = 'http://localhost:8000/api';
      this.cartApiUrl = this.apiConfig.cartApiUrl;
    }

    create (token) {
      const options = {
        uri: `${this.cartApiUrl}/get_or_create_cart/gci/${this.gci}`,
        method: 'GET',
        headers: {
            'User-Agent': 'Request-Promise'
        },
        qs: {
          format: "json",
          title: "default",
        }
     };
     
     if(token) {
       options.qs.user_id = token;
     } 
    
    const uuid = require('uuid');
    options.qs.session_key = uuid.v1();
     
     const that = this;
     return  rp(options)
     .then(function (resp) {
        const json = JSON.parse(resp);         
       that.redisCache.cacheCartId(json.session, json.cart_id);   
       return new Promise((resolve, reject) => {
         resolve(json.cart_id);
       })
     })
     .catch(function (err) {
       console.error('Error during call: b2bapieu.planetb2b.com/api/product/symbol/', err);              
     }); 
    }
    

   async pull (token, cartId, params) {
    const options = {
      uri: `${this.cartApiUrl}/get_or_create_cart/gci/${this.gci}`,
      method: 'GET',
      headers: {
          'User-Agent': 'Request-Promise'
      },
      json: true,
      qs: {         
        cache: false,
        format: "json",
        title: "default",         
      }
    };

    if(token) {               
       options.qs.user_id = token;
    } 
    const res = await this.redisCache.findSessionWrapper(cartId);
    options.qs.session_key = JSON.parse(res).session;
    const that = this;
    return  rp(options).then(function (resp) {      
      const basket = [];
      resp.products.forEach(item => {
        basket.push({
          "item_id": item.product_id,
          "sku": item.symbol,
          "qty": item.quantity,
          "name": item.name,
          "price": item.unit_price,
          "product_type": "configurable",
          "quote_id": "",    
          "product_option": { }
        })
      });  
      that.redisCache.cacheBasket(cartId, basket);             
      return new Promise((resolve, reject) => {
        resolve(basket);
      })
    }).catch(function (err) {
      console.error('Error during call pull', err);      
    }); 

  }

  async update (token, cartId, cartItem) {
    const updateProductUrl = `${this.cartApiUrl}/update_product/gci/${this.gci}/`;
    const addProductUrl = `${this.cartApiUrl}/add_product/gci/${this.gci}/`;
    const options = {
      uri: addProductUrl,
      method: 'PUT',
      headers: {
        'User-Agent': 'Request-Promise'
      },
      json: true,
      qs: {       
      }
   };

   if(token) {               
     options.qs.user_id = token;
   }
   const res = await this.redisCache.findSessionWrapper(cartId);
   options.qs.session_key = JSON.parse(res).session;
   
   const itemId = await this.redisCache.findProductIdWrapper(cartItem.sku);
   const hasItem = await this.redisCache.hasBasketItemWrapper(cartId, itemId)
   if(hasItem) {
      options.uri = updateProductUrl;
   }
   
   if(!itemId) {     
    return new Promise((resolve, reject) => {
      reject(`Missing product for sku ${cartItem.sku}`);
    }); 
   }
   options.qs.product_id = itemId;
   options.qs.quantity = cartItem.qty;
   //product_id=311340&quantity=1&customer_code=&variant_id=252245
    
   return  rp(options).then(function (resp) {      
    const prod = resp.products.filter(prod => prod.product_id === itemId)[0];

    const result = {
      "item_id": itemId,
      "sku": cartItem.sku,
      "qty": prod.quantity,
      "name":prod.name,
      "price":prod.unit_price,
      "product_type":"configurable",
      "quote_id":"" //TODO - how to set
    };
                   
    return new Promise((resolve, reject) => {
      resolve(result);
    });

  }).catch(function (err) {
    console.error('Error during call update', err);     
  }); 
  }

    async delete (token, cartId, cartItem) {      
      const options = {
        uri: `${this.cartApiUrl}/remove_product/gci/${this.gci}/`,
        method: 'PUT',
        headers: {
          'User-Agent': 'Request-Promise'
        },
        json: true,
        qs: {  
          product_id: cartItem.item_id     
         }
       };
                     
       const res = await this.redisCache.findSessionWrapper(cartId);
       options.qs.session_key = JSON.parse(res).session;
       if(token) { 
         options.qs.user_id =token;
       }
       return  rp(options).then(function (resp) {
          return new Promise((resolve, reject) => {
              resolve();
          });
        }).catch(function (err) {
          console.error('Error during call delete', err);     
        });      
    }

    async applyCoupon (token, cartId, coupon) {
      const options = {
        uri: `${this.cartApiUrl}/set_discount_code/gci/${this.gci}/`,
        method: 'GET',
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true,
        qs: {                  
          format: "json",
          discount_code: coupon
        }
      };                    
      const res = await this.redisCache.findSessionWrapper(cartId);
      options.qs.session_key = JSON.parse(res).session;
      if(token) { 
        options.qs.user_id = token;
      }
      return  rp(options).then(function (resp) {
        return new Promise((resolve, reject) => {
            resolve();
        });
      }).catch(function (err) {
        console.error('Error during call applyCoupon', err);     
      });        
    }
  
    async deleteCoupon (token, cartId) {
      const options = {
        uri: `${this.cartApiUrl}/remove_discount_code/gci/${this.gci}/`,
        method: 'GET',
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true,
        qs: {                  
          format: "json"
        }
      };                    
      const res = await this.redisCache.findSessionWrapper(cartId);
      options.qs.session_key = JSON.parse(res).session;
      if(token) { 
        options.qs.user_id = token;
      }
      return  rp(options).then(function (resp) {
        return new Promise((resolve, reject) => {
            resolve();
        });
      }).catch(function (err) {
        console.error('Error during call applyCoupon', err);     
      });     
    }
  
    getCoupon (token, cartId) {
        return new Promise((resolve, reject) => {
          resolve([]);
        })     
    }

    totals (token, cartId, params) {
      return new Promise((resolve, reject) => {
        resolve([]);
      });     
    }

    async getShippingMethods (token, cartId, address) {
      const options = {
        uri: `${this.cartApiUrl}/get_shipment_choices/gci/${this.gci}/${cartId}/`,
        method: 'GET',
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true,
        qs: {                  
          format: "json"
        }
      };                    
      const res = await this.redisCache.findSessionWrapper(cartId);
      options.qs.session_key = JSON.parse(res).session;
      if(token) { 
        options.qs.user_id = token;
      }
      const that = this;
      return  rp(options).then(function (resp) {      
        const result = [];
        resp.methods.forEach(item => {
          result.push({
            "carrier_code": item.id,
            "method_code": item.id,
            "carrier_title": item.name,
            "method_title": item.method_name,
            "amount": item.cost,
            "base_amount": item.cost_net,
            "available": true,
            "error_message": "",
            "price_excl_tax": item.cost,
            "price_incl_tax": item.cost_net
          });
        });  
                   
        return new Promise((resolve, reject) => {
          resolve(result);
        })
      }).catch(function (err) {
        console.error('Error during call getShippingMethods', err);      
      });         
    }
    
    async getPaymentMethods (token, cartId) {      
        const options = {
          uri: `https://order.planetb2b.com/api/v.1.0/get_payment_methods/${this.gci}/`,
          method: 'GET',
          headers: {
              'User-Agent': 'Request-Promise'
          },
          json: true,
          qs: {                              
          }
        };
        const that = this;
        return  rp(options).then(function (resp) {      
          const result = [];
          resp.methods.forEach(item => {
            result.push({
              "code": item.id,
              "title": item.method_name
            })
          });  
                     
          return new Promise((resolve, reject) => {
            that.redisCache.cachePaymentMethods(that.gci, result); 
            resolve(result);
          })
        }).catch(function (err) {
          console.error('Error during call getPaymentMethods', err);       
        });   
    }
    
   async setShippingInformation (token, cartId, address) {
      const paymentMethods = await this.redisCache.getPaymentMethodsWrapper(this.gci);  
      const result = {
          "payment_methods": paymentMethods,
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