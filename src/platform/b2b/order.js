import AbstractOrderProxy from '../abstract/order'
import order from 'src/api/order';
import rp from 'request-promise-native';
import RedisCache from './redis';

class OrderProxy extends AbstractOrderProxy {
  constructor (config, req) {
    super(config, req);
    this.config = require('config');
    this.redis = require('redis');
    this.redisCache = new RedisCache();
    this.gci = 1078;
    //this.cartApiUrl = 'http://localhost:8000/api';
    this.cartApiUrl = 'https://cartapi.systemb2b.pl/api';
  }

  /**
   * {
    "user_id": "",
    "cart_id": "d90e9869fbfe3357281a67e3717e3524",
    "products": [
        {
            "sku": "WT08-XS-Yellow",
            "qty": 1
        }
    ],
    "addressInformation": {
        "shippingAddress": {
            "region": "",
            "region_id": 0,
            "country_id": "PL",
            "street": [
                "Example",
                "12"
            ],
            "company": "NA",
            "telephone": "",
            "postcode": "50-201",
            "city": "Wroclaw",
            "firstname": "Piotr",
            "lastname": "Karwatka",
            "email": "pkarwatka30@divante.pl",
            "region_code": ""
        },
        "billingAddress": {
            "region": "",
            "region_id": 0,
            "country_id": "PL",
            "street": [
                "Example",
                "12"
            ],
            "company": "Company name",
            "telephone": "",
            "postcode": "50-201",
            "city": "Wroclaw",
            "firstname": "Piotr",
            "lastname": "Karwatka",
            "email": "pkarwatka30@divante.pl",
            "region_code": "",
            "vat_id": "PL88182881112"
        },
        "shipping_method_code": "flatrate",
        "shipping_carrier_code": "flatrate",
        "payment_method_code": "cashondelivery",
        "payment_method_additional": {}
    },
    "order_id": "1522811662622-d3736c94-49a5-cd34-724c-87a3a57c2750",
    "transmited": false,
    "created_at": "2018-04-04T03:14:22.622Z",
    "updated_at": "2018-04-04T03:14:22.622Z"
}
   * @param {*} orderData 
   */
  async create (orderData) {
    let createOrderResult = null;
    await this.setShipment(orderData);
    await this.setPayment(orderData);
    let resp = await this.startCheckout(orderData);
    if(resp.success) {
      const checkoutCartId = resp.checkout_cart_id;
      if(!checkoutCartId) {
        console.error("Create order faild checkout_cart_id is undifined", resp);
        return new Promise((resolve, reject) => { reject(); });
      }
      const orderDataStatus = await this.orderData(orderData, checkoutCartId);
      if(orderDataStatus) {
        const postOrderDataStatus = await this.postOrderData(orderData, checkoutCartId);
        if(postOrderDataStatus) {
          await this.orderConfirmation(orderData, checkoutCartId);
          createOrderResult = await this.orderComplate(orderData, checkoutCartId);
        }
      } 
    }
    if(createOrderResult) {
      console.info("Create order finished successfull", createOrderResult);
      return new Promise((resolve, reject) => { resolve(createOrderResult); });      
    } else {
      console.error("Create order faild");
      return new Promise((resolve, reject) => { reject(); });
    }
  }

  async setPayment (orderData) {
    const token = orderData.user_id;
    const cartId = orderData.cart_id;

    const options = {
        uri: `${this.cartApiUrl}/set_payment_or_shipment/gci/${this.gci}/${cartId}/`,
        method: 'PUT',
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true,
        qs: {                  
          method: 'set_payment'
        }
      };                    
      const res = await this.redisCache.findSessionWrapper(cartId);
      options.qs.session_key = JSON.parse(res).session;
      if(token) { 
        options.qs.user_id = token;
      }
      options.qs.method_code =  orderData.addressInformation.payment_method_code;
      return rp(options).then(function (resp) {
        return new Promise((resolve, reject) => {
            resolve();
        });
      }).catch(function (err) {
        console.error('Error during call setPayment', err);     
      }); 
    }

  async setShipment (orderData) {
    const token = orderData.user_id;
    const cartId = orderData.cart_id;

    const options = {
        uri: `${this.cartApiUrl}/set_payment_or_shipment/gci/${this.gci}/${cartId}/`,
        method: 'PUT',
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true,
        qs: {                  
          method: 'set_shipment'
        }
    }; 

    const res = await this.redisCache.findSessionWrapper(cartId);
    options.qs.session_key = JSON.parse(res).session;
    if(token) { 
      options.qs.user_id = token;
    }
    options.qs.method_code =  orderData.addressInformation.shipping_method_code;
    return  rp(options).then(function (resp) {
      return new Promise((resolve, reject) => {
        resolve(true);
      });
    }).catch(function (err) {
      console.error('Error during call setShipment', err);            
    }); 
  }
  
  async startCheckout(orderData) {
    const token = orderData.user_id;
    const cartId = orderData.cart_id;
    const options = {
      uri: `${this.cartApiUrl}/checkout/start_checkout/gci/${this.gci}/`,
      method: 'GET',
      headers: {
          'User-Agent': 'Request-Promise'
      },
      json: true,
      qs: {
        cache: false,
        format: 'json'
       }
    };
    
    const res = await this.redisCache.findSessionWrapper(cartId);
    options.qs.session_key = JSON.parse(res).session;
    options.qs.customer_email = 'as_anonymous'; 
    options.qs.currency='PLN';   
    if(token) { 
      options.qs.user_id = token;
      //TODO set -> options.qs.customer_email;
    }
    return  rp(options).then(function (resp) {
      return new Promise((resolve, reject) => {
        resolve(resp);
      });
    }).catch(function (err) {
      console.error('Error during call startCheckout', err);       
    }); 
  }

  async orderData(orderData, checkoutCartId) {
    const token = orderData.user_id;
    const cartId = orderData.cart_id;
    const options = {
      uri: `${this.cartApiUrl}/checkout/order_data/gci/${this.gci}/${checkoutCartId}/`,
      method: 'GET',
      json: true,
      headers: {
          'User-Agent': 'Request-Promise'
      },      
      qs: {   
        cache: false,
        format: 'json'                       
      }
    };
    const res = await this.redisCache.findSessionWrapper(cartId);
    options.qs.session_key = JSON.parse(res).session;
    options.qs.customer_email = 'as_anonymous';    
    if(token) { 
      options.qs.user_id = token;
      //TODO set -> options.qs.customer_email;
    }
    
    return rp(options).then(function (resp) {
      return new Promise((resolve, reject) => {
        resolve(resp.success);
      });
    }).catch(function (err) {
      console.error('Error during call postOrderData', err);        
    });

  }

  async postOrderData (orderData, checkoutCartId) {
    const token = orderData.user_id;
    const cartId = orderData.cart_id;
    const options = {
      uri: `${this.cartApiUrl}/checkout/order_data/gci/${this.gci}/${checkoutCartId}/`,
      method: 'POST',
      headers: {
          'User-Agent': 'Request-Promise'
      },
      json: true,
      qs: {                          
      },
      body: {

      }
    };
    const res = await this.redisCache.findSessionWrapper(cartId);
    options.qs.session_key = JSON.parse(res).session;
    options.qs.customer_email = 'as_anonymous';    
    if(token) { 
      options.qs.user_id = token;
      //TODO set -> options.qs.customer_email;
    }
    
    const rawData = {
      customer: { 
        company_name: "",
        first_name: orderData.addressInformation.shippingAddress.firstname, 
        last_name: orderData.addressInformation.shippingAddress.lastname,
        email: orderData.addressInformation.shippingAddress.email,
        phone: orderData.addressInformation.shippingAddress.telephone,
        street: orderData.addressInformation.shippingAddress.street[0],
        house: orderData.addressInformation.shippingAddress.street[1], 
        postal_code: orderData.addressInformation.shippingAddress.postcode,
        city: orderData.addressInformation.shippingAddress.city,
        country_code: orderData.addressInformation.shippingAddress.country_id,
        suite: ""
      },
      delivery: {
        cost:0, 
        id: orderData.addressInformation.shipping_method_code,
        name: 'Odbiór osobisty',
        same_as_contact_data: true
      },
      bill:{
        company_name: "",
        first_name: orderData.addressInformation.billingAddress.firstname, 
        last_name: orderData.addressInformation.billingAddress.lastname,
        email: orderData.addressInformation.billingAddress.email,
        phone: orderData.addressInformation.billingAddress.telephone,
        street: orderData.addressInformation.billingAddress.street[0],
        house: orderData.addressInformation.billingAddress.street[1], 
        postal_code: orderData.addressInformation.billingAddress.postcode,
        city: orderData.addressInformation.billingAddress.city,
        country_code: orderData.addressInformation.billingAddress.country_id,
        suite: ""
      },
      success:true,
      next:`/api/checkout/order_data/gci/${this.gci}/${checkoutCartId}/`,
      'marketing-handlowe_info': true
    };

    options.body  = {
      raw_data : JSON.stringify(rawData)
    };

    return rp(options).then(function (resp) {
      return new Promise((resolve, reject) => {
        resolve(true);
      });
    }).catch(function (err) {
      console.error('Error during call postOrderData', err);           
    });

  }

  async orderConfirmation (orderData, checkoutCartId) {
    const token = orderData.user_id;
    const cartId = orderData.cart_id;
    const email = orderData.addressInformation.shippingAddress.email;
    const options = {
        uri: `${this.cartApiUrl}/checkout/order_confirmation/gci/${this.gci}/${checkoutCartId}/`,
        method: 'POST',
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true,
        qs: {                  
          customer_email: email
        }
    }; 
    const order  = {
      customer_note: "",
      confim: true
    }
    options.body  = {
      raw_data : JSON.stringify(order)
    };

    const res = await this.redisCache.findSessionWrapper(cartId);
    options.qs.session_key = JSON.parse(res).session;
    if(token) { 
      options.qs.user_id = token;
    }
    return  rp(options).then(function (resp) {
        return new Promise((resolve, reject) => {
          resolve(resp.success);
        });
      }).catch(function (err) {
        console.error('Error during call orderConfirmation', err);            
      });
  }

  async orderComplate (orderData, checkoutCartId) {
    const token = orderData.user_id;
    const cartId = orderData.cart_id;
    
    const options = {
        uri: `${this.cartApiUrl}/checkout/completed/gci/${this.gci}/${checkoutCartId}/`,
        method: 'GET',
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true,
        qs: {                  
          cache: false
        }
    }; 

    const res = await this.redisCache.findSessionWrapper(cartId);
    options.qs.session_key = JSON.parse(res).session;
    options.qs.customer_email = 'as_anonymous';  
    if(token) { 
      options.qs.user_id = token;
      //TODO set -> options.qs.customer_email;
    }
    return  rp(options).then(function (resp) {
      return new Promise((resolve, reject) => {
        resolve(resp);
      });
    }).catch(function (err) {
      console.error('Error during call orderComplate t', err);            
    }); 
  }
}
module.exports = OrderProxy