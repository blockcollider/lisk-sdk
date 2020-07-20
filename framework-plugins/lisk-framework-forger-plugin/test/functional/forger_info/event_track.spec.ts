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

import { Application } from 'lisk-framework';

import {
	closeApplication,
	createApplication,
	getForgerInfo,
	waitNBlocks,
	waitTill,
} from '../../utils/application';
import { ForgerPlugin } from '../../../src';
import { getRandomAccount } from '../../utils/accounts';
import { createTransferTransaction, createVoteTransaction } from '../../utils/transactions';

describe('Forger Info', () => {
	let app: Application;
	let accountNonce = 0;

	beforeAll(async () => {
		app = await createApplication('event_track');
	});

	afterAll(async () => {
		await closeApplication(app);
	});

	describe('New Block', () => {
		it('should save forger info after new block', async () => {
			// Arrange
			const forgerPluginInstance = app['_controller'].plugins[ForgerPlugin.alias];

			// Act
			const { generatorPublicKey } = app['_node']['_chain'].lastBlock.header;
			const forgerInfo = await getForgerInfo(forgerPluginInstance, generatorPublicKey);

			// Assert
			expect(forgerInfo).toMatchSnapshot();
		});

		it('should save forger info with received fees if payload included in new block', async () => {
			// Arrange
			const forgerPluginInstance = app['_controller'].plugins[ForgerPlugin.alias];
			const account = getRandomAccount();
			const transaction = createTransferTransaction({
				amount: '2',
				recipientAddress: account.address,
				fee: '0.3',
				nonce: accountNonce,
			});
			accountNonce += 1;

			await app['_channel'].invoke('app:postTransaction', {
				transaction: transaction.getBytes().toString('base64'),
			});
			await waitNBlocks(app, 1);

			const {
				header: { generatorPublicKey },
			} = app['_node']['_chain'].lastBlock;
			const forgerInfo = await getForgerInfo(forgerPluginInstance, generatorPublicKey);

			// Assert
			expect(forgerInfo).toMatchSnapshot();
		});

		it('should save forger info with votes received in new block', async () => {
			// Arrange
			const forgerPluginInstance = app['_controller'].plugins[ForgerPlugin.alias];
			const forgingDelegateAddress = forgerPluginInstance['_forgersList'][0].address;
			const transaction = createVoteTransaction({
				amount: '10',
				recipientAddress: forgingDelegateAddress,
				fee: '0.3',
				nonce: accountNonce,
			});
			accountNonce += 1;

			await app['_channel'].invoke('app:postTransaction', {
				transaction: transaction.getBytes().toString('base64'),
			});
			await waitNBlocks(app, 1);

			const {
				header: { generatorPublicKey },
			} = app['_node']['_chain'].lastBlock;
			const forgerInfo = await getForgerInfo(forgerPluginInstance, generatorPublicKey);

			// Assert
			expect(forgerInfo).toMatchSnapshot();
		});
	});

	describe('Delete Block', () => {
		it('should update forger info after delete block', async () => {
			// Arrange
			const { generatorPublicKey } = app['_node']['_chain'].lastBlock.header;
			const forgerPluginInstance = app['_controller'].plugins[ForgerPlugin.alias];
			await app['_node']['_processor'].deleteLastBlock();

			// Act
			await waitTill(50);
			const forgerInfo = await getForgerInfo(forgerPluginInstance, generatorPublicKey);

			// Asserts
			expect(forgerInfo).toMatchSnapshot();
		});
	});
});
