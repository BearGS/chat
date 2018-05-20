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

