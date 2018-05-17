import isPlainObject from 'is-plain-object'
import request, { handleResponse } from './request'
import { packet } from './utils'

export default class Chat {
  constructor (config) {
    if (typeof Chat.instance === 'object'
      && Chat.instance instanceof Chat) {
      return Chat.instance;
    }
    Object.defineProperty(Chat, 'instance', {
      value: this,
      configurable: false,
      writable: false,
    })

    this.init()
    this.config(config)
    this.request = Object.create(request)
  }

  init () {
    if (typeof global.__napos__sendToBrowser__ !== 'function') {
      throw new Error('runtime error')
    }
    // 兼容老的nw数据回传方式
    global.__napos__sendToJavascript__ = handleResponse
  }

  config (config) {
    if (!isPlainObject(config)) {
      throw new Error('config error')
    }
    this._config = config
  }

  invoke (...args) {
    return this.request.invoke(packet(this._config, ...args))
  }

  onError (callback) {
    this.request.onError(callback)
  }
}
