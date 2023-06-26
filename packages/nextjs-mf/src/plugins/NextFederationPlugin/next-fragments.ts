import type { Compiler } from 'webpack';
import { container } from 'webpack';
import path from 'path';
import type {
  ModuleFederationPluginOptions,
  SharedObject,
} from '@ranshamay/utilities';
import {
  DEFAULT_SHARE_SCOPE,
  DEFAULT_SHARE_SCOPE_BROWSER,
  getDelegates,
} from '../../internal';
import { hasLoader, injectRuleLoader } from '../../loaders/helpers';

type ConstructableModuleFederationPlugin = new (
  options: ModuleFederationPluginOptions
) => container.ModuleFederationPlugin;

/**
 * Gets the appropriate ModuleFederationPlugin based on the environment.
 * @param {boolean} isServer - A flag to indicate if the environment is server-side or not.
 * @param {Compiler} compiler - The Webpack compiler instance.
 * @returns {ModuleFederationPlugin | undefined} The ModuleFederationPlugin or undefined if not applicable.
 */
export function getModuleFederationPluginConstructor(
  isServer: boolean,
  compiler: Compiler
): ConstructableModuleFederationPlugin {
  if (isServer) {
    return require('@ranshamay/node')
      .NodeFederationPlugin as ConstructableModuleFederationPlugin;
  }
  return compiler.webpack.container
    .ModuleFederationPlugin as unknown as ConstructableModuleFederationPlugin;
}

/**

 Set up default shared values based on the environment.
 @param isServer - Boolean indicating if the code is running on the server.
 @returns The default share scope based on the environment.
 */
export const retrieveDefaultShared = (isServer: boolean): SharedObject => {
  // If the code is running on the server, treat some Next.js internals as import false to make them external
  // This is because they will be provided by the server environment and not by the remote container
  if (isServer) {
    return DEFAULT_SHARE_SCOPE;
  }
  // If the code is running on the client/browser, always bundle Next.js internals
  return DEFAULT_SHARE_SCOPE_BROWSER;
};

/**

 Apply remote delegates.

 This function adds the remote delegates feature by configuring and injecting the appropriate loader that will look
 for internal delegate hoist or delegate hoist container and load it using a custom delegateLoader.
 Once loaded, it will then look for the available delegates that will be used to configure the remote
 that the hoisted module will be dependent upon.

 @param {ModuleFederationPluginOptions} options - The ModuleFederationPluginOptions instance.

 @param {Compiler} compiler - The Webpack compiler instance.
 */
export function applyRemoteDelegates(
  options: ModuleFederationPluginOptions,
  compiler: Compiler
) {
  if (options.remotes) {
    // Get the available delegates
    const delegates = getDelegates(options.remotes);
    compiler.options.module.rules.push({
      enforce: 'pre',
      test: [/_app/],
      loader: path.resolve(__dirname, '../../loaders/patchDefaultSharedLoader'),
    });
    // Add the delegate loader for hoist and container to the module rules
    compiler.options.module.rules.push({
      enforce: 'pre',
      test: [/internal-delegate-hoist/, /delegate-hoist-container/],
      include: [
        compiler.context,
        /internal-delegate-hoist/,
        /delegate-hoist-container/,
        //eslint-disable-next-line
        /next[\/]dist/,
      ],
      loader: path.resolve(__dirname, '../../loaders/delegateLoader'),
      options: {
        delegates,
      },
    });
  }
}

// @ts-ignore
export const applyPathFixes = (compiler, options) => {
  //@ts-ignore
  compiler.options.module.rules.forEach((rule) => {
    // next-image-loader fix which adds remote's hostname to the assets url
    if (options.enableImageLoaderFix && hasLoader(rule, 'next-image-loader')) {
      // childCompiler.options.module.parser.javascript?.url = 'relative';
      injectRuleLoader(rule, {
        loader: path.resolve(__dirname, '../../loaders/fixImageLoader'),
      });
    }

    // url-loader fix for which adds remote's hostname to the assets url
    if (options.enableUrlLoaderFix && hasLoader(rule, 'url-loader')) {
      injectRuleLoader({
        loader: path.resolve(__dirname, '../../loaders/fixUrlLoader'),
      });
    }
  });
};
