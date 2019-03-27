# Set up a Web Beacon

## Basic Instructions

1. If you have not already done so, [create an Application on Hrbr.io](https://cloud.hrbr.io/#!/apps/edit/new). Creating an application generates an application version ID, which you'll use in your beacon.js web beacon code snippet.

2. If you have not already done so, [create a Beacon on Hrbr.io](https://cloud.hrbr.io/). Create one Beacon for each website you want to send web beacons from. Creating a beacon generates a beacon version ID, which you'll use in your beacon.js web beacon code snippet.

3. Find your organization application key, as described below. You'll use this organization application key in the web beacon code snippet.

4. Find your application version ID, as described below. You'll use this application version ID in the web beacon code snippet.

5. Find your beacon version ID, as described below. You'll use this beacon version ID in the web beacon code snippet.

6. Copy and paste the beacon.js web beacon code snippet into each web page you want to send a beacon from. Add the web beacon code snippet right after the opening `<head>` tag on each page.

***Find your organization application key***    
To find the organization application key:

1. Sign in to your [Hrbr.io account](https://cloud.hrbr.io).
2. Click [API Keys](https://cloud.hrbr.io/#!/account/apikeys) under your account settings menu.
3. Select an application from those displayed.
4. Your application key is displayed under key next to ___prod___.


***Find your application version ID***    
To find an application version ID:

1. Sign in to your [Hrbr.io account](https://cloud.hrbr.io).
2. Click [Apps](https://cloud.hrbr.io/#!/apps/list).
3. Select an application from those displayed.
4. Your application version ID is displayed at the top of the page as ___AppVersionID___.


***Find your beacon version ID***  
To find a beacon version ID:

1. Sign in to your [Hrbr.io account](https://cloud.hrbr.io).
2. Click [Apps](https://cloud.hrbr.io/#!/apps/list).
3. Select an application from those displayed.
4. Under **Beacons**, click the *pencil* next to the beacon name.
5. Your beacon version ID is displayed at the top of the page inside the __Beacon Version ID__ box.


### ***Web beacon code snippet***

Paste the following snippet right after the `<head>` tag on each page of your site.  
- Replace HRBR_API_KEY with your organization application key.  
- Replace APPLICATION_VERSION_ID with your application version ID.  
- Replace BEACON_VERSION_ID with your beacon version ID.  
- Replace BEACON_INSTANCE_ID with a unique description for this client instance. 

```html
<!-- Load Harbor Web Beacon for JavaScript -->
<script async src="https://cloud.hrbr.io/src/beacon.js?id=APPLICATION_VERSION_ID"></script>
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
	hb('create', 'HRBR_API_KEY',
	             'APPLICATION_VERSION_ID', 
                 'BEACON_VERSION_ID',
                 { 'beaconInstanceId': 'BEACON_INSTANCE_ID' });
    hb('send', 'WEB_BEACON_CREATED');
    });
</script>
```

## Verify that the web beacon code is working
To verify that the web beacon code is working, visit your website and check to see that your visit is being registered in the [Developer View](https://hrbr.io).

***Find your Developer View***    
To find a Developer View:

1. Sign in to your [Hrbr.io account](https://cloud.hrbr.io).
2. Click [Apps](https://cloud.hrbr.io/#!/apps/list).
3. Select an application from those displayed.
4. Under **Views** at the bottom (mobile) or right (desktop) of the page, click the *eye* next to the *Developer View*.


## Related resource
[beacon.js Developer Guide](https://hrbr.io)


### Send another beacon
To send another beacon just add code snippets that call `hb('send')` passing in a beacon message type and
an object that is a [JSON-encodable object](https://www.json.org/).
```js
const beaconMessageData = {
  aKey: 'someValue',
  anotherKey: true
};
hb('send', '<MESSAGE_TYPE>', beaconMessageData);
```

## More Advanced
```
<script>
    window.onerror = function (message, file, line, col, error) {
        console.log(message, "from", error.stack);
        let hrbrBeaconMsg = {
          message: message,
          file: file,
          line: line,
          col: col,
          error: error
        };
        hb('send', "error", hrbrBeaconMsg);
    };
    window.addEventListener("error", function (e) {
        console.log(e.error.message, "from", e.error.stack);
        let hrbrBeaconMsg = {
          message: e.error.message,
          error: e.error.stack
        };
        hb('send', "error", hrbrBeaconMsg);
    })
    $( document ).ready(function() {
        if( !$.cookie("hrbr") ) {
            $.cookie("hrbr", uuidv4(), { expires : 1 });
        }
        let hrbrBeaconMsg = {
          sessionId: $.cookie("hrbr"),
          location: $(location).attr('href'),
          width: $(window).width(),
          height: $(window).height(),
          performance: window.performance,
          browser: navigator.userAgent.toLowerCase()
        };
        hb('send', 'pageload', hrbrBeaconMsg);
    });
    $(document).on("click mousedown mouseup focus blur keydown change click dblclick keydown keyup keypress textInput touchstart touchmove touchend touchcancel resize zoom focus blur select change submit reset",function(e){
        let hrbrBeaconMsg = {
          sessionId: $.cookie("hrbr"),
          target: e.target.href,
          x: e.originalEvent.clientX,
          y: e.originalEvent.clientY,
          width: $(window).width(),
          height: $(window).height()
        };
        hb('send', e.type, hrbrBeaconMsg);
    });
    function uuidv4() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
</script>

```
