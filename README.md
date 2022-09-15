# Taplytics JS SDK

Taplytics is full A/B testing platform that lets you run experiments accross your mobile apps and the web!

## Technical Documentation

You can find the full technical documentation of Taplytics.js [here](https://docs.taplytics.com/docs/js-getting-started).

[Commercial License / Terms](https://taplytics.com/terms/)

## Installing

`yarn add @taplytics/js-sdk`

or

`npm install @taplytics/js-sdk --save`

## Usage

This package can be included in an application bundle, typically created with tools like Webpack.

Once installed, it can be consumed by importing the sdk.

For example, inside a React application, the sdk can be imported and initialized, using the `propertiesLoaded` callback to only render your UI once your project's config has been loaded from the Taplytics servers.

```
import Taplytics from '@taplytics/js-sdk';

Taplytics.init(JS_SDK_TOKEN);

Taplytics.propertiesLoaded(function() {
  ReactDOM.render(<App />, document.getElementById('root'));
});
```

## More information

### Getting Started

Please read the guide on how to get started with Taplytics.js [here](https://docs.taplytics.com/docs/js-getting-started).

### Setting Up Experiments

Guide on how to setup Experiments with Taplytics.js [here](https://docs.taplytics.com/docs/guides-experiments)
