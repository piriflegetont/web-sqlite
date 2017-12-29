'use strict';

function _createItem(id, data) {}

function _readItem(id) {}

function _updateItem(id, data) {}

function _deleteItem(id) {}

class DataSource {
	constructor(self) {

	}

	connect(name) {
		return this._connect(name);
	};

	createItem(id, data) {
		return this._createItem(id, data);
	};

	readItem(name, id) {
		return this._readItem(name, id);
	};

	updateItem(name, id, data) {
		return this._updateItem(name, id, data);
	};

	deleteItem(name, id) {
		return this._deleteItem(name, id);
	}

	getList(name) {
		return this._getList(name);
	};
}


module.exports = DataSource;