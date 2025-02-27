# native-federation-tests

Bundler agnostic plugins to share federated components for testing purposes.

It aims to work for both [`vitest`](https://vitest.dev/) and [`jest`](https://jestjs.io/).

## Install

```bash
npm i -D @ranshamay/native-federation-tests
```

This module provides two plugins:

### NativeFederationTestsRemote

This plugin is used to concat the components that will be used in tests.

#### Configuration

```typescript
{
    moduleFederationConfig: any; // the same configuration provided to the module federation plugin, it is MANDATORY
    additionalBundlerConfig?: TsupOptions; // additional `tsup` build options that will be merged with the one generated by the plugin, default is {}
    distFolder?: string; // folder used to store the dist, default is './dist'
    testsFolder?: string; // folder where all the files will be stored, default is '@mf-tests'
    deleteTestsFolder?: boolean; // indicate if the concatenated components folder will be deleted when the job completes, default is 'true'
}
```

#### Additional configuration

Note that, for Webpack, the plugin automatically inject the `devServer.static.directory` configuration.  
For the other bundlers, you should configure it by yourself.

### NativeFederationTestsHost

This plugin is used to download the concatenated components mock that will be used for tests.

### Configuration

```typescript
{
    moduleFederationConfig: any; // the configuration same configuration provided to the module federation plugin, it is MANDATORY
    testsFolder?: string; // folder where all the files have been stored, default is '@mf-tests',
    mocksFolder?: string; // folder where the concatenated files will be stored, default is './__mocks__',
    deleteTestsFolder?: boolean; // indicate if the tests mock folder will be deleted before the job starts, default is 'true'
}
```

## Bundler configuration

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import {NativeFederationTestsHost, NativeFederationTestsRemote} from '@ranshamay/native-federation-tests/vite'

export default defineConfig({
  plugins: [
    NativeFederationTestsRemote({
      /* options */
    }),
    NativeFederationTestsHost({
      /* options */
    }),
  ],
  /* ... */
  server: {
    // This is needed to emulate the devServer.static.directory of WebPack and correctly serve the zip file
    /* ... */
    proxy: {
      '/@mf-types.zip': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: () => `/@fs/${process.cwd()}/dist/@mf-types.zip`,
      },
    },
    fs: {
      /* ... */
      allow: ['./dist'],
      /* ... */
    },
  },
});
```

<br>
</details>
<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import {NativeFederationTestsHost, NativeFederationTestsRemote} from '@ranshamay/native-federation-tests/rollup'

export default {
  plugins: [
    NativeFederationTestsRemote({
      /* options */
    }),
    NativeFederationTestsHost({
      /* options */
    }),
  ],
};
```

<br>
</details>
<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
const {NativeFederationTestsHost, NativeFederationTestsRemote} = require('@ranshamay/native-federation-tests/webpack')
module.exports = {
  /* ... */
  plugins: [
    NativeFederationTestsRemote({
      /* options */
    }),
    NativeFederationTestsHost({
      /* options */
    }),
  ],
};
```

<br>
</details>
<details>
<summary>esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from 'esbuild'
import {NativeFederationTestsHost, NativeFederationTestsRemote} from '@ranshamay/native-federation-tests/esbuild'

build({
  plugins: [
    NativeFederationTestsRemote({
      /* options */
    }),
    NativeFederationTestsHost({
      /* options */
    }),
  ],
});
```

<br>
</details>

<details>
<summary>Rspack</summary><br>

```ts
// rspack.config.js
const {NativeFederationTestsHost, NativeFederationTestsRemote} = require('@ranshamay/native-federation-tests/rspack')

module.exports = {
  /* ... */
  plugins: [
    NativeFederationTestsRemote({
      /* options */
    }),
    NativeFederationTestsHost({
      /* options */
    }),
  ],
};
```

<br>
</details>

## Examples

To use it in a `host` module, refer to [this example](https://github.com/module-federation/module-federation-examples/tree/master/native-federation-tests-typescript-plugins/host).  
To use it in a `remote` module, refer to [this example](https://github.com/module-federation/module-federation-examples/tree/master/native-federation-tests-typescript-plugins/remote).
