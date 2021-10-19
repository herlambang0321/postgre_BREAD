const { query } = require("express");
var express = require("express");
var router = express.Router();
var moment = require("moment");

module.exports = function (db) {
  router.get("/", function (req, res, next) {
    const { id, stringdata, integerdata, floatdata, datedata, booleandata, checkid, checkstring, checkinteger, checkfloat, checkdate, checkboolean } = req.query;

    const url = req.url == '/' ? '/?page=1' : req.url;
    const page = req.query.page || 1;
    const limit = 3;
    const offset = (page - 1) * limit;

    let params = [];

    if (id && checkid) {
      params.push(`id=${id}`);
    }

    if (stringdata && checkstring) {
      params.push(`stringdata ilike '%${stringdata}%'`);
    }

    if (integerdata && checkinteger) {
      params.push(`integerdata=${integerdata}`);
    }

    if (floatdata && checkfloat) {
      params.push(`floatdata=${floatdata}`);
    }

    if (datedata && checkdate) {
      params.push(`datedata='${datedata}'`);
    }

    if (booleandata && checkboolean) {
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

      sql = `select * from breaddata order by id`;

      if (params.length > 0) {
        sql = `select * from breaddata`
        sql += ` where ${params.join(' and ')} order by id`
      }

      sql += ` limit $1 offset $2`

      db.query(sql, [limit, offset], (err, data) => {
        if (err) {
          return res.send(err);
        }
        res.render("home/list", { data: data.rows, moment: moment, page, pages, url, query: req.query });
        console.log(url, req.query)
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
    db.query(`insert into breaddata (stringdata, integerdata, floatdata, datedata, booleandata) VALUES ('${stringdata}', ${integerdata}, ${floatdata}, '${datedata}', ${booleandata}) returning *`, (err) => {
      if (err);
      res.redirect("/");
    });
  });

  router.get("/edit/:id", function (req, res, next) {
    const id = req.params.id;
    db.query(`select * from breaddata where id = ${id}`, (err, data) => {
      if (err) throw err;
      res.render("home/edit", { item: data.rows[0], moment: moment });
    });
  });

  router.post("/edit/:id", function (req, res, next) {
    const id = req.params.id;
    const { stringdata, integerdata, floatdata, datedata, booleandata } = req.body;
    db.query(`update breaddata set stringdata='${stringdata}', integerdata=${integerdata}, floatdata=${floatdata}, datedata='${datedata}', booleandata=${booleandata} where id=${id} returning *`, (err) => {
      if (err);
      res.redirect("/");
    });
  });

  return router;
};
