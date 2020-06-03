/*
 * Copyright © 2020 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const { Suite } = require('benchmark');

const delSuite = async (ldb, rdb, { key, value }) => {
	const suite = new Suite();
	await ldb.put(key, value);
	await rdb.put(key, value);

	suite
		.add(`LevelUP: del(string):Buffer x ${value.length}(bytes)`, async () => {
			await ldb.del(key);
		})
		.add(`RocksDB: del(string):Buffer x ${value.length}(bytes)`, async () => {
			await rdb.del(key);
		})
		.on('cycle', event => {
			console.log(String(event.target));
		})
		.on('complete', async function() {
			console.log('Fastest is ' + this.filter('fastest').map('name'));
			await ldb.clear();
			await rdb.clear();
		})
		.run({ async: true });
};

module.exports.delSuite = delSuite;
