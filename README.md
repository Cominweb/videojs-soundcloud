<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Video.js - Soundcloud Source Support](#videojs-soundcloud-source-support)
  - [How does it work?](#how-does-it-work)
  - [Additional Informations](#additional-informations)
  - [Special Thank You](#special-thank-you)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Video.js - Soundcloud Source Support
Allows you to use Soundcloud URL as source with [Video.js 5](https://github.com/zencoder/video-js/). Video.js 4 is not supported at this time (but there is another project available at https://github.com/LoveIsGrief/videojs-soundcloud )

## How does it work?
Including the script dist/videojs-soundcloud.js will add Soundcloud as a supported tech. You just have to add it to your techOrder option and your Soundcloud client ID in the options. Then, you add the option src with your Soundcloud URL.

It supports:
- soundcloud.com, snd.sc, api.soundcloud.com URLs
- Regular URLs: https://api.soundcloud.com/tracks/262856498

Here is an example:

	<link href="video-js.css" rel="stylesheet">
	<script src="video.js"></script>
	<script src="vjs.soundcloud.js"></script>
	<video id="vid1" class="video-js vjs-default-skin" controls preload="auto" width="640" height="360" data-setup='{ "techOrder": ["soundcloud"], "src": "https://api.soundcloud.com/tracks/262856498",soundcloud: {clientId: 'YOUR CLIENT ID',}}'></video>

## Additional Informations
secret_token: Secret token for private sounds

##Special Thank You
Thanks to Benjipott, Inc. for the original code https://github.com/benjipott/video.js-dailymotion
Thanks to Benoit Tremblay for inspiration https://github.com/eXon/videojs-youtube