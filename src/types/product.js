/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {string} description
 * @property {number} price
 * @property {number} comparePrice
 * @property {number} stock
 * @property {string[]} images
 * @property {Category} category
 * @property {boolean} isActive
 * @property {number} rating
 * @property {number} reviewCount
 * @property {ProductVariant[]} variants
 */

/**
 * @typedef {Object} ProductVariant
 * @property {string} id
 * @property {string} name
 * @property {string} value
 * @property {number} price
 * @property {number} stock
 */

/**
 * @typedef {Object} Category
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {string} image
 * @property {Category[]} children
 */
