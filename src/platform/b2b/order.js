import AbstractOrderProxy from '../abstract/order'


class OrderProxy extends AbstractOrderProxy {
  constructor (config, req) {
    super(config, req)
    this.config = config
  }

  create (orderData) {
      const inst = this
      return new Promise ((resolve, reject) => {
        try {
            resolve([])
        } catch (e) {
            reject(e)
        }
    })
  }
}

module.exports = OrderProxy