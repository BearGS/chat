import { resolvedAsNcp } from './utils'

// 兼容老的nw数据回传方式
const invokeMap = new Map()

// 兼容老的nw数据回传方式
export function handleResponse (packet = {}) {
  const { id = '' } = packet
  const promise = invokeMap.get(id)
  if (!id || !promise) {
    throw new Error('receive packet error')
  }

  const resolved = resolvedAsNcp(packet)
  if ( resolved ) {
    promise.resolve(packet)
  } else {
    promise.reject(packet)
  }

  invokeMap.delete(id)
}

export function invokePromise(sourcePromise, packet) {
  const promise = new Promise((resolveInvoke, reject) => {
    const rejectInvoke = err => {
      reject(err)
      this.handleGlobalError(err)
    }
    promise.resolve = resolveInvoke
    promise.reject = rejectInvoke

    if (Object.toString.call(sourcePromise) === 'Promise') {
      sourcePromise
        .then(res => {
          resolveInvoke(res)
        })
        .catch(err => {
          rejectInvoke(err)
        })
      return
    }

    invokeMap.set(packet.id, promise)
  })

  setTimeout(() => {
    invokeMap.delete(packet.id)
    promise.reject(new Error('timeout error'))
  }, packet.timeout)

  return promise
}

export default {
  invoke (packet) {
    const sourcePromise = global.__napos__sendToBrowser__(packet)
    return invokePromise(sourcePromise, packet)
  },

  onError (callback) {
    this.handleGlobalError = callback
  },

  handleGlobalError () {},
}

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
