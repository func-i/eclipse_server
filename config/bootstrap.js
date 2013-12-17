/**
 * Bootstrap
 *
 * An asynchronous boostrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.bootstrap = function (cb) {

  // It's very important to trigger this callack method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)

  function mSortBy(obj, iterator, context) {
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      if (Object.prototype.toString.call( a ) != '[object Array]') {
        return a < b ? -1 : a > b ? 1 : 0;
      } else {
        var result = 0;
        for (var i = 0; i < a.length; i++) {
          var r = a[i] < b[i] ? -1 : a[i] > b[i] ? 1 : 0;
          if (r != 0 || i == a.length - 1)
            return r;
        }
      }
    }), 'value');
  }

  _.mixin({multiSortBy : mSortBy}, {chain: false});

  cb();
};