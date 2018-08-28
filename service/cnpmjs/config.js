var path = require('path');
var os = require('os');

var root = path.dirname(__dirname);
var dataDir = path.join(process.env.HOME || root, '.cnpmjs.org');

var config = {
  dataDir: dataDir,

  /**
   * Cluster mode
   */
  enableCluster: true,

  /*
   * server configure
   */

  registryPort: 7001,
  webPort: 7002,
  bindingHost: '0.0.0.0', // only binding on 127.0.0.1 for local access

  // debug mode
  // if in debug mode, some middleware like limit wont load
  // logger module will print to stdout
  debug: false,

  enableCompress: false, // enable gzip response or not

  /**
   * database config
   */

  database: {
    db: 'cnpmjs',
    username: 'cnpmjs',
    password: '',

    // the sql dialect of the database
    // - currently supported: 'mysql', 'sqlite', 'postgres', 'mariadb'
    dialect: 'mysql',

    // custom host; default: 127.0.0.1
    host: '172.18.9.81',

    // custom port; default: 3306
    port: 3306,

    // use pooling in order to reduce db connection overload and to increase speed
    // currently only for mysql and postgresql (since v1.5.0)
    pool: {
      maxConnections: 10,
      minConnections: 0,
      maxIdleTime: 30000
    },

    // the storage engine for 'sqlite'
    // default store into ~/.cnpmjs.org/data.sqlite
    storage: path.join(dataDir, 'data.sqlite'),

    logging: !!process.env.SQL_DEBUG,
  },

  // registry url name
  registryHost: '***.com',

  /**
   * registry mode config
   */

  // enable private mode or not
  // private mode: only admins can publish, other users just can sync package from source npm
  // public mode: all users can publish
  enablePrivate: true,

  // sync source, upstream registry
  // If you want to directly sync from official npm's registry
  // please drop them an email first
  sourceNpmRegistry: 'https://registry.npm.taobao.org',

  // all: sync all modules
  syncModel: 'exist', // 'none', 'all', 'exist'

};

module.exports = config;