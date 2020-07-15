# Experiments

Creating experiments is easy, using the Taplytics Javascript SDK you can create code-based experiments with Dynamic Variables or Code Blocks. You can find documentation on how to do this below.

| Table of Contents |
| ----------------- |
| [Dynamic Variables](#dynamic-variables) |
| [Code Blocks](#code-blocks) |
| [Running Experiments](#get-running-experiments) |

## Dynamic Variables & Code Blocks

**To see and modify these variables or blocks on the dashboard, the SDK must be launched and this code containing the variable or block must be navigated to a least once.**

### Dynamic Variables

Taplytics variables are values in your website that are controlled by experiments. Changing the values can update the content or functionality of your website. Variables are reusable between experiments.

#### Asynchronous

Asynchronous variables take care of insuring that the experiments have been loaded before returning a value. This removes any danger of tainting the results of your experiment with bad data. What comes with the insurance of using the correct value is the possibility that the value will not be set immediately. If the variable is constructed *before* the experiments are loaded, you won't have the correct value until the experiments have finished loading. If the experiments fail to load, then you will be given the default value, as specified in the variables constructor.

Asynchronous variables take three parameters in its constructor:

1. Variable Name (String)
2. Default Value (String, Number, or Boolean)
3. Updated Function (Function)

The type of the variable is defined by the type of the default value, and can be a `String`, `Number` or a `Boolean`.

For example, using a variable of type `Number`:

```javascript
Taplytics.variable("JS Number", 1, (value) => {
    // function called when experiment config has loaded and value has been set
    console.log("JS Number value: " + value);
});
```

When the SDK has loaded the experiment config from our servers, the updated block will be called with that updated value.

#### Synchronous

Due to the synchronous nature of the variable, if it is used before the experiments have been loaded from Taplytics servers, it's value will be the default value rather than the value set for that experiment. This could taint the results of the experiment. In order to prevent this you can ensure that the experiments are loaded before using the variable. This can be done using the `propertiesLoaded` method, as an example: 

```javascript
Taplytics.propertiesLoaded(() => {
    var syncVar = Taplytics.variable("JS String", "default");
    console.log("JS String Sync value: " + syncVar.value);
});
```

Synchronous variables take two parameters in its constructor:

1. Variable Name (String)
2. Default Value (String, Number, or Boolean)

The type of the variable is defined by the type of the default value, and can be a `String`, `Number` or a `Boolean`.

### Code Blocks

Similar to Dynamic Variables, Taplytics has an option for 'Code Blocks'. Code blocks are linked to Experiments through the Taplytics website very much the same way that Dynamic Variables are, and will be executed based on the configuration of the experiment through the Taplytics website. A Code Block is a function that can be enabled or disabled depending on the variation. If enabled, the function will be executed asynchronously once the experiment config has loaded from our servers. If disabled, the function will not be executed.

A Code Block can be used alongside as many other Code Blocks as you would like to determine a combination that yields the best results. Perhaps there are three different Code Blocks on one view. This means there could be 8 different combinations of Code Blocks being enabled / disabled on that view if you'd like.

Example:

```javascript
Taplytics.codeBlock("enableFeature", function() {
    // enable your feature here
});
```

## Get Running Experiments

If you would like to see which variations and experiments are running, use the  `runningExperiments` function which will return the current experiments and their running variation once the SDK has loaded the config from our servers. An example:

```javascript
Taplytics.runningExperiments(function(expAndVars) {
    // For example: 
    // expAndVars = {
    //  "Experiment 1": "baseline",
    //  "Experiment 2": "Variation 1"
    //};
});
```
NOTE: The block can return asynchronously once Taplytics config has loaded. The block will return an Object with experiment names as the key values, and variation names as the values.
## Testing Experiments

To test/QA specific experiment and variation combinations use the `test_experiments` option with an Object containing keys of the experiment names, and values of variation names (or `baseline`).

```javascript
Taplytics.init("API_KEY", {
    test_experiments: {
        "JS experiment": "Variation 1",
        "JS experiment 2": "baseline"
    }
});
```

## Feature Flags

Taplytics feature flags operate in synchronous mode.

### Synchronous

Synchronous feature flags are guaranteed to have the same value for the entire session and will have that value immediately after construction.

```
if (Taplytics.featureFlagEnabled("featureFlagKey")) {
    //Put feature code here, or launch feature from here
}
```

Due to the synchronous nature of feature flags, if it is used before the feature flags have been loaded from Taplytics servers, it will default to as if the feature flag is not present. In order to prevent this you can ensure that the feature flags are loaded before using the feature flag. This can be done using the `propertiesLoaded` method, as an example:

```
Taplytics.propertiesLoaded((loaded) => {
    if (Taplytics.featureFlagEnabled("featureFlagKey")) {
        // Put feature code here, or launch feature from here
    }
})
```

---

## Running Feature Flags

If you would like to see which feature flags are running, there exists a `getRunningFeatureFlags` function which provides a callback with an object that contains the currently active feature flags. An example:

```
Taplytics.getRunningFeatureFlags((runningFF) => {
    // For example runningFF will contain:
    //    {
    //        "featureFlagKey": "My First Feature Flag",
    //        "key with spaces": "My Second Feature Flag"
    //    }
});
```

NOTE: The block can return asynchronously once Taplytics properties have loaded. The feature flags will be provided in an object where the properties are the 
feature flag key names and their corresponding values are the names of the associated feature flags.

---

