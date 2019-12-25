import rp from 'request-promise-native';
import AbstractUserProxy from '../abstract/user'
import { multiStoreConfig } from './util'
import { response } from 'express';



class StockProxy extends AbstractUserProxy {
  constructor (config, req) {
    super(config, req)
  }
  
  /**
   * 
   *  {"code":200,"result":
   * {"item_id":1499,"product_id":1499,"stock_id":1,"qty":100,"is_in_stock":true,"is_qty_decimal":false,
   * "show_default_notification_message":false,"use_config_min_qty":true,"min_qty":0,"use_config_min_sale_qty":1,"min_sale_qty":1,
   * "use_config_max_sale_qty":true,"max_sale_qty":10000,"use_config_backorders":true,"backorders":0,"use_config_notify_stock_qty":true,
   * "notify_stock_qty":1,"use_config_qty_increments":true,"qty_increments":0,"use_config_enable_qty_inc":true,"enable_qty_increments":false,
   * "use_config_manage_stock":true,"manage_stock":true,"low_stock_date":null,"is_decimal_divided":false,"stock_status_changed_auto":0}}
   */
  check ({sku, stockId = 0}) {    
    //https://b2bapieu.planetb2b.com/api/product/pk/310166/?cache=false&format=json&frontend_id=3&gci=1078&view=full
    const options = {
        uri: 'https://b2bapieu.planetb2b.com/api/product/symbol/'+sku+'/?cache=false&format=json&frontend_id=3&gci=1078&view=full',
        /*qs: {
            access_token: 'xxxxx xxxxx' // -> uri + '?access_token=xxxxx%20xxxxx'
        },*/
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true // Automatically parses the JSON string in the response
    };

  return  rp(options)
      .then(function (repos) {
        const result = {
          "item_id": repos[0].pk,
          "product_id": repos[0].pk,
          "stock_id": 1, //TODO 
          "qty": repos[0].quantity,
          "is_in_stock": repos[0].is_available,
          "is_qty_decimal": false,
          "show_default_notification_message": false,
          "use_config_min_qty": true,
          "min_qty": 0,
          "use_config_min_sale_qty": true,
          "min_sale_qty": 1,
          "use_config_max_sale_qty": true,
          "max_sale_qty": 10000,
          "use_config_backorders": true,
          "backorders": 0,
          "use_config_notify_stock_qty": true,
          "notify_stock_qty": 1,
          "use_config_qty_increments": true,
          "qty_increments": 0,
          "use_config_enable_qty_inc": true,
          "enable_qty_increments": false,
          "use_config_manage_stock": true,
          "manage_stock": true,
          "low_stock_date": null,
          "is_decimal_divided": false,
          "stock_status_changed_auto": 0
        };
             /**
        "item_id": 14,
   *    "product_id": 14,
   *    "stock_id": 1,
   *    "qty": 100,
   *    "is_in_stock": true,
   *    "is_qty_decimal": false,
   *    "show_default_notification_message": false,
   *    "use_config_min_qty": true,
   *    "min_qty": 0,
   *    "use_config_min_sale_qty": 1,
   *    "min_sale_qty": 1,
   *    "use_config_max_sale_qty": true,
   *    "max_sale_qty": 10000,
   *    "use_config_backorders": true,
   *    "backorders": 0,
   *    "use_config_notify_stock_qty": true,
   *    "notify_stock_qty": 1,
   *    "use_config_qty_increments": true,
   *    "qty_increments": 0,
   *    "use_config_enable_qty_inc": true,
   *    "enable_qty_increments": false,
   *    "use_config_manage_stock": true,
   *    "manage_stock": true,
   *    "low_stock_date": null,
   *    "is_decimal_divided": false,
   *    "stock_status_changed_auto": 0
   *  */   
        
        return new Promise((resolve, reject) => {
          resolve(result);
        })
      })
      .catch(function (err) {
        console.error('Error during call: b2bapieu.planetb2b.com/api/product/symbol/', err);
        
      });

  }
}

module.exports = StockProxy