const asyncHandler = require("../utils/asyncHandler");
exports.make = (service, opts = {}) => ({
  list: asyncHandler(async (req, res) =>
    res.json({
      success: true,
      ...(await service.list(opts.filter ? opts.filter(req) : {}, req.query)),
    }),
  ),
  get: asyncHandler(async (req, res) =>
    res.json({
      success: true,
      data: await service.get(
        req.params.id,
        opts.getFilter ? opts.getFilter(req) : {},
      ),
    }),
  ),
  create: asyncHandler(async (req, res) =>
    res
      .status(201)
      .json({
        success: true,
        data: await service.create(
          opts.createData ? opts.createData(req) : req.body,
        ),
      }),
  ),
  update: asyncHandler(async (req, res) =>
    res.json({
      success: true,
      data: await service.update(
        req.params.id,
        opts.updateData ? opts.updateData(req) : req.body,
        opts.getFilter ? opts.getFilter(req) : {},
      ),
    }),
  ),
  remove: asyncHandler(async (req, res) =>
    res.json({
      success: true,
      data: await service.remove(
        req.params.id,
        opts.getFilter ? opts.getFilter(req) : {},
      ),
    }),
  ),
});
