/*
	FileName: MapControllers.ts
	Written By: Nikita Nikolaevich Petko
	File Type: Module
	Description: Looks in a given folder for files that match the structure.

	All commits will be made on behalf of mfd-co to https://github.com/mfd-core/sitetest4.robloxlabs.com

	***

	Copyright 2015-2020 MFD

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

	https://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.

	***
*/

import { Express as IApplicationBuilder, Request, Response } from 'express-serve-static-core';
import { FASTLOG2, FASTLOG3, FASTLOG4, FASTLOG6, FLog } from '../Helpers/WebHelpers/Roblox.Util/Roblox.Util.FastLog';
import { _dirname } from '../Helpers/Constants/Directories';
import { walk } from '../Helpers/WebHelpers/Roblox.Util/Roblox.FileWalker';
import filestream from 'fs';

interface EndpointOpts {
	path?: string;
	logSetups?: boolean;
	apiName?: string;
}
const MapControllers = (app?: IApplicationBuilder, opts?: EndpointOpts): Promise<void> => {
	return new Promise(async (resumeFunc) => {
		const directory = (opts !== undefined ? opts.path : _dirname + '\\Controllers') || _dirname + '\\Controllers';
		if (!filestream.existsSync(directory)) {
			FASTLOG4(
				opts.apiName,
				`The directory ${directory} for the api ${opts.apiName} was not found, make sure you configured your directory correctly.`,
				true,
			);
			return resumeFunc();
		}
		const r = walk(directory);
		let count = 0;
		r.forEach((v) => {
			let name = v.replace(directory, '');
			if (name.match(/.+\.js/)) {
				name = name.replace('.js', '');
				name = name.split('_P-').join(':');
				name = name.split('\\').join('/');
				if (name === '/__pageIndex') name = '/';
				let map: {
					default: { func: (request: Request, Response: Response) => unknown; method: string };
				};

				try {
					map = require(v);
				} catch (err) {
					return FASTLOG6(FLog[opts.apiName], err.message, true);
				}
				let func: (request: Request, Response: Response) => unknown;
				let method: string;
				if (map.default) {
					if (map.default.func) func = map.default.func;
					else return;
					if (map.default.method) method = map.default.method.toLowerCase();
					else return;
					count++;
					try {
						if (method === 'get') {
							if (opts.logSetups)
								FASTLOG3(FLog[opts.apiName], `Mapping GET ${(opts.apiName ? 'https://' + opts.apiName : '') + name}`);
							app.get(name, func);
						} else if (method === 'head') {
							if (opts.logSetups)
								FASTLOG3(FLog[opts.apiName], `Mapping HEAD ${(opts.apiName ? 'https://' + opts.apiName : '') + name}`);
							app.head(name, func);
						} else if (method === 'post') {
							if (opts.logSetups)
								FASTLOG3(FLog[opts.apiName], `Mapping POST ${(opts.apiName ? 'https://' + opts.apiName : '') + name}`);
							app.post(name, func);
						} else if (method === 'put') {
							if (opts.logSetups)
								FASTLOG3(FLog[opts.apiName], `Mapping PUT ${(opts.apiName ? 'https://' + opts.apiName : '') + name}`);
							app.put(name, func);
						} else if (method === 'delete') {
							if (opts.logSetups)
								FASTLOG3(FLog[opts.apiName], `Mapping DELETE ${(opts.apiName ? 'https://' + opts.apiName : '') + name}`);
							app.delete(name, func);
						} else if (method === 'connect') {
							if (opts.logSetups)
								FASTLOG3(FLog[opts.apiName], `Mapping CONNECT ${(opts.apiName ? 'https://' + opts.apiName : '') + name}`);
							app.connect(name, func);
						} else if (method === 'options') {
							if (opts.logSetups)
								FASTLOG3(FLog[opts.apiName], `Mapping OPTIONS ${(opts.apiName ? 'https://' + opts.apiName : '') + name}`);
							app.options(name, func);
						} else if (method === 'trace') {
							if (opts.logSetups)
								FASTLOG3(FLog[opts.apiName], `Mapping TRACE ${(opts.apiName ? 'https://' + opts.apiName : '') + name}`);
							app.trace(name, func);
						} else if (method === 'patch') {
							if (opts.logSetups)
								FASTLOG3(FLog[opts.apiName], `Mapping PATCH ${(opts.apiName ? 'https://' + opts.apiName : '') + name}`);
							app.patch(name, func);
						} else if (method === 'all') {
							if (opts.logSetups)
								FASTLOG3(FLog[opts.apiName], `Mapping ALL ${(opts.apiName ? 'https://' + opts.apiName : '') + name}`);
							app.all(name, func);
						} else {
							return FASTLOG6(FLog[opts.apiName], 'Error in requesting controller');
						}
					} catch (err) {
						return FASTLOG6(FLog[opts.apiName], err);
					}
				} else {
					return FASTLOG6(FLog[opts.apiName], `${v} had no default export.`, true);
				}
			}
		});
		FASTLOG2(opts.apiName, `https://${opts.apiName} has ${count} controller(s)`, true);
		resumeFunc();
	});
};
export default MapControllers;