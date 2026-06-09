/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {string} orderNumber
 * @property {'pending'|'confirmed'|'processing'|'shipped'|'delivered'|'cancelled'|'refunded'} status
 * @property {OrderItem[]} items
 * @property {ShippingAddress} shippingAddress
 * @property {number} subtotal
 * @property {number} shippingCost
 * @property {number} discount
 * @property {number} total
 * @property {string} createdAt
 */

/**
 * @typedef {Object} OrderItem
 * @property {string} id
 * @property {Product} product
 * @property {number} quantity
 * @property {number} price
 */

/**
 * @typedef {Object} ShippingAddress
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} address
 * @property {string} city
 * @property {string} postalCode
 * @property {string} phone
 */
