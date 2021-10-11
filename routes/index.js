var express = require("express");
var router = express.Router();
var moment = require('moment');

module.exports = function (db) {
  router.get("/", function (req, res, next) {
    db.query("select * from breaddata", (err, data) => {
      if (err) {
        return res.send(err)
      }
      res.render("home/list", { data: data.rows, moment: moment });
    });
  });

  return router;
};
