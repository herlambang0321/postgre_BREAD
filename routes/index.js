var express = require("express");
var router = express.Router();
var moment = require("moment");

module.exports = function (db) {
  router.get("/", function (req, res, next) {
    const page = req.query.page || 1;
    const limit = 3;

    db.query("select count(*) as total from breaddata", (err, data) => {
      if (err) {
        return res.send(err);
      }
      const total = data.rows[0].total;
      const offset = (page - 1) * limit;
      const pages = Math.ceil(total / limit);

      db.query(
        `select * from breaddata limit $1 offset $2`, [limit, offset], (err, data) => {
          if (err) {
            return res.send(err);
          }
          res.render("home/list", { data: data.rows, moment: moment, page, pages });
        }
      );
    });
  });

  return router;
};
