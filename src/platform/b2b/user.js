import AbstractUserProxy from '../abstract/user'
import { multiStoreConfig } from './util'

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AWS = require('aws-sdk');
const request = require('request');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
global.fetch = require('node-fetch');

class UserProxy extends AbstractUserProxy {
  constructor (config, req){    
    super(config, req);  
    
    this.poolData = {    
      UserPoolId : "eu-west-1_GivPpBCha", // Your user pool id here    
      ClientId : "780u61u0vjvjt1e3chm3gu6cke" // Your client id here
      }; 

    this.pool_region = 'eu-west-1';
    this.userPool = new AmazonCognitoIdentity.CognitoUserPool(this.poolData);
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

  async register (userData) {
    
    var attributeList = [];
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"name",Value: `${userData.customer.firstname} ${userData.customer.lastname}`}));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"given_name", Value: userData.customer.firstname}));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"family_name", Value: userData.customer.lastname}));
    //attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"preferred_username",Value:"jay"}));
    //attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"gender",Value:"male"}));
    //attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"birthdate",Value:"1991-06-21"}));
    //attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"address",Value:"CMB"}));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"email", Value: userData.customer.email}));
    //attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"phone_number",Value:"+5412614324321"}));
    //attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"custom:scope",Value:"admin"}));

    const that = this;
    return new Promise((resolve, reject) => {
        that.userPool.signUp(userData.customer.email, userData.password, attributeList, null, function(err, resp){
          if (!err) {
          const result = {
            id: 3,
            group_id: 1,
            created_at: new Date(),
            updated_at:  new Date(),
            created_in: "AWS Cogniton",
            email: resp.user.username,
            firstname: "",
            lastname: "",
            store_id: 1,
            website_id: 1,
            addresses: [],
            disable_auto_group_change: 0            
          }
          resolve(result);
          console.info(`user name is ${resp.user.username}`);
        } else {
          console.error(err);
          reject(err);
        }
      });
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
  * @param {*} input
  */
 async login (input) {
    
    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
      Username : input.username,
      Password : input.password,
    });

    const userData = {
      Username : input.username,
      Pool : this.userPool
    };
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            console.log('access token + ' + result.getAccessToken().getJwtToken());
            console.log('id token + ' + result.getIdToken().getJwtToken());
            console.log('refresh token + ' + result.getRefreshToken().getToken());
            //TODO should we only return access token ???
            resolve(result.getAccessToken().getJwtToken());
        },
        onFailure: function(err) {
            console.log(err);
            reject(err);
        }
      });
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
    return new Promise((resolve, reject) => {
      resolve([]);
    });
  }

  update (userData) {
    return new Promise((resolve, reject) => {
      resolve([]);
    });
  }

  changePassword (data) {
    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
      Username: data.username,
      Password: data.password,
    });

    const userData = {
      Username: data.username,
      Pool: userPool
    };
    
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    return new Promise((resolve, reject) => {
      resolve([]);
    });
  }
}

module.exports = UserProxy