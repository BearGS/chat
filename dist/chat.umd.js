/*!
 * chat.js v0.0.1
 * (c) 2018-2018 xgs
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('crypto')) :
  typeof define === 'function' && define.amd ? define(['crypto'], factory) :
  (global.chat = factory(global.crypto));
}(this, (function (crypto) { 'use strict';

  crypto = crypto && crypto.hasOwnProperty('default') ? crypto['default'] : crypto;

  /*!
   * isobject <https://github.com/jonschlinkert/isobject>
   *
   * Copyright (c) 2014-2017, Jon Schlinkert.
   * Released under the MIT License.
   */

  var isobject = function isObject(val) {
    return val != null && typeof val === 'object' && Array.isArray(val) === false;
  };

  function isObjectObject(o) {
    return isobject(o) === true
      && Object.prototype.toString.call(o) === '[object Object]';
  }

  var isPlainObject = function isPlainObject(o) {
    var ctor,prot;

    if (isObjectObject(o) === false) return false;

    // If has modified constructor
    ctor = o.constructor;
    if (typeof ctor !== 'function') return false;

    // If has modified prototype
    prot = ctor.prototype;
    if (isObjectObject(prot) === false) return false;

    // If constructor does not have an Object-specific method
    if (prot.hasOwnProperty('isPrototypeOf') === false) {
      return false;
    }

    // Most likely a plain Object
    return true;
  };

  // Unique ID creation requires a high quality random # generator.  In node.js
  // this is pretty straight-forward - we use the crypto API.



  var rng = function nodeRNG() {
    return crypto.randomBytes(16);
  };

  /**
   * Convert array of 16 byte values to UUID string format of the form:
   * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
   */
  var byteToHex = [];
  for (var i = 0; i < 256; ++i) {
    byteToHex[i] = (i + 0x100).toString(16).substr(1);
  }

  function bytesToUuid(buf, offset) {
    var i = offset || 0;
    var bth = byteToHex;
    return bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]];
  }

  var bytesToUuid_1 = bytesToUuid;

  function v4(options, buf, offset) {
    var i = buf && offset || 0;

    if (typeof(options) == 'string') {
      buf = options === 'binary' ? new Array(16) : null;
      options = null;
    }
    options = options || {};

    var rnds = options.random || (options.rng || rng)();

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
      for (var ii = 0; ii < 16; ++ii) {
        buf[i + ii] = rnds[ii];
      }
    }

    return buf || bytesToUuid_1(rnds);
  }

  var v4_1 = v4;

  var defaultConfig = {
    ncp: '1.0.0',
    timeout: 10000
  };

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  /* eslint no-shadow: 0 */

  function filter() {
    var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var options = arguments[1];

    var keys = void 0;
    if (typeof keys === 'string') keys = options.split(/ +/);
    return keys.reduce(function (ret, key) {
      if (obj[key] == null) return ret;
      ret[key] = obj[key];
      return ret;
    }, {});
  }
  function resolvedAsNcp() {
    var packet = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return isPlainObject(packet.result) && !packet.error;
  }

  function packet() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultConfig;
    var method = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    return _extends({}, filter(config), filter(options), {
      id: v4_1(),
      params: params,
      method: method
    });
  }

  // 兼容老的nw数据回传方式
  var invokeMap = new Map();

  // 兼容老的nw数据回传方式
  function handleResponse() {
    var packet$$1 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var _packet$id = packet$$1.id,
        id = _packet$id === undefined ? '' : _packet$id;

    var promise = invokeMap.get(id);
    if (!id || !promise) {
      throw new Error('receive packet error');
    }

    var resolved = resolvedAsNcp(packet$$1);
    if (resolved) {
      promise.resolve(packet$$1);
    } else {
      promise.reject(packet$$1);
    }

    invokeMap.delete(id);
  }

  function invokePromise(sourcePromise, packet$$1) {
    var _this = this;

    var promise = new Promise(function (resolveInvoke, reject) {
      var rejectInvoke = function rejectInvoke(err) {
        reject(err);
        _this.handleGlobalError(err);
      };
      promise.resolve = resolveInvoke;
      promise.reject = rejectInvoke;

      if (Object.toString.call(sourcePromise) === 'Promise') {
        sourcePromise.then(function (res) {
          resolveInvoke(res);
        }).catch(function (err) {
          rejectInvoke(err);
        });
        return;
      }

      invokeMap.set(packet$$1.id, promise);
    });

    setTimeout(function () {
      invokeMap.delete(packet$$1.id);
      promise.reject(new Error('timeout error'));
    }, packet$$1.timeout);

    return promise;
  }

  var request = {
    invoke: function invoke(packet$$1) {
      var sourcePromise = global.__napos__sendToBrowser__(packet$$1);
      return invokePromise(sourcePromise, packet$$1);
    },
    onError: function onError(callback) {
      this.handleGlobalError = callback;
    },
    handleGlobalError: function handleGlobalError() {}
  };

  // export default class Local extends Pipe {
  //   constructor (beat, opts) {
  //     super(beat, opts)
  //     this.name = 'browser'
  //     this.timeout = opts.timeout || 10000
  //   }
  // 
  //   doOpen () {
  //     if (global.__napos__sendToJavascript__) {
  //       var _o = global.__napos__sendToJavascript__
  // 
  //       global.__napos__sendToJavascript__ = packet => {
  //         _o(packet)
  //         this.onData(packet)
  //       }
  //     } else {
  //       global.__napos__sendToJavascript__ = this.onData.bind(this)
  //     }
  //   }
  // 
  //   write (packet) {
  //     const _invoke = invokeMap[packet.id] = { count: 0 }
  // 
  //     _invoke.intervalID = setInterval(() => {
  //       _invoke.count += 1
  //       if (_invoke.count >= (this.timeout / 1000)) {
  //         this.onTimeout(packet)
  //       }
  //     }, 1000)
  // 
  //     if (global.__napos__sendToBrowser__ === undefined) {
  //       setTimeout(function () {
  //         global.__napos__sendToJavascript__(new RuntimeError(packet.id, null))
  //       }, 0)
  // 
  //       return
  //     }
  // 
  //     global.__napos__sendToBrowser__(packet)
  //   }
  // 
  //   onData (data) {
  //     debug('pipe browser got data', data)
  //     // clearInterval(invokeMap[data.id].intervalID);
  //     var id = _.get(invokeMap, [ data.id, 'intervalID' ])
  //     if (id) { clearInterval(id) }
  //     // otherwise bypass onData and handle the message
  //     this.onPacket(data)
  //   }
  // 
  //   onTimeout (data) {
  //     this.onData(new ConnectionError(data.id, '请求超时'))
  //   }
  // }

  var Chat = function () {
    function Chat(config) {
      classCallCheck(this, Chat);

      if (_typeof(Chat.instance) === 'object' && Chat.instance instanceof Chat) {
        return Chat.instance;
      }
      Object.defineProperty(Chat, 'instance', {
        value: this,
        configurable: false,
        writable: false
      });

      this.init();
      this.config(config);
      this.request = Object.create(request);
    }

    createClass(Chat, [{
      key: 'init',
      value: function init() {
        if (typeof global.__napos__sendToBrowser__ !== 'function') {
          throw new Error('runtime error');
        }
        // 兼容老的nw数据回传方式
        global.__napos__sendToJavascript__ = handleResponse;
      }
    }, {
      key: 'config',
      value: function config(_config) {
        if (!isPlainObject(_config)) {
          throw new Error('config error');
        }
        this._config = _config;
      }
    }, {
      key: 'invoke',
      value: function invoke() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return this.request.invoke(packet.apply(undefined, [this._config].concat(args)));
      }
    }, {
      key: 'onError',
      value: function onError(callback) {
        this.request.onError(callback);
      }
    }]);
    return Chat;
  }();

  return Chat;

})));
