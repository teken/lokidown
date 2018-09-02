import { AbstractLevelDOWN } from 'abstract-leveldown';
import Loki from 'lokijs';

export default class LokiDown extends AbstractLevelDOWN {
	constructor(path, options) {
		super();
		this.loki = new Loki(path, dbOptions);
		this.collectionName = 'collectionname';
	}

	get collection() {
		this.loki.getCollection(this.collectionName)
	}

	_open(options, callback) {
		if (options.createIfMissing && !this.loki) {
			this.loki.loadDatabase({}, callback)
		} else if (options.errorIfExists && this.loki) {
			callback(new Error('AlreadyExists'))
		}
	}

	_close(callback) {
		if (this.loki) this.loki.close(callback);
	}

	_serializeKey(key) {
		return String(key);
	}

	_serializeValue(value) {
		switch (typeof value) {
			case 'string':
				return value;

			case 'number':
			case 'boolean':
				return String(value);

			default:
			case 'object':
				return JSON.stringify(value);
		}
	}

	_get(key, options, callback) {
		const result = this.collection.findOne({ key: key });
		if (result) callback(null, result);
		else callback(new Error('NotFound'));
	}

	_put(key, value, options, callback) {
		const result = this.collection.insert({
			key: key,
			value: value,
		});
		if (result) callback();
		else callback(new Error('PutFailed'));
	}

	_del(key, options, callback) {
		const result = this.collection.findAndRemove({ key: key });
		if (result) callback();
		else callback(new Error('NotFound'));
	}
}