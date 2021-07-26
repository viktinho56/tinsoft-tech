var handlers = require('./../handlers/handlers');
var router = {};
router.routes = {
    '' : handlers.index,
    'services' : handlers.services,
    'about' : handlers.aboutus,
    'contact' : handlers.contactus,
    'portfolio' : handlers.portfolio,
    'favicon.ico' : handlers.favicon,
    'public' : handlers.public
  };

  module.exports = router;