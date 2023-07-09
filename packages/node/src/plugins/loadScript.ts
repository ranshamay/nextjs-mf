import { Logger } from '@ranshamay/utilities';


/**
 * loadScript(baseURI, fileName, cb)
 * loadScript(scriptUrl, cb)
 */

//language=JS
export default `
  function loadScript(url, cb, chunkID) {
    ${Logger.getInlineLogger()(['"loadScript"','url'])}
    var url;
    var cb = arguments[arguments.length - 1];
    if (typeof cb !== "function") {
      ${Logger.getInlineLogger()(['"last argument should be a function"'])}
      throw new Error("last argument should be a function");
    }
    if (arguments.length === 2) {
      url = arguments[0];
    } else if (arguments.length === 3) {
      url = new URL(arguments[1], arguments[0]).toString();
    } else {
      ${Logger.getInlineLogger()(['"invalid number of arguments"'])}
      throw new Error("invalid number of arguments");
    }
    if (globalThis.webpackChunkLoad) {
      globalThis.webpackChunkLoad(url).then(function (resp) {
        return resp.text();
      }).then(function (rawData) {
        ${Logger.getInlineLogger()(['"loadScript"','"script loaded"','url'])}
        cb(null, rawData);
      }).catch(function (err) {
        ${Logger.getInlineLogger()(['"Federated Chunk load failed"','err'])}
        return cb(err)
      });
    } else if (typeof process !== 'undefined') {
      //TODO https support
      let request = (url.startsWith('https') ? require('https') : require('http')).get(url, function (resp) {
        if (resp.statusCode === 200) {
          let rawData = '';
          resp.setEncoding('utf8');
          resp.on('data', chunk => {
            rawData += chunk;
          });
          resp.on('end', () => {
            cb(null, rawData);
          });
        } else {
          cb(resp);
        }
      });
      request.on('error', error => {
        ${Logger.getInlineLogger()(['"Federated Chunk load failed"', 'error'])}
        console.error('Federated Chunk load failed', error);
        return cb(error)
      });
    } else {
      fetch(url).then(function (resp) {
        return resp.text();
      }).then(function (rawData) {
        cb(null, rawData);
      }).catch(function (err) {
        ${Logger.getInlineLogger()(['"Federated Chunk load failed"','err'])}
        console.error('Federated Chunk load failed', err);
        return cb(err)
      })
    }
  }
`;

// Shim to recreate browser version of webpack_require.loadChunk, same api
//language=JS
export const executeLoadTemplate = `
  function executeLoad(url, callback, name) {
    ${Logger.getInlineLogger()(['"executeLoadTemplate"','url','name'])}
    if (!name) {
      throw new Error('__webpack_require__.l name is required for ' + url);
    }
    if (typeof globalThis.__remote_scope__[name] !== 'undefined') return callback(globalThis.__remote_scope__[name]);
    // if its a worker or node
    if (typeof process !== 'undefined') {
      const vm = require('vm');
      (globalThis.webpackChunkLoad || globalThis.fetch || require("node-fetch"))(url).then(function (res) {
        return res.text();
      }).then(function (scriptContent) {
        try {
         const m = require('module');
         ${Logger.getInlineLogger()(['"executeLoadTemplate, context creating"', 'url'])}
         const remoteCapsule = vm.runInThisContext(m.wrap(scriptContent), 'node-federation-loader-' + name + '.vm')
         ${Logger.getInlineLogger()(['"executeLoadTemplate, context created"', 'url'])}
         const exp = {};
         let remote = {exports:{}};
         remoteCapsule(exp,require,remote,'node-federation-loader-' + name + '.vm',__dirname);
         remote = remote.exports || remote;
          globalThis.__remote_scope__[name] = remote[name] || remote;
          globalThis.__remote_scope__._config[name] = url;
          ${Logger.getInlineLogger()(['"executeLoadTemplate, executing remote context"', 'url'])}
          callback(globalThis.__remote_scope__[name])
        } catch (e) {
          ${Logger.getInlineLogger()(['"executeLoad hit catch block"','e'])}
          e.target = {src: url};
          callback(e);
        }
      }).catch((e) => {
        e.target = {src: url};
        callback(e);
      });
    } else {
      fetch(url).then(function (res) {
        return res.text();
      }).then(function (scriptContent) {
        try {
          const remote = eval('let module = {};' + scriptContent + '\\nmodule.exports')
          globalThis.__remote_scope__[name] = remote[name] || remote;
          globalThis.__remote_scope__._config[name] = url;
          callback(globalThis.__remote_scope__[name])
        } catch (e) {
          ${Logger.getInlineLogger()(['"executeLoad hit catch block"','e'])}
          console.error('executeLoad hit catch block',e);
          e.target = {src: url};
          callback(e);
        }
      });
    }
  }
`;
