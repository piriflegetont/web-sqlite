'use strict';
let sqlite = require('sqlite');
let dbInterface = require('../dataSource');
let fs = require('fs');


class Sqlite extends dbInterface {
	constructor() {
		super();
		let _this = this;
		this._connect = async (name) => {
			return await sqlite.open(name, {Promise});
		};
		this._createItem = async (name, data) => {
			data = data || {};
			let db = _this.db;
			if (typeof db === 'undefined') {
				db = await _this.connect('./1.db');
			}
			let meta = fs.readFileSync('./meta/' + name + '.json');
			meta = JSON.parse(meta);
			let sql = 'INSERT INTO ' + meta.name + ' (';
			let values = '';
			meta.attr.forEach((item, index) => {
				sql += item.name;
				if (typeof data[item.name] === 'undefined') {
					values += 'null';
					return;
				}
				if (item.type === 'text') {
					values += '"' + data[item.name] + '"';
				} else {
					values += data[item.name];
				}
				if (index !== meta.attr.length - 1) {
					sql += ', ';
					values += ', ';
				}
			});
			sql += ') VALUES (' + values + ');';
			console.log(sql);
			await db.run(sql);
			db.close();
		};
		this._readItem = async (name, id) => {
			let db = _this.db;
			if (typeof db === 'undefined') {
				db = await _this.connect('./1.db');
			}
			let meta = fs.readFileSync('./meta/' + name + '.json');
			meta = JSON.parse(meta);
			let sql = 'SELECT * FROM ' + meta.name + ' WHERE id=(' + id + ')';
			let result;
			result = await db.each(sql);
			db.close();
			if (result) {
				return result;
			}
		};
		this._updateItem = async (name, id, data) => {
			let db = _this.db;
			if (typeof db === 'undefined') {
				db = await _this.connect('./1.db');
			}
			let meta = fs.readFileSync('./meta/' + name + '.json');
			meta = JSON.parse(meta);
			let sql = 'UPDATE ' + meta.name + ' ';
			let value = '';
			meta.attr.forEach((item, index) => {
				if (typeof data[item.name] !== 'undefined') {
					if (value.length !== 0) {
						value += ', '
					}
					if (item.type === 'text') {
						value += item.name + '= "' + data[item.name] + '"';
					} else {
						value += item.name + '= ' + data[item.name];
					}
				}
			});
			sql += 'SET ' + value + ' WHERE id=' + id + ';';
			await db.run(sql);
			db.close();
		};
		this._deleteItem = async (name, id) => {
			let db = _this.db;
			if (typeof db === 'undefined') {
				db = await _this.connect('./1.db');
			}
			let meta = fs.readFileSync('./meta/' + name + '.json');
			meta = JSON.parse(meta);
			let sql = 'DELETE FROM ' + meta.name + ' WHERE id=(' + id + ')';
			let maxSql = 'SELECT MAX(id) FROM ' + meta.name + ';';
			await db.run(sql);
			db.close();
		};
		this._getList = async (name) => {
			let db = _this.db;
			if (typeof db === 'undefined') {
				db = await _this.connect('./1.db');
			}
			let meta = fs.readFileSync('./meta/' + name + '.json');
			meta = JSON.parse(meta);
			let sql = 'SELECT ';
			let joinSql = '';
			meta.attr.forEach((item, index) => {
				if (index !== 0) {
					sql += ', ';
				}
				if (item.type === 'ref') {
					sql += item.src + '.' + item.srcAttr;
					joinSql += ' LEFT OUTER JOIN ' + item.src + ' ON ' + '(' + meta.name + '.' + item.name + ' = ' + item.src + '.id)'
				} else if (item.type === 'id') {
					sql += meta.name + '.' + item.name;
				} else {
					sql += item.name;
				}
			});
			sql += ' FROM ' + meta.name;
			sql += joinSql;
			sql += ';';
			let array = [];
			await db.each(sql, [], (err, row) => {
				if (err) {
					console.log(err);
				}
				array.push(row);
			});
			db.close();
			return array;
		}
	}
}

module.exports = Sqlite;