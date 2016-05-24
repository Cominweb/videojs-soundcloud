'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _videoJs = require('video.js');

var _videoJs2 = _interopRequireDefault(_videoJs);

var _videojsSoundcloud = require('./videojs-soundcloud');

var _videojsSoundcloud2 = _interopRequireDefault(_videojsSoundcloud);

/**
 * The video.js Soundcloud plugin.
 *
 * @param {Object} options
 */
var plugin = function plugin(options) {
  Soundcloud(this, options);
};

_videoJs2['default'].plugin('soundcloud', plugin);

exports['default'] = plugin;
module.exports = exports['default'];