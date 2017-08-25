var router = require('yowl').Router();

var proto = module.exports = function(options) {

  options = options || {};

  var sessionSpawner = function(bot) {
    sessionSpawner.init(bot);
  }

  sessionSpawner.__proto__ = proto
  sessionSpawner.options = options;

  return sessionSpawner;

}

proto.init = function init(bot) {

  // Grab a reference to our bot
  this.bot = bot

  // Associate our platforms
  this.platforms = {};
  this.bot.extensions.filter(function(extension) {
      return extension.id && extension.capabilities && extension.send;
  }).forEach((extension) => {
    this.platforms[extension.id] = extension;
  });

  // Associate our session managers
  if (this.options.session_managers) {
    this.session_managers = options.session_managers;
  } else if (this.options.session_manager) {
    this.session_managers = [options.session_manager];
  } else {
    this.session_managers = [];
  }

  // Build up our routes for session spawning
  router.use(this.bot.prepare);
  this.session_managers.forEach(function(manager) {
    router.use(manager);
  });
  router.use((context, event, done) => {
    if (this._fn) {
      if (this._fn.length == 2) {
        this._fn(context, event);
        delete this._fn;
        done();
      } else {
        this._fn(context, event, function() {
          delete this._fn;
          done();
        });
      }
    } else {
      done();
    }
  });

  this.bot.spawnSession = this.spawnSession.bind(this);

}

proto.spawnSession = function spawnSession(platform, context, event, callback) {
  if (typeof platform !== "object") {
    platform = this.platforms[platform];
  }
  context.platform = platform;
  event.platform = platform;

  this._fn = callback;
  router.handle(context, event, function(err) {
    if (err) {
      console.err("Error!", err);
    }
  }); 
}
