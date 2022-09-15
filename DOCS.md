Here are the APIs that Taplytics.js exposes:


| Function | Description | 
| -------- | ----------- |
| [init](#init) | Initializing Taplytics.js |
| [identify](#identify) | Identifying the user |
| [track](#track) | Tracking events |
| [page](#page) | Tracking page views |
| [reset](#reset) | Reseting User |
| [propertiesLoaded](#propertiesloaded) | Taplytics properties loaded |
| [runningExperiments](#runningexperiments) | Taplytics running experiments |
| [variable](#variable) | Taplytics variable |


If you haven't already, check out our guide on how to get started with our Javascript SDK [here](https://taplytics.com/docs/javascript-sdk).


---


### init

Usage: `Taplytics.init(token, [options])`

Instantiates Taplytics.js.

This should be the first function to be called on the page before all other functions. You can find your JS SDK Key in the Settings section of your project. 

It also automatically calls the [page](#taplyticspagecategory-name-page_attributes) function (with no arguments) right away. You can disable this in the options.


##### Arguments

1. `token` (string): Taplytics JS SDK
2. `[options]` (Object): The options object.

	|Options Params |Type |Description |
	|---        |---	        |---          |
	| timeout | Number | Set the request timeout in seconds. If requests timeout variables will use the default value, but no events will be saved. The default timeout is 4 seconds. |
	| test_experiments | Object | Set an Object containing pairs of experiment/variation combinations as key/value pairs to test with. [Learn more](https://github.com/taplytics/Taplytics-js/blob/master/EXPERIMENTS.md#testing-experiments). |
	| cookie_domain | String | Set the domain that Taplytics will use to create cookies with. By default Taplytics will use a wildcard version of your top level domain that will work across sub-domains. For example a cookie from `web.taplytics.com` will be set as `.taplytics.com`, that will also work on another subdomain such as: `new.taplytics.com`. |
	| user_attributes | Object | Set inital user attributes to be used during inital segmenation. This allows you to set custom data and user attributes that will be used by Taplytics to segment your user into experiments, user attributes set after calling `Taplytics.init()` won't be used for segmentation until the next session. |


##### Returns

(Object): Returns the Taplytics object on success, useful for chaining. When no token is provided, it returns `undefined`.


##### Example

```javascript

// Without options
Taplytics.init("js-sdk-token");

// With some options
Taplytics.init("js-sdk-token", {
    auto_page_view: false,
    log_level: 1
});

```


---


### identify

Usage: `Taplytics.identify(user_attributes)`

Identifies the user that's currently on the page. This helps link their activity on the web with their activity on other platforms (iOS, Android).

You should call this function as soon as a user signs up or has logged in. You should also call it at least once per page.


##### Arguments
1. `[user_attributes={}]` (Object): User Attributes object.
2. `[user_attributes.user_id]` (string/integer): User's ID (optional).
3. `[user_attributes.email]` (string): User's Email (optional).
4. `[user_attributes.gender]` (string): User's Gender, one of `male` or `female` (optional).
5. `[user_attributes.age]` (integer): User's age as a number (optional).
6. `[user_attributes.firstName]` (integer): User's first name (optional).
7. `[user_attributes.lastName]` (integer): User's last name (optional).
8. `[user_attributes.name]` (integer): User's full name (optional).
9. `[user_attributes.avatarUrl]` (string): User's avatar/profile image URL (optional).
10. `[user_attributes.custom_attr_name]` (string/integer/object): Any extra custom attributes (optional).

##### Returns

(Object): Returns the Taplytics object, useful for chaining.

##### Example

```javascript

// With just a few named user attributes

Taplytics.identify({
    email: "nima@taplytics.com",
    age: 23,
    gender: "male",
    firstName: "Nima",
    lastName: "Gardideh"
});

// With non-named custom attributes

Taplytics.identify({
    user_id: 1015,
    loyalty_group: "very_loyal",
    purchases_count: 15,
    friends_Count: 800
});

```


---


### track

Usage: `Taplytics.track(event_name, [value], [event_attributes])`

Tracks the occurrence of an event for the current visitor (anonymous or identified). 

Note that `value` is identified as revenue. If you want to send information about the event itself, send it through `event_attributes`.

##### Aliases

This function can also be called as follows:

`Taplytics.track(event_name, [event_attributes])`

##### Arguments

1. `event_name` (string): Event name.
2. `value` (integer/double): Value of the event (optional).
3. `event_attributes` (Object): Event attributes to be sent with the event (optional).

##### Returns

(Object): Returns the Taplytics object, useful for chaining.

##### Example

```javascript

// Simple event

Taplytics.track("Clicked Button");

// Event with value (revenue)

Taplytics.track("Purchased", 180.50);

// Event with value (revenue) and extra attributes

Taplytics.track("Purchased", 180.50, {
    product_id: 100,
    product_name: "Shirt"
});

// Event just with attributes

Taplytics.track("Finished Tutorial", {
    time_on_tutorial: 100
});
```


---


### page

Usage: `Taplytics.page([category], [name], [page_attributes])`

Tracks a page view. This is called once automatically from the [init](#taplyticsinittoken-options) function.

You can call it manually yourself to structure the page view events, as well as when you have a single page Javascript application that does its own routing.

Currently, we do not listen on `window.History` state change events to do this automatically.

##### Aliases

This function can also be caleld as follows:

`Taplytics.page([name], [page_attributes]);`

##### Arguments

1. `[category]` (string): Page Category (optional).
2. `[name]` (string): Page Name (optional).
3. `[page_attributes]` (Object): Page attributes object.

##### Returns

(Object): Returns the Taplytics object, useful for chaining.

##### Example

```javascript

// Track a page view with no attributes

Taplytics.page();

// Track it by setting a name

Taplytics.page("Page Name");

// Track a page view with a category and a name

Taplytics.page("Product Listings", "Shirts");

// Track a page view with a name and attributes

Taplytics.page("Shirts Page", {
    products_count: 150
});

// Track a page view with a name, a category, and attributes

Taplytics.page("Product Listings", "Shirts", {
    products_count: 150
});

```


---


### reset

Usage: `Taplytics.reset()`

Resets the user object and assumes the visitor is now anonymous. This can be used to deatach the visitor from the user that you had used [identify](#taplyticsidentifyuser_attributes) on earlier in the session.


##### Returns

(Object): Returns the Taplytics object, useful for chaining.

##### Example

```javascript

// Reset user

Taplytics.reset();

```

---


### propertiesLoaded

Usage: `Taplytics.propertiesLoaded([callback])`

Calls the function provided when the SDK's properties have loaded from Taplytics's servers.

##### Arguments

1. `[callback]` (function): function to callback when properties have loaded.

##### Example

```javascript

Taplytics.propertiesLoaded(function() { 
    // properties have loaded
});

```

---


### runningExperiments

Usage: `Taplytics.runningExperiments(callback)`

Calls the function provided with an Object containing the running experiments and variation names when the SDK's config has loaded from Taplytics's servers.

##### Arguments

1. `callback` (function): function to callback with running experiments and variations. With the Object's keys as experiment names, and values as the variation name.

##### Example

```javascript

Taplytics.runningExperiments(function(expAndVars) {
    // For example: 
    // expAndVars = {
    //  "Experiment 1": "baseline",
    //  "Experiment 2": "Variation 1"
    //};
});

```

---


### variable

Usage: `Taplytics.varible(name, defaultValue, [updatedBlock])`

Creates a Taplytics Variable with values that are controlled by your running experiments.

##### Arguments

1. `name` (string): Variable Name.
2. `defaultValue` (string/number/boolean): Variable's default value.
3. `[updatedBlock]` (function): Update block to be called when the Variable's `value` is set (optional).

##### Returns

(TLVariable): Returns a Taplytics Variable, use `value` to get the variable's value

##### Example

```javascript

// Using a asynchronous variable with the updated block
Taplytics.variable("JS String", "default", function(value) {
    console.log("JS String value: " + value);
});

// Using a synchronous variable
Taplytics.propertiesLoaded(function() {
    var syncVar = Taplytics.variable("JS String", "default");
    console.log("JS String Sync value: " + syncVar.value);
});

```

