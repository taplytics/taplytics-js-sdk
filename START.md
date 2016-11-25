To fully utilize the power of Taplytics.js, you simply have to:

| # | Step |
| ---- | ---------------- |
| 1 | [Initialize Taplytics.js](#1-load-taplytics) |
| 2 | [Identify Users](#2-identify-users) |
| 3 | [Track Events](#3-track-events) |
| 4 | [Track Page Views](#4-track-page-views) |

### 1. Load Taplytics

To install Taplytics.js, you have to include the following snippet into the header or body of your site:

```html
<script type="text/javascript">
!function(){var t=window.Taplytics=window.Taplytics||[];if(window._tlq=window._tlq||[],!t.identify&&!t.loaded){t.loaded=!0,t.funcs=["init","identify","track","page","reset","propertiesLoaded","runningExperiments","variable","codeBlock"],t.mock=function(n){return function(){var e=Array.prototype.slice.call(arguments);return e.unshift(n),window._tlq.push(e),t}};for(var n=0;n<t.funcs.length;n++){var e=t.funcs[n];t[e]=t.mock(e)}t.load=function(){var t=document.createElement("script");t.type="text/javascript",t.async=!0,t.src="//cdn.taplytics.com/taplytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n)},t.load()}}();
</script>
```

This will load Taplytics.js *asynchronously*, so it will not affect your page load speed.

Other than that, all you have to do is initialize our SDK by using the `init` function:

```javascript
Taplytics.init("JS_SDK_TOKEN");
```

Replace `JS_SDK_TOKEN` with your JS SDK token. You can find your token in the settings page of your project.

Note that this **will send a page view event** to us. If you want to disable the automatic page view event when Taplytics.js is initialized, check the documentation on the `init` function [here](https://taplytics.com/docs/javascript-sdk/reference#init) and about calling the `page` function manually [here](https://taplytics.com/docs/javascript-sdk/reference#page).

#### Fast Mode

By default the JS SDK makes a request to Taplytics servers to generate its configuration, this gives us access to advanced segmentation options based on browser information and user data. However if the loading of your website is blocked by a Taplytics variable, you can enable Fast Mode which moves all the experiment distribution to the client-side SDK from Taplytics servers. Your project's configuration for Fast Mode is stored on a globably distributed CDN to reduce load times, however you will lose access to server-side segmentation based on user information.

Adding Fast Mode start option example:

```javascript
Taplytics.init("API_KEY", {
    fast_mode: true
});
```

#### Pin SDK version

If you would like to pin the JS SDK to a specific SDK version change the `//cdn.taplytics.com/taplytics.min.js` url in the snipit above using the following url where `sdk_version` is the version you would like to pin to: `//cdn.taplytics.com/jssdk/sdk_version/taplytics.min.js`

### 2. Identify Users

Using the `identify` function, you can let us know who the current user is on the page. It can also be used to let us know about any [user attributes](https://taplytics.com/docs/user-attributes-setup) that can be used for segmentation in our system.

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

We accept a few known attributes and all unknown attributes are saved as custom attributes that can also be used. Read more about the `identify` function [here](https://taplytics.com/docs/javascript-sdk/reference#identify).

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

---

### Start Options

Start options allow you to control how certain SDK features, such as the default request timeout.

|Start Option |Type |Description |
|---        |---	        |---          |
| timeout | Number | Set the request timeout in seconds. If requests timeout variables will use the default value, but no events will be saved. The default timeout is 4 seconds. |
| test_experiments | Object | Set an Object containing pairs of experiment/variation combinations as key/value pairs to test with. [Docs](https://github.com/taplytics/Taplytics-js/blob/master/EXPERIMENTS.md#testing-experiments)|
| fast_mode | Boolean | Enables client-side experiment distribution using CDN distributed configuration, but reduces segmentation options. [Docs](https://github.com/taplytics/Taplytics-js/blob/master/START.md#fast-mode) |

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


