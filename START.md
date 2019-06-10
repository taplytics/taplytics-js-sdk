To fully utilize the power of Taplytics.js, you simply have to:

| # | Step |
| ---- | ---------------- |
| 1A | [Synchronous script loading](#1A-synchronous-script-loading) |
| 1B | [Asynchronous script loading](#1B-asynchronous-script-loading) |
| 2 | [Identify Users](#2-identify-users) |
| 3 | [Track Events](#3-track-events) |
| 4 | [Track Page Views](#4-track-page-views) |
| 5 | [Experiments](#5-experiments) |
| 6 | [Opt-In/Out](#6-opt-in/out) |
| 7 | [Adobe Analytics Integration](#7-adobe-analytics-integration) |
| 8 | [CNAME Aliasing](#8-cname-aliasing) |

## 1A Synchronous script loading

To best utilize Taplytics JS SDK you will want to install it as a synchronous loading script. This will ensure your users never see your content switching from baseline to their bucketed variations.

We recommend installing the Taplytics JS SDK script **as high as possible** in your `<head>` tag, ideally before any other analytics tools or other scripts are loaded.

To install the Taplytics JS SDK synchronously, use the following script tag. Replace `{JS_SDK_TOKEN}` in the src url with your own JS SDK Token from the Taplytics web dashboard:

```html
<script type="text/javascript" src="https://js.taplytics.com/jssdk/{JS_SDK_TOKEN}.min.js"></script>
```

Example implementation:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <!-- Add other meta information -->
        <!-- Add stylesheets -->
        <script type="text/javascript" src="https://js.taplytics.com/jssdk/{JS_SDK_TOKEN}.min.js"></script>
        <!-- Add other scripts and content -->
    </head>
    <body>
    ...
    </body>
</html>    
```

#### Pin SDK version

To pin the SDK to a specific version adjust the url in the `src` of the script tag to include the Taplytics JS SDK version after `/jssdk/` in the url. For Example replace `{VERSION_NUMBER}` with the pinned SDK version:

```
<script type="text/javascript" src="https://js.taplytics.com/jssdk/{VERSION_NUMBER}/{JS_SDK_TOKEN}.min.js"></script>
```

#### Start Options

Start options allow you to control how certain SDK features, such as the default request timeout. For the synchronous script these need to be added as url encoded query parameters to the end of the `src` url on the script tag.

|Start Option |Type |Description |
|---        |---	        |---          |
| test_experiments | Object | Set an Object containing pairs of experiment/variation combinations as key/value pairs to test with. [Docs](https://github.com/taplytics/Taplytics-js/blob/master/EXPERIMENTS.md#testing-experiments)|
| cookie_domain | String | Set the domain that Taplytics will use to create cookies with. By default Taplytics will use a wildcard version of your top level domain that will work across sub-domains. For example a cookie from `web.taplytics.com` will be set as `.taplytics.com`, that will also work on another subdomain such as: `new.taplytics.com`. |
| user_attributes | Object | Set initial user attributes to be used during initial segmentation. This allows you to set custom data and user attributes that will be used by Taplytics to segment your user into experiments, user attributes set after calling `Taplytics.init()` won't be used for segmentation until the next session. Format of user attributes defined [here](https://taplytics.com/docs/javascript-sdk/reference#identify). |
| track_adobe_analytics | Boolean | Enable Adobe Analytics events to be collected into Taplytics.   |
| adobe_obj_name | String | The adobe_obj_name is optional. The default variable that comes with Adobe Analytics integration is `s`. The `s` variable contains all of the tracking tags to be sent to Adobe Analytics for a given visitor. You only need to provide this if you are using a custom variable name. |


Any Object fields will need to be url encoded, to do that simply in Javascript: 

```javascript
const user_attributes = encodeURIComponent(JSON.stringify({
	"user_id": "user1", 
	"customValue": 10
}))
```

Example: 

```javascript
<script type="text/javascript" src="https://js.taplytics.com/jssdk/{JS_SDK_TOKEN}.min.js?cookie_domain=web.taplytics.com&test_experiments=%7B%22exp%22%3A%22var%22%7D&user_attributes=%7B%22user_id%22%3A%22user1%22%2C%22customValue%22%3A10%7D></script>
```

## 1B Asynchronous script loading

**Note: you only need to load the script once, do not load the synchronous script and the asynchronous script!**

To install Taplytics JS SDK *asynchronously*, you have to include the following snippet into the header or body of your site:

```html
<script type="text/javascript">
!function(){var t=window.Taplytics=window.Taplytics||[];if(window._tlq=window._tlq||[],!t.identify&&!t.loaded){t.loaded=!0,t.funcs=["init","identify","track","page","reset","propertiesLoaded","runningExperiments","variable","codeBlock"],t.mock=function(n){return function(){var e=Array.prototype.slice.call(arguments);return e.unshift(n),window._tlq.push(e),t}};for(var n=0;n<t.funcs.length;n++){var e=t.funcs[n];t[e]=t.mock(e)}t.load=function(){var t=document.createElement("script");t.type="text/javascript",t.async=!0,t.src="//cdn.taplytics.com/taplytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n)},t.load()}}();
</script>
```

This will load Taplytics.js *asynchronously*, so it will not affect your page load speed. We advise you use the synchronous script loading for any experiments applying content changes.

Other than that, all you have to do is initialize our SDK by using the `init` function:

```javascript
Taplytics.init("JS_SDK_TOKEN");
```

Replace `JS_SDK_TOKEN` with your JS SDK token. You can find your token in the settings page of your project in the Taplytics dashboard.

Note that this **will send a page view event** to us. If you want to disable the automatic page view event when Taplytics.js is initialized, check the documentation on the `init` function [here](https://taplytics.com/docs/javascript-sdk/reference#init) and about calling the `page` function manually [here](https://taplytics.com/docs/javascript-sdk/reference#page).

#### Fast Mode

**Deprecated: we advise using Synchronous script loading instead. **

By default the JS SDK makes a request to Taplytics servers to generate its configuration, this gives us access to advanced segmentation options based on browser information and user data. However if the loading of your website is blocked by a Taplytics variable, you can enable Fast Mode which moves all the experiment distribution to the client-side SDK from Taplytics servers. Your project's configuration for Fast Mode is stored on a globally distributed CDN to reduce load times, however you will lose access to server-side segmentation based on user information.

Adding Fast Mode start option example:

```javascript
Taplytics.init("API_KEY", {
    fast_mode: true
});
```

#### Pin SDK version

If you would like to pin the JS SDK to a specific SDK version change the `//cdn.taplytics.com/taplytics.min.js` url in the snip-it above using the following url where `sdk_version` is the version you would like to pin to: `//cdn.taplytics.com/jssdk/sdk_version/taplytics.min.js`

#### Start Options

Start options allow you to control how certain SDK features, such as the default request timeout.

|Start Option |Type |Description |
|---        |---	        |---          |
| timeout | Number | Set the request timeout in seconds. If requests timeout variables will use the default value, but no events will be saved. The default timeout is 4 seconds. |
| test_experiments | Object | Set an Object containing pairs of experiment/variation combinations as key/value pairs to test with. [Learn more](https://github.com/taplytics/Taplytics-js/blob/master/EXPERIMENTS.md#testing-experiments). |
| fast_mode | Boolean | Enables client-side experiment distribution using CDN distributed configuration, but reduces segmentation options. [Learn more](https://github.com/taplytics/Taplytics-js/blob/master/START.md#fast-mode). |
| cookie_domain | String | Set the domain that Taplytics will use to create cookies with. By default Taplytics will use a wildcard version of your top level domain that will work across sub-domains. For example a cookie from `web.taplytics.com` will be set as `.taplytics.com`, that will also work on another subdomain such as: `new.taplytics.com`. |
| user_attributes | Object | Set initial user attributes to be used during initial segmentation. This allows you to set custom data and user attributes that will be used by Taplytics to segment your user into experiments, user attributes set after calling `Taplytics.init()` won't be used for segmentation until the next session. For the format of user attributes, [visit our reference documentation](https://taplytics.com/docs/javascript-sdk/reference#identify). |
| track_adobe_analytics | Boolean | Enable Adobe Analytics events to be collected into Taplytics.   |
| adobe_obj_name | String | The adobe_obj_name is optional. The default variable that comes with Adobe Analytics integration is `s`. The `s` variable contains all of the tracking tags to be sent to Adobe Analytics for a given visitor. You only need to provide this if you are using a custom variable name. |

Example: 

```javascript
Taplytics.init("API_KEY", {
    timeout: 10,
    fast_mode: true,
    test_experiments: {
        "JS experiment": "Variation 1",
        "JS experiment 2": "baseline"
    }
});
```

### 2. Identify Users

Using the `identify` function, you can let us know who the current user is on the page. It can also be used to let us know about any user attribute that can be used for segmentation in our system.

We accept a few known attributes and all unknown attributes are saved as custom attributes that can also be used. Read more about the `identify` function [here](https://taplytics.com/docs/javascript-sdk/reference#identify).

Here's a quick example:

```javascript
Taplytics.identify({
    email: "nima@taplytics.com",
    user_id: "abbc-123-axx-123-okl-123",
    first_name: "Nima",
    last_name: "Gardideh",
    age: 23,
    gender: "male",
    friends_count: 10,
    purchases_count: 10,
    store_credit: 102.14
});
```

### 3. Track Events

You can use the `track` function to send us events and let us know what actions the user is performing on the page. You can use these events within Taplytics to create more personalized and rich a/b tests and push notifications.

Here's how to do it:

```javascript
Taplytics.track("Purchase", 10, {
    product_id: 100,
    product_name: "Cyan-Pink Shirt",
    product_price: 80.00
});
```

Note that you can send us revenue information by passing a value to the function and any other data that you can use when creating segments within Taplytics. Read more about the `track` function [here](https://taplytics.com/docs/javascript-sdk/reference#track).


### 4. Track Page Views

As we mentioned earlier, we automatically track page views for you when you initialize our SDK. You will have to call the `page` function if you would like to perform the following; rename your page views, attach more information to your page views, or if you're using a one-page web framework (Angular, React, Backbone, Ember, etc.).

You can specify a category, a name, and extra attributes when calling the page function:

```javascript
Taplytics.page("Product Listings", "Shirts", {
    products_count: 100
});
```

Note that you can call the function by itself without any arguments as well. Read more about the `page` function [here](https://taplytics.com/docs/javascript-sdk/reference#page).

### 5. Experiments

To setup code experiments with the Taplytics JS SDK check out this [guide](https://taplytics.com/docs/javascript-sdk/experiments).


### 6. Opt-In/Out

Using the User Opt-In / Opt-Out APIs allows you to simplify the process to get user consent for analytics tracking and experimentation. Calling `optOutTracking` will disable all Taplytics analytics tracking and experiments and delete all Taplytics cookies, and calling optInTracking will re-enable all Taplytics analytics tracking and experiments. You can retrieve the current status using: hasUserOptedOutTracking.

```
function optIn() {
    console.log("opt in")
    Taplytics.optInTracking();
}

function optOut() {
    console.log("opt out")
    Taplytics.optOutTracking();
}

function hasOptedOut() {
    let hasUserOptedOut = Taplytics.hasUserOptedOutTracking();
    console.log(`Has user opted out tracking: ${hasUserOptedOut}`)
}
```


### 7. Adobe Analytics integration

Adobe Analytics by default uses `s.t()` and `s.tl()` for tracking page views and link clicks. By setting `track_adobe_analytics` variable to true in `Taplytics.init` function, We inject our tracking code into the definitions of these functions. So whenever `s.t()` or `s.tl()` is called on the page, It first sends those events to Taplytics before sending them to Adobe Analytics. 
By default, Taplytics assumes adobe analytics tracking variable to be `s`. If you use a custom variable, then make sure to provide that during taplytics initialization with `adobe_obj_name` variable.

### 8. CNAME Aliasing

To prevent adblocks from blocking requests to our api servers, you can setup a CNAME on your domain that points to our API domains:

`https://api.taplytics.com`
`https://ping.taplytics.com`

Once you have your CNAME setup, you can pass in as options to the sync script URL or as options in `Taplytics.init`.

```javascript

Taplytics.init("TOKEN", {
    alias_host: {
        api_host: 'https://api-alias.your-domain.com',
        ping_host: 'https://ping-alias.your-domain.com'
    }
});

```

```HTML

<script type="text/javascript">
  var head = document.getElementsByTagName('head')[0];
  var script = document.createElement('script');
  script.type = 'text/javascript';
  const alias = {
    api_host: 'https://api-alias.your-domain.com',
    ping_host: 'https://ping-alias.your-domain.com'
  }
  const encodedAlias = encodeURIComponent(JSON.stringify(alias));
  script.src = `https://js.taplytics.com/jssdk/{YOUR_TOKEN}.min.js?alias_host=${encodedAlias}`;
  head.appendChild(script);
</script>


```