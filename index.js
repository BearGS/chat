// const __napos__sendToBrowser__ = global.__napos__sendToBrowser__
import v4 from 'uuid/v4'
import request, { invokeMap } from './request'
import { resolvedAsNcp, packet } from './utils'

export default class Chat {
  constructor () {
    if (typeof Chat.instance === 'object'
      && Chat.instance instanceof Chat) {
      return Chat.instance;
    }
    Reflect.defineProperty(Chat, 'instance', {
      value: this,
      configurable: false,
      writable: false,
    })

    this.init()
    this.request = Object.create(request)
  }

  init () {
    if (typeof global.__napos__sendToBrowser__ !== 'function') {
      throw new Error('runtime error')
    }
    // 兼容老的nw数据回传方式
    global.__napos__sendToJavascript__ = this.onData.bind(this)
  }

  // 兼容老的nw数据回传方式
  onData (packet = {}) {
    const { id } = packet
    if (!id) {
      throw new Error('receive packet error')
    }
    const promise = invokeMap.get(id)
    if (!promise) {
      throw new Error('receive packet error')
    }
    resolvedAsNcp(packet)
      ? promise.resolve(packet)
      : promise.reject(packet)
    invokeMap.delete(id)
  }

  invoke (...args) {
    return this.request.invoke(packet(...args))
  }

  onError (callback) {
    this.request.onError(callback)
  }
}
