
import AbstractCartProxy from '../abstract/cart'
import { multiStoreConfig } from './util'

class CartProxy extends AbstractCartProxy {
    constructor (config, req) {    
        super(config, req)
    }

    create (customerToken) {
      return new Promise((resolve, reject) => {
        resolve([]);
      })
    }
  
    /**
     * 
     *   {"code":200,
     * "result":{"item_id":7604,"sku":"WS09-XS-Blue","qty":1,"name":"Tiffany Fitness Tee","price":28,"product_type":"configurable","quote_id":"11228","product_option":{"extension_attributes":{"configurable_item_options":[{"option_id":"93","option_value":50},{"option_id":"136","option_value":167}]}}}}     
    */
    update (customerToken, cartId, cartItem) {
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
   /**
    * {"code":200,"result":[]}
    */
    pull (customerToken, cartId, params) {
    return new Promise((resolve, reject) => {
       resolve([]);
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