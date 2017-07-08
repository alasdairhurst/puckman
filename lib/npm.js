const utils = require('./utils');

const NPM = {
	install: (packageName, opts = {}) => {
		const registry = opts.registry;
		let command = 'npm install';
		if (registry) {
			command = `${command} --registry ${registry}`;
		}
		return utils.execute('Install', packageName, command, null, null, true);
	},

	registerLink: (packageName) => {
		return utils.execute('RegisterLink', packageName, 'npm link');
	},

	link: (packageName) => {
		return utils.execute('Link', packageName, `npm link ${packageName}`);
	},

	uninstall: (packageName) => {
		return utils.execute('Uninstall', packageName, `npm uninstall ${packageName}`);
	}
};

module.exports = NPM;
