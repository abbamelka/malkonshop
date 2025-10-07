const BaseRepository = require('./baseRepository');
const { ProductVariant } = require('../models');

class ProductVariantRepository extends BaseRepository {
  constructor() {
    super(ProductVariant);
  }

  async findVariantsByProduct(productId, options = {}) {
    return await this.findAll({
      where: { productId, isActive: true },
      ...options
    });
  }

  async updateVariantStock(variantId, quantity, options = {}) {
    return await this.update(variantId, { quantity }, options);
  }

  async findVariantByOptions(productId, options, variantId = null) {
    const where = {
      productId,
      options
    };

    if (variantId) {
      where.id = { [Op.ne]: variantId };
    }

    return await this.findOne(where);
  }
}

module.exports = ProductVariantRepository;