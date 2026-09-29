const Banner = require("../models/Banner");

exports.listPublished = async (pageKey) => {
  const now = new Date();
  return Banner.find({
    pageKey,
    status: "active",
    $and: [
      { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
    ],
  }).sort({ sortOrder: 1, createdAt: 1 });
};
