/* eslint no-shadow: 0 */
/* eslint no-param-reassign: 0 */
import v4 from 'uuid/v4'
import isPlainObject from 'is-plain-object'
import {defaultConfig } from './constants'

export function filter (obj = {}, options){
  let keys
  if ( typeof keys === 'string')  keys = options.split(/ +/)
  return keys.reduce((ret, key) => {
    if (obj[key] == null) return ret
    ret[key] = obj[key]
    return ret
  }, {})
}
export function resolvedAsNcp (packet = {}) {
  return (
    isPlainObject(packet.result)
    && !packet.error
  )
}

export function packet (
  config = defaultConfig,
  method = '',
  params = {},
  options = {},
) {
  return {
    ...filter(config),
    ...filter(options),
    id: v4(),
    params,
    method,
  }
}

