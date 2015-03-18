var jwt = require('express-jwt/node_modules/jsonwebtoken');

module.exports = function(sails) {
  return {
    // Pause sails lifting until this hook has completed initializing
    ready: false,

    defaults: {
      jwt: {
        secret: 'seeeeeecret!',
        userProperty: 'user',
        options: {
          algorithm: 'HS256',
          noTimestamp: true
        },
        policy: {
          error: function(req, res, err, next) {
            res.status(err.status);
            return res.json(err.inner);
          },
          success: function(req, res, next) {
            var sails = req._sails;
            return sails.models.user.findOne().where({
              id: sails.config.jwt.userProperty
            }).exec(function(err, user) {
              if (err) {
                return res.negotiate(err);
              }
              if (!user) {
                return res.badRequest();
              }
              req.user = user;
              return next();
            });
          }
        }
      }
    },

    initialize: function(done) {
      var config = sails.config.jwt;

      sails.services.JWT = {
        encode: function(id) {
          return jwt.sign(id, config.secret, config.options);
        },
        decode: function(token, cb) {
          return jwt.verify(token, config.secret, config.options, cb);
        }
      };

      // TODO: How to associate sails policy from hook?
      // var JWTValidate = function(req, res, next) {
      //   var expressjwt = require('express-jwt')(config);
      //   return expressjwt(req, res, function(err) {
      //     if (err) {
      //       return config.policy.errorFn(req, res, err, next);
      //     }
      //     config.policy.success(req, res, next);
      //   });
      // };

      return done();
    }
  };
};
