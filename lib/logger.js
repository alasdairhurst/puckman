const winston = require('winston');
const colors = require('colors');

colors.setTheme({
	silly: 'rainbow',
	input: 'grey',
	verbose: 'cyan',
	prompt: 'grey',
	info: 'green',
	data: 'grey',
	help: 'cyan',
	warn: 'yellow',
	debug: 'blue',
	error: 'red'
});

const Logger = ((program) => {
	const logger = new (winston.Logger)({
		transports: [
			new (winston.transports.Console)({
				level: 'info',
				formatter(options) {
					// Return string will be passed to logger.
					return `${'[Puckman]'.yellow} ${options.level.toUpperCase()[options.level]} ${options.message ? options.message : ''
						}${options.meta && Object.keys(options.meta).length ? `\n\t${JSON.stringify(options.meta)}` : ''}`;
				}
			})
		]
	});
	const setLogLevel = (val) => {
		const levels = ['silly', 'debug', 'verbose', 'info', 'warn', 'error'];
		val = val.toLowerCase();
		if (levels.indexOf(val) !== -1) {
			logger.transports.console.level = val;
		} else {
			logger.warn(`Invalid log level: ${val}`);
		}
	};
	program.option('--no-color', 'no colors');
	program.option('-l, --log-level <level>', 'log level (silly, debug, verbose, info, warn, error)', setLogLevel);
	return logger;
});

module.exports = Logger;
