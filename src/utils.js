import isPlainObject from 'is-plain-object'

export function ResolvedAsNcp (packet = {}) {
  return (
    isPlainObject(packet.result)
    && !packet.error
  )
}

export function packet (method, params) {
  return {
    id: v4(),
    ncp: '1.0.0', // 兼容nw
    method,
    params,
  }
}
