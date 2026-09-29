const Model = require("../models/Category"),
  crud = require("./crudService").make(Model, {
    populate: [{ path: "parent", select: "name slug" }],
  });
module.exports = crud;
