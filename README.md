# Taplytics.js


## Usage

Just include the following script in all your pages.

```javascript
!function(){var t=window.Taplytics=window.Taplytics||[];if(window._TLQueue=[],!t.identify&&!t.loaded){t.loaded=!0,t.funcs=["init","identify","page","track","reset","ready"],t.mock=function(e){return function(){var n=Array.prototype.slice.call(arguments);return n.unshift(e),window._TLQueue.push(n),t}};for(var e=0;e<t.funcs.length;e++){var n=t.funcs[e];t[n]=t.mock(n)}t.load=function(){var t=document.createElement("script");t.type="text/javascript",t.async=!0,t.src="//s3.amazonaws.com/cdn.taplytics.com/taplytics.min.js";var e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(t,e)},t.load()}}();
```


## Documentation
