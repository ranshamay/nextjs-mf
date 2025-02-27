import { Compilation } from 'webpack';

export type LoggerInstance = Compilation['logger'] | Console;

export class Logger {
  private static loggerInstance: LoggerInstance = console;

  static getLogger(): LoggerInstance {
    return this.loggerInstance;
  }

  static setLogger(logger: Compilation['logger']): LoggerInstance {
    // @ts-ignore
    this.loggerInstance = logger || globalThis.logger || console;
    return logger;
  }

  static getInlineLogger(): (items: unknown[]) =>string{
      return (...items: unknown[]) =>  `if (global.logger) {
        global.logger.debug({ data: { items:[${items.map(item => item,).join(',')}] } });
      } else {
        console.log(${items.join(',')});
      }`;
}}
