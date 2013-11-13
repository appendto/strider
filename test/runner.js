var async = require('async')
  , wd = require('wd')
, remote = JSON.parse(process.env.WEBDRIVER_REMOTE || '{"hostname":"localhost", "port":9515}')
  , browsers = JSON.parse(process.env.BROWSERS || '[{"browserName":"chrome"}]' )

  // TESTS
var tests = ["./integration/login_test"]

wd.webdriver.prototype.rel = function(url, cb){
  return this.get("http://localhost:4000" + url, cb)
}

var fails = 0;
var START_TIMEOUT = 10000;


require('./strider')(function(){
  async.map(browsers, function(conn, doneBrowser){
    var browser = wd.promiseChainRemote(remote)
    browser.init(conn)
    setTimeout(function(){
      browser.on('status', function(info) {
        console.log(info);
      });
      browser.on('command', function(meth, path, data) {
        if (meth && path && data) console.log(' command > ' + meth, path, data || '');
      });
      browser.on('error', function(info) {
        console.log(info);
      });
      browser.get("http://localhost:4000/")

      async.map(tests, function(suite, cb){
          console.log("[Browser:", conn, "] -> ", suite)
          require(suite)(browser, cb)
        },
        function(err, failure){
          browser.quit()
          doneBrowser(err)
        }
        )
      }, START_TIMEOUT);
    }
  , function doneTests(err){
      if (err) {
        console.log("Webdriver tests failure")
        process.exit(1)
      }
      console.log("Webdriver tests success!")
      process.exit(0)
    }
  )
})



