import rp from 'request-promise-native';
import AbstractUserProxy from '../abstract/user'
import { response } from 'express';
import B2bConfiguration from  './util';
 
class StockProxy extends AbstractUserProxy {
  constructor (config, req) {
    super(config, req);
    this.apiConfig = new B2bConfiguration();
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
    const options = {
      uri: `${this.apiConfig.b2bApiUrl}/product/symbol/${sku}/?cache=false&format=json&frontend_id=${this.apiConfig.frontendId}&gci=${this.apiConfig.gci}&view=full`,
        headers: {
          'User-Agent': 'Request-Promise'
      },
      json: true
    };

  return  rp(options)
      .then(function (resp) {
        const result = {
          "item_id": resp.length > 0 ? resp[0].pk : null,
          "product_id": resp.length > 0 ? resp[0].pk : null,
          "stock_id": 1, //TODO 
          "qty": resp.length > 0 ? resp[0].quantity : 0,
          "is_in_stock": resp.length > 0 ? resp[0].is_available : false,
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
         
        return new Promise((resolve, reject) => {
          resolve(result);
        })
      }).catch(function (err) {
        console.error(`Error during call check product availability for sku: ${sku}` , err);        
      });

  }
}

module.exports = StockProxy