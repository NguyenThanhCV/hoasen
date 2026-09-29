const Model = require("../models/OrderItem"),
  crud = require("./crudService").make(Model, {
    populate: ["order", "product", "variant"],
  });
module.exports = crud;
