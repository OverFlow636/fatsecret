'use strict';

const crypto   = require('crypto');
const request  = require('request');
const API_BASE = 'http://platform.fatsecret.com/rest/server.api';
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

  _doRequest(params) {
    let self = this;
    return new Promise(function(resolve, reject) {
      let paramString = self._signRequest(Object.assign({}, DEFAULT_PARAMS, params));
      request({
        uri : API_BASE + paramString,
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

  _signRequest(params) {
    let ret = '';

    params['oauth_consumer_key'] = this.key;
    params['oauth_nonce'] = crypto.randomBytes(10).toString('HEX');
    params['oauth_timestamp'] = Math.floor((new Date()).getTime()/1000);

    Object
      .keys(params)
      .sort()
      .forEach(function(param) {
        let value = params[param];
        ret += '&' + param + '=' + value;
      });

    let mac = crypto.createHmac('sha1', this.secret + '&');
    mac.update('GET&' + encodeURIComponent(API_BASE) + '&' + encodeURIComponent(ret.substr(1)));
    ret += '&oauth_signature=' + encodeURIComponent(mac.digest('base64'));

    return '?' + ret.substr(1);
  }
}

module.exports = FatSecret;
