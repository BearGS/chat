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
  }

}
