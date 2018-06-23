// tslint:disable:no-console

export enum ELogLevel {
	DEBUG = 0,
	INFO,
	WARN,
	ERROR,
}

export type TLogLevel = keyof typeof ELogLevel;

export function createLogger(logLevel: TLogLevel) {
	return new Logger(logLevel);
}

export default class Logger {
	private logLevel: ELogLevel;

	constructor(logLevel: TLogLevel) {
		this.logLevel = ELogLevel[logLevel];
	}

	public setLogLevel(logLevel: ELogLevel) {
		this.logLevel = logLevel;
	}

	public debug(...params: any[]) {
		this.logIfLevel(ELogLevel.DEBUG, params);
	}

	public info(...params: any[]) {
		this.logIfLevel(ELogLevel.INFO, params);
	}

	public warn(...params: any[]) {
		this.logIfLevel(ELogLevel.WARN, params);
	}

	public error(...params: any[]) {
		this.logIfLevel(ELogLevel.ERROR, params);
	}

	private logIfLevel(level: ELogLevel, params: any[]) {
		const date = new Date().toISOString();

		if (this.logLevel <= level) {
			console.log(`[${date}] [${ELogLevel[level]}]`, ...params);
		}
	}
}
