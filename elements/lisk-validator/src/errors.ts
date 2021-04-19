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

// Ajv.ErrorObject makes `schemaPath` and `dataPath` required
// While these are not if we want to infer default values from validation

export interface ErrorObject {
	keyword: string;
	instancePath?: string;
	schemaPath?: string;
	params: ErrorParams;
	// Added to validation errors of propertyNames keyword schema
	propertyName?: string;
	// Excluded if messages set to false.
	message?: string;
	// These are added with the `verbose` option.
	schema?: never;
	parentSchema?: object;
	data?: never;
}

interface ErrorParams {
	[key: string]: unknown;
}

const errorParamToString = (param: string | Buffer | BigInt | undefined | unknown): string => {
	let paramAsString = '';
	if (typeof param === 'bigint') {
		paramAsString = param.toString();
	} else if (Buffer.isBuffer(param)) {
		paramAsString = param.toString('hex');
	} else if (param === undefined) {
		paramAsString = '';
	} else {
		paramAsString = param as string;
	}
	return paramAsString;
};

type KeywordFormatterFunction = (error: ErrorObject) => string;

interface KeywordDataFormatters {
	[key: string]: KeywordFormatterFunction | undefined;
}

const errorFormatterMap: KeywordDataFormatters = {
	type: error =>
		`Property '${error.instancePath ?? ''}' should be of type '${errorParamToString(
			error.params.type,
		)}'`,
	additionalProperties: error =>
		`Property '${error.instancePath ?? ''}' has extraneous property '${errorParamToString(
			error.params.additionalProperty,
		)}'`,
	minLength: error => `Property '${error.instancePath ?? ''}' ${errorParamToString(error.message)}`,
	maxLength: error => `Property '${error.instancePath ?? ''}' ${errorParamToString(error.message)}`,
	format: error => `Property '${error.instancePath ?? ''}' ${errorParamToString(error.message)}`,
	required: error => `Missing property, ${errorParamToString(error.message)}`,
	dataType: error => `Property '${error.instancePath ?? ''}' ${errorParamToString(error.message)}`,
};

const defaultErrorFormatter: KeywordFormatterFunction = error =>
	error.message ?? 'Unspecified validator error';

const errorFormatter = (error: ErrorObject): string =>
	(errorFormatterMap[error.keyword] ?? defaultErrorFormatter)(error);

export class LiskValidationError extends Error {
	public readonly errors: ErrorObject[];

	public constructor(errors: ErrorObject[]) {
		super();

		this.errors = errors;
		this.message = `Lisk validator found ${
			this.errors.length
		} error[s]:\n${this._compileErrors().join('\n')}`;
	}

	private _compileErrors(): string[] {
		const errorMsgs = this.errors.map(errorFormatter);
		return errorMsgs;
	}
}
