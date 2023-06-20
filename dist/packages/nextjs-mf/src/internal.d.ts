import type { Compiler } from 'webpack';
import type { ModuleFederationPluginOptions, Shared, SharedConfig, SharedObject } from '@module-federation/utilities';
export declare const DEFAULT_SHARE_SCOPE: SharedObject;
export declare const reKeyHostShared: (options?: Shared) => Record<string, SharedConfig>;
export declare const generateRemoteTemplate: (url: string, global: any) => string;
export declare const internalizeSharedPackages: (options: ModuleFederationPluginOptions, compiler: Compiler) => void;
export declare const externalizedShares: SharedObject;
export declare const getOutputPath: (compiler: Compiler) => string;
export declare const removePlugins: string[];
export declare const parseRemoteSyntax: (remote: string) => string;
export declare const parseRemotes: (remotes: Record<string, any>) => Record<string, string>;
export declare const getDelegates: (remotes: Record<string, any>) => Record<string, string>;
export declare const toDisplayErrors: (err: Error[]) => string;
