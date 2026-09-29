const Model = require("../models/Brand"),
  crud = require("./crudService").make(Model);
module.exports = crud;
