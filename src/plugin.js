import videojs from 'video.js';
import chromecast from './videojs-soundcloud';

/**
 * The video.js Soundcloud plugin.
 *
 * @param {Object} options
 */
const plugin = function (options) {
  Soundcloud(this, options);
};

videojs.plugin('soundcloud', plugin);

export default plugin;
