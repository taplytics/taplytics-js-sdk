To fully utilize the power of Taplytics.js, you simply have to:

1. [Initialize Taplytics.js](#1-load-taplytics)
2. [Idenfity Users](#2-identify-users)
3. [Track Events](#3-track-events)
4. [Track Page Views](#4-track-page-views)

### 1. Load Taplytics

In order to install Taplytics.js, you have to include the following snippet into the header or body of your site:

```html
<script type="text/javascript">
!function(){var t=window.Taplytics=window.Taplytics||[];if(window._tlq=window._tlq||[],!t.identify&&!t.loaded){t.loaded=!0,t.funcs=["init","identify","page","track","reset"],t.mock=function(n){return function(){var e=Array.prototype.slice.call(arguments);return e.unshift(n),window._tlq.push(e),t}};for(var n=0;n<t.funcs.length;n++){var e=t.funcs[n];t[e]=t.mock(e)}t.load=function(){var t=document.createElement("script");t.type="text/javascript",t.async=!0,t.src="//s3.amazonaws.com/cdn.taplytics.com/taplytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n)},t.load()}}();
</script>
```

This will load Taplytics.js *asynchronously*, so it will not affect your page load speed.

Other than that, all you have to do is initialize our SDK by using the `init` function:

```javascript
Taplytics.init("JS_SDK_TOKEN");
```

Replace `JS_SDK_TOKEN` with with your JS SDK token. You can find your token in the settings page of your project.

Note that this **will send a page view event** to us. If you want to disable the automatic page view event when Taplytics.js is initialized, check the documentation on the `init` function [here](/DOCS.md#taplyticsinittoken-options-source) and about calling the `page` function manually [here](/DOCS.md#taplyticspagecategory-name-page_attributes-source).

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

We accept a few known attributes and all unknown attributes are saved as custom attributes that can also be used. Read more about the `identify` function [here](/DOCS.md#taplyticsidentifyuser_attributes-source).



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

Note that you can send us revenue information by passing a value to the function and any other data that you can use when creating segments within Taplytics. Read more about the `track` function [here](/DOCS.md#taplyticstrackevent_name-value-event_attributes-source).


### 4. Track Page Views

As we mentioned earlier, we automatically track page views for you when you initialize our SDK. However, if you would like to give your pages better names, want attach more information to your page views or if you're using a one-page web framework (Angular, React, Backbone, Ember, etc.), you will have to call a `page` function.

You can specificy a category, a name, and extra attributes when calling the page function:

```javascript
Taplytics.page("Product Listings", "Shirts", {
    products_count: 100
});
```

Note that you can call the function by itself without any arguments as well. Read more about the `page` function [here](/DOCS.md#taplyticspagecategory-name-page_attributes-source).

