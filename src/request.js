// 兼容老的nw数据回传方式
const invokeMap = new Map()
export invokeMap

export default {
  invoke (packet) {
    const { id } = packet
    const promise = new Promise((resolveInvoke, rejectInvoke) => {
      rejectInvoke = err => {
        rejectInvoke(err)
        this.handleGlobalError(err)
      }
      const clientPromise = global.__napos__sendToBrowser__(packet)
      // 兼容老的nw数据回传方式
      if (clientPromise === undefined) {
        promise.resolve = resolveInvoke
        promise.reject = rejectInvoke
        invokeMap.set(id, promise)
        return
      }
      clientPromise
        .then(res => {
          resolveInvoke(res)
        })
        .catch(err => {
          rejectInvoke(err)
        })
    })
    return promise
  },

  onError (callback) {
    this.handleGlobalError = callback
  }

  handleGlobalError (err) {
    console.log(err)
  }
}












export default class Local extends Pipe {
  constructor (beat, opts) {
    super(beat, opts)
    this.name = 'browser'
    this.timeout = opts.timeout || 10000
  }

  doOpen () {
    if (global.__napos__sendToJavascript__) {
      var _o = global.__napos__sendToJavascript__

      global.__napos__sendToJavascript__ = packet => {
        _o(packet)
        this.onData(packet)
      }
    } else {
      global.__napos__sendToJavascript__ = this.onData.bind(this)
    }
  }

  write (packet) {
    const _invoke = invokeMap[packet.id] = { count: 0 }

    _invoke.intervalID = setInterval(() => {
      _invoke.count += 1
      if (_invoke.count >= (this.timeout / 1000)) {
        this.onTimeout(packet)
      }
    }, 1000)

    if (global.__napos__sendToBrowser__ === undefined) {
      setTimeout(function () {
        global.__napos__sendToJavascript__(new RuntimeError(packet.id, null))
      }, 0)

      return
    }

    global.__napos__sendToBrowser__(packet)
  }

  onData (data) {
    debug('pipe browser got data', data)
    // clearInterval(invokeMap[data.id].intervalID);
    var id = _.get(invokeMap, [ data.id, 'intervalID' ])
    if (id) { clearInterval(id) }
    // otherwise bypass onData and handle the message
    this.onPacket(data)
  }

  onTimeout (data) {
    this.onData(new ConnectionError(data.id, '请求超时'))
  }
}
