'use strict';

const crypto              = require('crypto');
const request             = require('request');
const API_BASE            = 'http://platform.fatsecret.com/rest/server.api';
const OAUTH_REQUEST_TOKEN = 'http://www.fatsecret.com/oauth/request_token';
const OAUTH_ACESS_TOKEN   = 'http://www.fatsecret.com/oauth/access_token';

const DEFAULT_PARAMS = {
  format                : 'json',
  oauth_version         : '1.0',
  oauth_signature_method: 'HMAC-SHA1'
};

class FatSecret {
  constructor(key, secret) {
    this.key    = key;
    this.secret = secret;
  }

  /**
   * Use this function to call any fatsecret api method. Refer to their api docs on what params to pass
   * @param methodToCall
   * @param args
   * @returns {Promise}
   */
  method(methodToCall, args) {
    args.method = methodToCall;
    return this._doRequest(args)
  }

  /**
   * Set the users token and secret to use for future calls.
   * @param token
   * @param secret
   * @returns {FatSecret}
   */
  setUserAuth(token, secret) {
    this.user_token  = token;
    this.user_secret = secret;

    return this;
  }

  /**
   * Generate an oauth permission request url. Uses oob option instead of a redirect.
   * @returns {string}
   */
  getOauthUrl() {
    let params = {
      oauth_nonce           : crypto.randomBytes(10).toString('HEX'),
      oauth_version         : '1.0',
      oauth_callback        : 'oob',
      oauth_timestamp       : Math.floor((new Date()).getTime() / 1000),
      oauth_consumer_key    : this.key,
      oauth_signature_method: 'HMAC-SHA1'
    };
    return this._signRequest(OAUTH_REQUEST_TOKEN, params);
  }

  /**
   * Get a token and secret for a user given an oob code
   * @param token
   * @param secret
   * @param code
   * @returns {string}
   */
  getAccessToken(token, secret, code) {
    let params = {
      oauth_token           : token,
      oauth_nonce           : crypto.randomBytes(10).toString('HEX'),
      user_secret           : secret,
      oauth_version         : '1.0',
      oauth_verifier        : code,
      oauth_timestamp       : Math.floor((new Date()).getTime() / 1000),
      oauth_consumer_key    : this.key,
      oauth_signature_method: 'HMAC-SHA1'
    };
    return this._signRequest(OAUTH_ACESS_TOKEN, params);
  }

  /**
   * Perform the request to fatsecret with default params merged in.
   * @param params
   * @returns {Promise}
   * @private
   */
  _doRequest(params) {
    return new Promise((resolve, reject) => {
      request({
        uri : this._signRequest(API_BASE, Object.assign({}, DEFAULT_PARAMS, params)),
        json: true
      }, function (err, response, body) {
        if (err) {
          reject(err);
        } else {
          resolve(body);
        }
      });
    });
  }

  /**
   * Calculates and appends the signature hash to the query params
   * @param baseUrl
   * @param params
   * @returns {string}
   * @private
   */
  _signRequest(baseUrl, params) {
    let qs     = '';
    let secret = this.secret + '&';

    params['oauth_nonce']        = crypto.randomBytes(10).toString('HEX');
    params['oauth_timestamp']    = Math.floor((new Date()).getTime() / 1000);
    params['oauth_consumer_key'] = this.key;

    // if we have user auth info, add it to the request
    if (this.user_token) {
      params['oauth_token'] = this.user_token;
    }

    // if a user secret was passed in or set, add it to the secret for the hmac
    if (params.user_secret) {
      secret += params.user_secret;
      delete params.user_secret;
    } else if (this.user_secret) {
      secret += this.user_secret;
    }

    // build the sorted key value pair string that will be used for the hmac and request
    Object
      .keys(params)
      .sort()
      .forEach(param => qs += '&' + param + '=' + encodeURIComponent(params[param]));

    //remove first &
    qs = qs.substr(1);

    // generate the hmac
    let mac = crypto.createHmac('sha1', secret);
    mac.update('GET&' + encodeURIComponent(baseUrl) + '&' + encodeURIComponent(qs));

    // add the generated signature to the request params and return it
    qs = baseUrl + '?' + qs + '&oauth_signature=' + encodeURIComponent(mac.digest('base64'));
    return qs;
  }
}

module.exports = FatSecret;
