const utils = require('./utils');

const GIT = {
	clone: (packageName, location) => {
		logger.info(`Cloning '${packageName}'`);
		const postClone = () => {
			process.chdir(packageName);
			return Promise.resolve();
		};
		return utils.execute('Clone', packageName, `git clone ${location} ${packageName}`, null, postClone)
			.then(() => {
				return process.chdir('..');
			});
	}
};

module.exports = GIT;
