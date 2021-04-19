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

import { KeywordDefinition, SchemaObjCxt } from 'ajv';
import { AnySchemaObject, CompileKeywordFunc } from 'ajv/dist/types';
import * as createDebug from 'debug';
import { LiskValidationError } from '../errors';

const debug = createDebug('codec:keyword:fieldNumber');

export const metaSchema = {
	title: 'Lisk Codec Field Number',
	type: 'number',
	minimum: 1,
	maximum: 18999,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const deepValue = (obj: object, path: string): any => {
	const parts = path.split('.');
	const len = parts.length;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let result: any = obj;

	for (let i = 0; i < len; i += 1) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
		result = result[parts[i]];
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return result;
};

const compile: CompileKeywordFunc = (
	value: any,
	parentSchema: AnySchemaObject,
	it: SchemaObjCxt,
) => {
	debug('compile: schema: %i', value);
	debug('compile: parent schema: %j', parentSchema);

	const parentPath: string[] = it.schemaPath.str.split('.');
	parentPath.shift();
	parentPath.pop();
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const parentSchemaObject: {
		[key: string]: { fieldNumber: number };
	} = deepValue(it.schemaEnv.schema as object, parentPath.join('.'));

	const fieldNumbers: number[] = Object.keys(parentSchemaObject).map(
		(key: string) => parentSchemaObject[key].fieldNumber,
	);
	const uniqueFieldNumbers = [...new Set(fieldNumbers)];

	if (fieldNumbers.length !== uniqueFieldNumbers.length) {
		throw new LiskValidationError([
			{
				keyword: 'fieldNumber',
				message: 'Value must be unique across all properties on same level',
				params: { fieldNumbers },
				instancePath: '',
				schemaPath: it.schemaPath.str,
			},
		]);
	}

	return () => true;
};

export const fieldNumberKeyword: KeywordDefinition = {
	keyword: 'fieldNumber',
	compile,
	valid: true,
	errors: false,
	modifying: false,
	metaSchema,
};
