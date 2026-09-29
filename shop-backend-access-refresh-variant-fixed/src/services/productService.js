const Model = require("../models/Product");
const Variant = require("../models/ProductVariant");
const AppError = require("../utils/AppError");
const escapeRegex = require("../utils/escapeRegex");
const variantService = require("./variantService");

const crud = require("./crudService").make(Model, {
  populate: [
    {
      path: "category",
    },
    {
      path: "brand",
    },
  ],
});

/**
 * =========================================================
 * LIST PRODUCTS
 * =========================================================
 *
 * GET /api/products
 *
 * Hỗ trợ:
 *
 * ?page=1
 * ?limit=20
 * ?search=iphone
 * ?category=CATEGORY_ID
 * ?brand=BRAND_ID
 * ?status=active
 * ?featured=true
 */
exports.list = async (query = {}) => {
  const filter = {};

  /*
   * CATEGORY
   */
  if (query.category) {
    filter.category = query.category;
  }

  /*
   * BRAND
   */
  if (query.brand) {
    filter.brand = query.brand;
  }

  /*
   * STATUS
   */
  if (query.status) {
    filter.status = query.status;
  }

  /*
   * FEATURED
   */
  if (query.featured !== undefined) {
    filter.featured = query.featured === true || query.featured === "true";
  }

  /*
   * HAS VARIANTS
   */
  if (query.hasVariants !== undefined) {
    const productIds = await Variant.distinct("product");
    filter._id = query.hasVariants === true || query.hasVariants === "true"
      ? { $in: productIds }
      : { $nin: productIds };
  }

  /*
   * SEARCH
   */
  if (query.search) {
    const re = { $regex: escapeRegex(query.search), $options: "i" };
    const variantProducts = await Variant.find({ $or: [{ sku: re }, { barcode: re }] }).distinct("product");
    filter.$or = [
      { name: re },
      { slug: re },
      { _id: { $in: variantProducts } },
    ];
  }

  return crud.list(filter, query);
};

/**
 * =========================================================
 * GET PRODUCT DETAIL
 * =========================================================
 *
 * GET /api/products/:id
 */
exports.get = async (id) => {
  return crud.get(id);
};

/**
 * =========================================================
 * CREATE PRODUCT
 * =========================================================
 *
 * POST /api/products
 */
exports.create = async (data) => {
  const { variant, ...productData } = data || {};
  if (!variant || variant.price === undefined || variant.price === null || Number(variant.price) < 0) {
    throw new AppError("Sản phẩm phải có ít nhất 1 Variant và Variant phải có giá bán.", 400);
  }
  if (!productData.category) throw new AppError("Sản phẩm phải có danh mục.", 400);

  let product;
  try {
    product = await crud.create(productData);
    await variantService.create({ ...variant, product: product._id });
    return product;
  } catch (error) {
    if (product?._id) await Model.findByIdAndDelete(product._id).catch(() => {});
    throw error;
  }
};

/**
 * =========================================================
 * UPDATE PRODUCT
 * =========================================================
 *
 * PATCH /api/products/:id
 */
exports.update = async (id, data) => {
  const { variant, ...productData } = data || {};
  const product = await crud.update(id, productData);

  if (variant) {
    const variantId = variant._id;
    if (variantId) {
      const current = await Variant.findOne({ _id: variantId, product: product._id });
      if (!current) throw new AppError("Variant không thuộc sản phẩm này.", 400);
      const { _id, ...variantData } = variant;
      await variantService.update(variantId, { ...variantData, product: product._id });
    } else {
      await variantService.create({ ...variant, product: product._id });
    }
  }

  const count = await Variant.countDocuments({ product: product._id });
  if (count < 1) throw new AppError("Sản phẩm phải luôn có ít nhất 1 Variant.", 400);
  return product;
};

/**
 * =========================================================
 * DELETE PRODUCT
 * =========================================================
 *
 * DELETE /api/products/:id
 */
exports.remove = async (id) => {
  const product = await crud.remove(id);
  await Variant.deleteMany({ product: product._id });
  return product;
};
