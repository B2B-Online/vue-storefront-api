import AbstractUserProxy from '../abstract/user'
import { multiStoreConfig } from './util'

class UserProxy extends AbstractUserProxy {
  constructor (config, req){    
    super(config, req);
    
  }

  /**
   * 
   * EXAMPLE INPUT:
   * {
   *       "customer": {
   *           "email": "jfoe@vuestorefront.io",
   *           "firstname": "Jon",
   *           "lastname": "Foe"
   *       },
   *       "password": "!@#foearwato"
   *  }
   * 
   * EXAMPLE OUTPUT:
   * 
   *  {
   *       "code": 200,
   *       "result": {
   *           "id": 3,
   *           "group_id": 1,
   *           "created_at": "2017-11-28 19:22:51",
   *           "updated_at": "2017-11-28 19:22:51",
   *           "created_in": "Default Store View",
   *           "email": "pkarwatka@divante.pl",
   *           "firstname": "Piotr",
   *           "lastname": "Karwatka",
   *           "store_id": 1,
   *           "website_id": 1,
   *           "addresses": [],
   *           "disable_auto_group_change": 0
   *       }
   *   }
   * @param {*} userData 
   */

  register (userData) {
    return new Promise((resolve, reject) => {
      resolve([]);
    });     
  }

  /**
  * EXAMPLE INPUT:
  * 
  *    { 
  *        "username": "pkarwatka@divante.pl",
  *        "password": "********"
  *    }
  * 
  * EXAMPLE OUTPUT:
  * {
  *        "code": 200,
  *        "result": "3tx80s4f0rhkoonqe4ifcoloktlw9glo"
  *    }
  */
  login (userData) {
    return new Promise((resolve, reject) => {
        resolve([]);
    });       
  }

   /**
   * EXAMPLE INPUT:
   * - just provide an consumer token from login method
   * 
   * EXAMPLE OUTPUT:
   * 
   * {
   *       "code": 200,
   *       "result": {
   *           "id": 3,
   *           "group_id": 1,
   *           "created_at": "2017-11-28 19:22:51",
   *           "updated_at": "2017-11-28 20:01:17",
   *           "created_in": "Default Store View",
   *           "email": "pkarwatka@divante.pl",
   *           "firstname": "Piotr",
   *           "lastname": "Karwatka",
   *           "store_id": 1,
   *           "website_id": 1,
   *           "addresses": [],
   *           "disable_auto_group_change": 0
   *       }
   *   }
   * 
   * } requestToken 
   */
  me(token) {
    return new Promise((resolve, reject) => {
        resolve([]);
    });
  }

  orderHistory (token, page, pageSize) {
    return new Promise((resolve, reject) => {
        resolve([]);
    });
  }
  
  creditValue (token) {
    return new Promise((resolve, reject) => {
        resolve([]);
    });
  }
  
  refillCredit (customerToken, creditCode) {
    return new Promise((resolve, reject) => {
        resolve([]);
    });
  }
  
  resetPassword (emailData) {
    return this.api.user.resetPassword(emailData)
  }
  update (userData) {
    return this.api.user.update(userData)
  }
  changePassword (passwordData) {
    return this.api.user.changePassword(passwordData)
  }
}

module.exports = UserProxy