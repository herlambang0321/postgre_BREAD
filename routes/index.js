var express = require("express");
var router = express.Router();
var moment = require("moment");

module.exports = function (db) {
  router.get("/", function (req, res, next) {
    const { id, stringdata, integerdata, floatdata, datedata, booleandata } = req.query;

    const url = req.url == '/' ? '/?page=1' : req.url;
    const page = req.query.page || 1;
    const limit = 3;
    const offset = (page - 1) * limit;

    let params = [];

    if (id) {
      params.push(`id=${id}`);
    }

    if (stringdata) {
      params.push(`stringdata ilike '%${stringdata}%'`);
    }

    if (integerdata) {
      params.push(`integerdata=${integerdata}`);
    }

    if (floatdata) {
      params.push(`floatdata=${floatdata}`);
    }

    if (datedata) {
      params.push(`datedata='${datedata}'`);
    }

    if (booleandata) {
      params.push(`booleandata=${booleandata}`);
    }

    let sql = "select count(*) as total from breaddata";

    if (params.length > 0) {
      sql += ` where ${params.join(' and ')}`
    }

    db.query(sql, (err, data) => {
      if (err) {
        return res.send(err);
      }

      const total = data.rows[0].total;
      const pages = Math.ceil(total / limit);

      sql = `select * from breaddata`;

      if (params.length > 0) {
        sql += ` where ${params.join(' and ')}`
      }

      sql += ` limit $1 offset $2`

      db.query(sql, [limit, offset], (err, data) => {
        if (err) {
          return res.send(err);
        }
        res.render("home/list", { data: data.rows, moment: moment, page, pages, url, query: req.query });
      }
      );
    });
  });

  router.get("/add", function (req, res, next) {
    db.query('select * from breaddata', (err, data) => {
      if (err) throw err;
      res.render("home/add", { data });
    });
  });

  router.post("/add", function (req, res, next) {
    const { stringdata, integerdata, floatdata, datedata, booleandata } = req.body;
    db.query(`insert into breaddata (stringdata, integerdata, floatdata, datedata, booleandata) VALUES ('${stringdata}', ${integerdata}, ${floatdata}, '${datedata}', '${booleandata}') returning *`, (err) => {
      if (err);
      res.redirect("/");
    });
  });

  return router;
};
