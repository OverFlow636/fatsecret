'use strict';

const crypto   = require('crypto');
const request  = require('request');
const API_BASE = 'http://platform.fatsecret.com/rest/server.api';
const OAUTH_REQUEST_TOKEN = 'http://www.fatsecret.com/oauth/request_token';
const OAUTH_ACESS_TOKEN = 'http://www.fatsecret.com/oauth/access_token';

const DEFAULT_PARAMS = {
  format: 'json',
  oauth_signature_method: 'HMAC-SHA1',
  oauth_version: '1.0'
};

class FatSecret {
  constructor(key, secret) {
    this.key = key;
    this.secret = secret;
  }

  method(methodToCall, args) {
    args.method = methodToCall;
    return this._doRequest(args)
  }

  setUserAuth(token, usecret) {
    this.user_token = token;
    this.user_secret = usecret;

    return this;
  }

  getOauthUrl() {
    let params = {
      oauth_consumer_key: this.key,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor((new Date()).getTime()/1000),
      oauth_nonce: crypto.randomBytes(10).toString('HEX'),
      oauth_version: '1.0',
      oauth_callback: 'oob'
    };
    return this._signRequest(OAUTH_REQUEST_TOKEN, params);
  }

  getAccessToken(token, secret, code) {
    this.user_secret = secret;
    let params = {
      oauth_consumer_key: this.key,
      oauth_token: token,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor((new Date()).getTime()/1000),
      oauth_nonce: crypto.randomBytes(10).toString('HEX'),
      oauth_version: '1.0',
      oauth_verifier: code
    };
    return this._signRequest(OAUTH_ACESS_TOKEN, params);
  }

  _doRequest(params) {
    let self = this;
    return new Promise(function(resolve, reject) {
      let paramString = self._signRequest(API_BASE, Object.assign({}, DEFAULT_PARAMS, params));

      console.log('doRequest: ' + paramString);
      request({
        uri : paramString,
        json: true
      }, function(err, response, body) {
        if (err) {
          reject(err);
        } else {
          resolve(body);
        }
      });
    });
  }

  _signRequest(baseUrl, params) {
    let ret = '';

    params['oauth_consumer_key'] = this.key;
    params['oauth_nonce'] = crypto.randomBytes(10).toString('HEX');
    params['oauth_timestamp'] = Math.floor((new Date()).getTime()/1000);

    if (this.user_token) {
      params['oauth_token'] = this.user_token;
    }

    Object
      .keys(params)
      .sort()
      .forEach(function(param) {
        let value = params[param];
        ret += '&' + param + '=' + encodeURIComponent(value);
      });

    let mac = crypto.createHmac('sha1', this.secret + '&' + (this.user_secret ? this.user_secret : ''));
    mac.update('GET&' + encodeURIComponent(baseUrl) + '&' + encodeURIComponent(ret.substr(1)));
    ret += '&oauth_signature=' + encodeURIComponent(mac.digest('base64'));

    return baseUrl + '?' + ret.substr(1);
  }
}

module.exports = FatSecret;
