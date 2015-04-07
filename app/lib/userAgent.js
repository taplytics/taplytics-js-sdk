module.exports = function() {
    if (navigator)
        return {
            appCodeName: navigator.appCodeName,
            appVersion: navigator.appVersion,
            cookieEnabled: navigator.cookieEnabled,
            language: navigator.language,
            platform: navigator.platform,
            string: navigator.userAgent
        };  
    else
        return {};
};
