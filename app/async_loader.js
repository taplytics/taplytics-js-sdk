!function() {
    var Taplytics = window.Taplytics = window.Taplytics || [];
    window._tlq = window._tlq || []; // if it already exists, don't empty it. Someone's filled it up!

    if (!Taplytics.identify) { // not loaded yet
        if (!Taplytics.loaded) {
            Taplytics.loaded = !0;

            Taplytics.funcs = [
                "init",
                "identify",
                "page",
                "track",
                "reset"
            ];

            Taplytics.mock = function(f) {
                return function() {
                    var e = Array.prototype.slice.call(arguments);
                    e.unshift(f);
                    window._tlq.push(e);

                    return Taplytics;
                };
            };

            for (var i = 0; i < Taplytics.funcs.length; i++) {
                var func = Taplytics.funcs[i];
                Taplytics[func] = Taplytics.mock(func);
            }

            Taplytics.load = function() {
                var e = document.createElement("script");
                e.type = "text/javascript";
                e.async= !0;
                // TODO: do better than a fixed URL here..
                e.src = "//s3.amazonaws.com/cdn.taplytics.com/taplytics.min.js";

                var n = document.getElementsByTagName("script")[0];
                n.parentNode.insertBefore(e,n);
            };

            Taplytics.load();
        }
    }
  
}();
