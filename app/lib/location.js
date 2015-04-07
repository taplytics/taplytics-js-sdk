module.exports = function() {
    return {
      href: document.location.href,
      search: document.location.search,
      host: document.location.host,
      protocol: document.location.protocol,
      pathname: document.location.pathname
    };
};
