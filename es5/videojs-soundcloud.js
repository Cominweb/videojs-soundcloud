/**
 * @file videojs-soundcloud.js
 * Soundcloud Media Controller - Wrapper for HTML5 Media API
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _videoJs = require('video.js');

var _videoJs2 = _interopRequireDefault(_videoJs);

var _vendorAudiomanager = require('../vendor/audiomanager');

var _vendorAudiomanager2 = _interopRequireDefault(_vendorAudiomanager);

var _vendorScaudio = require('../vendor/scaudio');

var _vendorScaudio2 = _interopRequireDefault(_vendorScaudio);

/**
 * Soundcloud Media Controller - Wrapper for HTML5 Media API
 *
 * @param {Object=} options Object of option names and values
 * @param {Function=} ready Ready callback function
 * @extends Tech
 * @class Soundcloud
 */

var Component = _videoJs2['default'].getComponent('Component');
var Tech = _videoJs2['default'].getComponent('Tech');

var audioManager = new _vendorAudiomanager2['default']({
    flashAudioPath: '//connect.soundcloud.com/sdk/flashAudio.swf'
});

var Soundcloud = (function (_Tech) {
    _inherits(Soundcloud, _Tech);

    function Soundcloud(options, ready) {
        _classCallCheck(this, Soundcloud);

        _get(Object.getPrototypeOf(Soundcloud.prototype), 'constructor', this).call(this, options, ready);

        this.params = {
            id: this.options_.techId,
            autoplay: options.autoplay ? 1 : 0,
            url: options.source.src,
            client_id: options.clientId ? options.clientId : null,
            secret_token: options.secret_token ? options.secret_token : null
        };

        // If we are not on a server, don't specify the origin (it will crash)
        if (window.location.protocol !== 'file:') {
            this.params.origin = window.location.protocol + '//' + window.location.hostname;
        }

        this.videoId = this.parseSrc(options.source.src);
        this.src_ = options.source.src;

        // Parent is not set yet so we have to wait a tick
        setTimeout((function () {
            if (Soundcloud.isApiReady) {
                this.loadApi();
            } else {
                // Add to the queue because the Soundcloud API is not ready
                Soundcloud.apiReadyQueue.push(this);
            }
        }).bind(this));
    }

    _createClass(Soundcloud, [{
        key: 'createEl',
        value: function createEl() {
            var el = _videoJs2['default'].createEl('div', {}, {
                'class': 'vjs-tech vjs-tech-soundcloud'
            });
            return el;
        }
    }, {
        key: 'loadApi',
        value: function loadApi() {
            this.ended_ = false;
            SC.initialize({
                client_id: this.params.client_id
            });
            // get track infos from Soundcloud, then launch player
            SC.get('/tracks/' + this.videoId, this.params).then((function (track) {
                this.videoId = track.id;
                this.trackData = track;

                var streamsEndpoint = 'https://api.soundcloud.com/tracks/' + track.id + '/streams?client_id=' + this.params.client_id;
                var registerEndpoint = 'https://api.soundcloud.com/tracks/' + track.id + '/plays?client_id=' + this.params.client_id;

                if (this.params.secret_token) {
                    streamsEndpoint += '&secret_token=' + this.params.secret_token;
                    registerEndpoint += '&secret_token=' + this.params.secret_token;
                }

                if (!this.poster() && track.artwork_url) {
                    this.setPoster(track.artwork_url);
                } else if (!this.poster() && track.waveform_url) {
                    this.setPoster(track.waveform_url);
                }

                this.scPlayer = new _vendorScaudio2['default'](audioManager, {
                    soundId: track.id,
                    duration: track.duration,
                    streamUrlsEndpoint: streamsEndpoint,
                    registerEndpoint: registerEndpoint,
                    forceHTML5: true
                });

                this.setupTriggers();
                this.scPlayer.vjsTech = this;
                this.triggerReady();
                this.firstPlay = true;
            }).bind(this))['catch'](function (el) {
                this.eventHandler('error', e);
            });
        }
    }, {
        key: 'parseSrc',
        value: function parseSrc(src) {
            if (src) {
                var trackUrl = /^https?:\/\/(api\.soundcloud\.com|soundcloud\.com|snd\.sc)\/tracks\/([a-zA-Z0-9-]*)(\/.*)?$/;
                var match = src.match(trackUrl);
                if (match) {
                    return match ? match[2] : null;
                }

                // Regex that parse the video ID for any Soundcloud URL
                var regExp = /^https?:\/\/(api\.soundcloud\.com|soundcloud\.com|snd\.sc)\/([a-zA-Z0-9-]*)(\/.*)?$/;
                var match = src.match(regExp);
                return match ? match[2] : null;
            }
        }
    }, {
        key: 'setupTriggers',
        value: function setupTriggers() {
            this.scPlayer.listeners = [];
            for (var i = Soundcloud.Events.length - 1; i >= 0; i--) {
                //videojs.on(this.scPlayer, Soundcloud.Events[i], videojs.bind(this, this.eventHandler));
                var listener = _videoJs2['default'].bind(this, this.eventHandler);
                this.scPlayer.listeners.push({ event: Soundcloud.Events[i], func: listener });
                this.scPlayer.on(Soundcloud.Events[i], listener.bind(this, Soundcloud.Events[i])); // add arg type to handler
            }
        }
    }, {
        key: 'eventHandler',
        value: function eventHandler(type, e) {
            if (!e || !type) return false;
            this.onStateChange(type, e);
            //this.trigger(e);
        }
    }, {
        key: 'onStateChange',
        value: function onStateChange(type, event) {
            var state = type;
            if (state !== this.lastState) {
                switch (state) {
                    case -1:
                        break;
                    case 'created':
                        this.trigger('waiting');
                        this.trigger('loadstart');
                        break;
                    case 'destroyed':
                    case 'finish':
                        this.ended_ = true;
                        this.trigger('ended');
                        break;
                    case 'loading':
                        this.trigger('waiting');
                        break;
                    case 'metadata':
                        this.trigger('loadedmetadata');
                        this.trigger('volumechange');
                        this.trigger('durationchange');
                        break;
                    case 'play-start':
                        if (this.firstPlay) {
                            this.firstPlay = false;
                            this.eventHandler('created', {});
                            this.eventHandler('metadata', {});
                        }
                        this.trigger('loadeddata');
                        this.trigger('canplay');
                    case 'play-resume':
                    case 'play':
                        this.trigger('playing');
                        this.trigger('play');
                        break;
                    case 'pause':
                        this.trigger('pause');
                        break;
                    case 'reset':
                        this.trigger('pause');
                        break;
                    case 'seek':
                    case 'seeked':
                        this.trigger('timeupdate');
                        break;
                    case 'state-change':
                        if (event == 'initialize') this.eventHandler('created', {});else if (event == 'error') this.eventHandler('error', { message: 'Unable to load audio from Soundcloud, sorry.', code: 0 });else if (event == 'dead') this.eventHandler('pause', {});
                        break;
                    case 'time':
                        this.trigger('timeupdate');
                        break;
                    case 'geo_blocked':
                        this.trigger('error', { message: 'Sorry, this audio content cannot be played in your country.', code: 0 });
                        break;
                    case 'buffering_start':
                        this.trigger('progress');
                    case 'buffering_end':
                        this.trigger('canplaythrough');
                        this.trigger('progress');
                        break;
                    case 'audio_error':
                        this.trigger('error', { code: 3 });
                        break;
                    case 'no_streams':
                        this.trigger('error', { code: 4 });
                        break;
                    case 'no_protocol':
                    case 'no_connection':
                        this.trigger('error', { code: 2 });
                        break;

                }
                this.lastState = state;
            }
        }
    }, {
        key: 'poster',
        value: function poster() {
            return this.poster_;
        }
    }, {
        key: 'setPoster',
        value: function setPoster(poster) {
            this.poster_ = poster;
            this.trigger('posterchange');
        }

        /**
        * Set video
        *
        * @param {Object=} src Source object
        * @method setSrc
        */
    }, {
        key: 'src',
        value: function src(_src) {
            if (typeof _src !== 'undefined' && this.src_ != _src) {
                this.src_ = _src;
                this.videoId = this.parseSrc(_src);
                this.dispose();
                this.loadApi();
            }
            return this.src_;
        }
    }, {
        key: 'currentSrc',
        value: function currentSrc() {
            return this.src_;
        }
    }, {
        key: 'play',
        value: function play() {
            if (this.isReady_) {
                this.scPlayer.play();
            } else {
                // Keep the big play button until it plays for real
                this.player_.bigPlayButton.show();
            }
        }
    }, {
        key: 'ended',
        value: function ended() {
            if (this.isReady_) {
                return this.ended_;
            } else {
                // We will play it when the API will be ready
                return false;
            }
        }
    }, {
        key: 'pause',
        value: function pause() {
            this.scPlayer.pause();
        }
    }, {
        key: 'paused',
        value: function paused() {
            return this.scPlayer.isPaused();
        }
    }, {
        key: 'currentTime',
        value: function currentTime() {
            return this.scPlayer && this.scPlayer.currentTime ? this.scPlayer.currentTime() / 1000 : 0; // sc player returns ms
        }
    }, {
        key: 'setCurrentTime',
        value: function setCurrentTime(position) {
            this.scPlayer.seek(position * 1000); // sc player takes ms
        }
    }, {
        key: 'duration',
        value: function duration() {
            return this.scPlayer && this.scPlayer.streamInfo && this.scPlayer.streamInfo.duration ? this.scPlayer.streamInfo.duration / 1000 : 0;
        }
    }, {
        key: 'volume',
        value: function volume() {
            if (isNaN(this.volume_)) {
                this.volume_ = this.scPlayer.getVolume();
            }

            return this.volume_;
        }

        /**
        * Request to enter fullscreen
        *
        * @method enterFullScreen
        */
    }, {
        key: 'enterFullScreen',
        value: function enterFullScreen() {
            return false;
        }

        /**
        * Request to exit fullscreen
        *
        * @method exitFullScreen
        */
    }, {
        key: 'exitFullScreen',
        value: function exitFullScreen() {
            return false;
        }
    }, {
        key: 'setVolume',
        value: function setVolume(percentAsDecimal) {
            if (typeof percentAsDecimal !== 'undefined' && percentAsDecimal !== this.volume_) {
                this.scPlayer.setVolume(percentAsDecimal);
                this.volume_ = percentAsDecimal;
                this.player_.trigger('volumechange');
            }
        }
    }, {
        key: 'buffered',
        value: function buffered() {
            var _end = this.scPlayer.buffered() / 1000;
            return {
                length: this.duration(),
                start: function start() {
                    return 0;
                },
                end: function end() {
                    return _end;
                }
            };
        }
    }, {
        key: 'controls',
        value: function controls() {
            return false;
        }
    }, {
        key: 'muted',
        value: function muted() {
            return this.scPlayer.isMuted();
        }
    }, {
        key: 'setMuted',
        value: function setMuted(muted) {
            this.scPlayer.toggleMute(muted);

            this.setTimeout(function () {
                this.player_.trigger('volumechange');
            });
        }
    }, {
        key: 'supportsFullScreen',
        value: function supportsFullScreen() {
            return false;
        }
    }, {
        key: 'resetSrc_',
        value: function resetSrc_(callback) {
            this.scPlayer.dispose();
            callback();
        }
    }, {
        key: 'dispose',
        value: function dispose() {
            this.resetSrc_(Function.prototype);
            _get(Object.getPrototypeOf(Soundcloud.prototype), 'dispose', this).call(this, this);
        }
    }]);

    return Soundcloud;
})(Tech);

Soundcloud.prototype.options_ = {};

Soundcloud.apiReadyQueue = [];

Soundcloud.makeQueryString = function (args) {
    var querys = [];
    for (var key in args) {
        if (args.hasOwnProperty(key)) {
            querys.push(encodeURIComponent(key) + '=' + encodeURIComponent(args[key]));
        }
    }

    return querys.join('&');
};

// Called when Soundcloud API is ready to be used
window.scAsyncInit = function () {
    var sc;
    while (sc = Soundcloud.apiReadyQueue.shift()) {
        sc.loadApi();
    }
    Soundcloud.apiReadyQueue = [];
    Soundcloud.isApiReady = true;
};

var injectJs = function injectJs() {
    var tag = document.createElement('script');
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    tag.onload = window.scAsyncInit;
    tag.src = '//connect.soundcloud.com/sdk/sdk-3.0.0.js';
};

/* Soundcloud Support Testing -------------------------------------------------------- */

Soundcloud.isSupported = function () {
    return true;
};

// Add Source Handler pattern functions to this tech
Tech.withSourceHandlers(Soundcloud);

/*
 * The default native source handler.
 * This simply passes the source to the video element. Nothing fancy.
 *
 * @param  {Object} source   The source object
 * @param  {Flash} tech  The instance of the Flash tech
 */
Soundcloud.nativeSourceHandler = {};

/**
 * Check if Flash can play the given videotype
 * @param  {String} type    The mimetype to check
 * @return {String}         'probably', 'maybe', or '' (empty string)
 */
Soundcloud.nativeSourceHandler.canPlayType = function (source) {

    var dashExtRE = /^video\/(soundcloud)/i;

    if (dashExtRE.test(source)) {
        return 'maybe';
    } else {
        return '';
    }
};

/*
 * Check Flash can handle the source natively
 *
 * @param  {Object} source  The source object
 * @return {String}         'probably', 'maybe', or '' (empty string)
 */
Soundcloud.nativeSourceHandler.canHandleSource = function (source) {

    // If a type was provided we should rely on that
    if (source.type) {
        return Soundcloud.nativeSourceHandler.canPlayType(source.type);
    } else if (source.src) {
        return Soundcloud.nativeSourceHandler.canPlayType(source.src);
    }

    return '';
};

/*
 * Pass the source to the flash object
 * Adaptive source handlers will have more complicated workflows before passing
 * video data to the video element
 *
 * @param  {Object} source    The source object
 * @param  {Flash} tech   The instance of the Flash tech
 */
Soundcloud.nativeSourceHandler.handleSource = function (source, tech) {
    tech.src(source.src);
};

/*
 * Clean up the source handler when disposing the player or switching sources..
 * (no cleanup is needed when supporting the format natively)
 */
Soundcloud.nativeSourceHandler.dispose = function () {};

// Register the native source handler
Soundcloud.registerSourceHandler(Soundcloud.nativeSourceHandler);

/*
 * Set the tech's volume control support status
 *
 * @type {Boolean}
 */
Soundcloud.prototype['featuresVolumeControl'] = true;

/*
 * Set the tech's playbackRate support status
 *
 * @type {Boolean}
 */
Soundcloud.prototype['featuresPlaybackRate'] = false;

/*
 * Set the tech's status on moving the video element.
 * In iOS, if you move a video element in the DOM, it breaks video playback.
 *
 * @type {Boolean}
 */
Soundcloud.prototype['movingMediaElementInDOM'] = false;

/*
 * Set the the tech's fullscreen resize support status.
 * HTML video is able to automatically resize when going to fullscreen.
 * (No longer appears to be used. Can probably be removed.)
 */
Soundcloud.prototype['featuresFullscreenResize'] = false;

/*
 * Set the tech's timeupdate event support status
 * (this disables the manual timeupdate events of the Tech)
 */
Soundcloud.prototype['featuresTimeupdateEvents'] = false;

/*
 * Set the tech's progress event support status
 * (this disables the manual progress events of the Tech)
 */
Soundcloud.prototype['featuresProgressEvents'] = false;

/*
 * Sets the tech's status on native text track support
 *
 * @type {Boolean}
 */
Soundcloud.prototype['featuresNativeTextTracks'] = false;

/*
 * Sets the tech's status on native audio track support
 *
 * @type {Boolean}
 */
Soundcloud.prototype['featuresNativeAudioTracks'] = true;

/*
 * Sets the tech's status on native video track support
 *
 * @type {Boolean}
 */
Soundcloud.prototype['featuresNativeVideoTracks'] = false;

Soundcloud.Events = 'created,destroyed,finish,loading,metadata,play-start,play-resume,play,pause,reset,seek,seeked,state-change,time,geo_blocked,buffering_start,buffering_end,audio_error,no_streams,no_protocol,no_connection'.split(',');

_videoJs2['default'].options.Soundcloud = {};

// Older versions of VJS5 doesn't have the registerTech function
if (typeof _videoJs2['default'].registerTech !== 'undefined') {
    Tech.registerTech('Soundcloud', Soundcloud);
} else {
    Component.registerComponent('Soundcloud', Soundcloud);
}

injectJs();

exports['default'] = Soundcloud;
module.exports = exports['default'];