// load config manually (--config X)
// set config manually
// load config from global (puckman-config-X)
// CURRENT load config from package
// loaded config built up from all of them.

const path = require('path');
const fs = require('fs');
const Config = require('./config');

const configFile = '.pmconfig.json';

module.exports = {
	loadConfig: () => {
		let next = process.cwd();
		let dir;
		let exists = false;
		let previous;
		do {
			try {
				dir = next;
				logger.info('trying to find .pmconfig.json in', dir);
				exists = fs.existsSync(path.resolve(dir, configFile));
				if (!exists) {
					previous = path.basename(dir);
				}
				next = path.resolve(dir, '..');
			} catch (e) {
				return Promise.reject(e);
			}
		} while (!exists && dir !== next);

		if (!exists) {
			return Promise.reject(new Error('.pmconfig.json not found in directory', dir));
		}

		const conf = require(path.resolve(dir, configFile));
		return Promise.resolve(new Config(conf, dir, previous));
	}
};
