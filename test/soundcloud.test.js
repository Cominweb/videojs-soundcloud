import window from 'global/window';
import QUnit from 'qunit';
import chromecastMaker from '../src/videojs-soundcloud';
import playerProxy from './player-proxy';

QUnit.module('soundcloud', {

  beforeEach() {
    this.oldTimeout = window.setTimeout;
    window.setTimeout = Function.prototype;
  },

  afterEach() {
    window.setTimeout = this.oldTimeout;
  }
});

QUnit.test(
  'chromecastMaker takes a player and returns a soundcloud plugin',
  function (assert) {
    let chromecast = chromecastMaker(playerProxy(), {});

    assert.equal(typeof chromecast, 'object', 'soundcloud is an object');
  }
);
