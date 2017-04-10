// load config manually (--config X)
// set config manually
// load config from global (puckman-config-X)
// CURRENT load config from package
// loaded config built up from all of them.
module.exports = {
	loadConfig: () => {
		return require('../config');
	}
};

