const Install = require('./install');
const Clone = require('./clone');

module.exports = {
	install: (config, moduleName) => {
		return new Install(config)
			.install(moduleName)
			.catch(err => {
				logger.error(err);
			});
	},
	clone: (config, moduleName) => {
		return new Clone(config)
			.clone(moduleName)
			.catch(err => {
				logger.error(err);
			});
	}
};

