# Harbor Web Beacon

## Getting Started

Add the beacon to your webpage.

```<script async src='https://cloud.hrbr.io/src/beacon.js'></script>```

Configure the beacon.

```
<!-- Load Harbor SDK for JavaScript -->
<script>
  // Instructs beacon.js to use the name `hb`.
	window.HarborBeaconObject = 'hb';
	// Comment this line out to disable really verbose console.logging.
	window.hb_debug = {trace : true };
	// Creates an initial hb() function.
	// The queued commands will be executed once beacon.js loads.
	window.hb = window.hb || function() {
	  (window.hb.q = window.hb.q || []).push(arguments)
	 };
  window.hb.l = +new Date;
  hb(function () {
	  hb('create', '<HRBR_API_KEY>',
		             '<APPLICATION_VERSION_ID>', 
                 '<BEACON_VERSION_ID>',
                 { 'beaconInstanceId': '<BEACON_INSTANCE_ID>' });
    });
</script>
```

Send a beacon.

```
const beaconMessageData = {
  aKey: 'someValue',
  anotherKey: true
};
hb('send', '<MESSAGE_TYPE>', beaconMessageData);
```
