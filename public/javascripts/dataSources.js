(function() {
  Neptune.parseDataSource = Ember.Object.create({
    init: function() {
      this._super();
      Parse.initialize(this.parseApplicationId, this.parseJavaScriptKey);
      (function(d) {
        var id, js, ref;
        js = void 0;
        id = 'facebook-jssdk';
        ref = d.getElementsByTagName('script')[0];
        if (d.getElementById(id)) {
          return;
        }
        js = d.createElement('script');
        js.id = id;
        js.async = true;
        js.src = '//connect.facebook.net/en_US/all.js';
        return ref.parentNode.insertBefore(js, ref);
      })(document);
      return window.fbAsyncInit = function() {
        return Parse.FacebookUtils.init({
          appId: 'FACEBOOK_APP_ID',
          cookie: true,
          xfbml: false
        });
      };
    },
    parseApplicationId: 'YOUR_APPLICATION_ID',
    parseJavaScriptKey: 'YOUR_JAVASCRIPT_KEY',
    login: function(username, password, callback) {
      var _this = this;
      return Parse.User.logIn(username, password, {
        success: function(data) {
          return callback(_this.getCurrentUser, null);
        },
        error: function(error) {
          return callback(null, _this.getError(error.code, error.message, 'ERROR', 'Neptune.parseDataSource-login'));
        }
      });
    },
    fbLogin: function(callback) {
      return Parse.FacebookUtils.logIn(null, {
        success: function(user) {
          if (!user.existed()) {
            return callback(user, null);
          } else {
            return callback(user, null);
          }
        },
        error: function(user, error) {
          return callback(null, this.getError(error.code, error.message, 'ERROR', 'Neptune.parseDataSource-login'));
        }
      });
    },
    logout: function() {
      return Parse.User.logOut();
    },
    register: function(user, callback) {
      var parseUser,
        _this = this;
      parseUser = new Parse.User();
      parseUser.set('username', user.email);
      parseUser.set('password', user.password);
      parseUser.set('firstName', user.firstName);
      parseUser.set('lastName', user.lastName);
      parseUser.set('email', user.email);
      return parseUser.signUp(null, {
        success: function(data) {
          return callback(data, null);
        },
        error: function(error) {
          return callback(null, _this.getError(error.code, error.message, 'ERROR', 'Neptune.parseDataSource-register'));
        }
      });
    },
    requestPasswordReset: function(email, callback) {
      var _this = this;
      return Parse.User.requestPasswordReset(email, {
        success: function() {
          return callback(null, null);
        },
        error: function(error) {
          return callback(null, _this.getError(error.code, error.message, 'ERROR', 'Neptune.parseDataSource-requestPasswordReset'));
        }
      });
    },
    updateUser: function(user, callback) {
      var parseUser,
        _this = this;
      parseUser = Parse.User.current();
      if (parseUser) {
        parseUser.set('username', parseUser.get('username'));
        parseUser.set('email', parseUser.get('email'));
        parseUser.set('firstName', user.firstName);
        parseUser.set('lastName', user.lastName);
        return parseUser.save(null, {
          success: function(data) {
            return callback(_this.getCurrentUser(), null);
          },
          error: function(error) {
            return callback(null, getError(error.code, error.message, 'Neptune.parseDataSource-updateUser'));
          }
        });
      } else {
        return callback(data, this.getError(null, 'No user found', 'Neptune.parseDataSource-updateUser'));
      }
    },
    getCurrentUser: function() {
      if (Parse.User.current()) {
        /*if Parse.User.current().get('authData').facebook
          return Neptune.User.create(
            objectId: Parse.User.current().id
          )
        
        else
        */

        return Neptune.User.create({
          objectId: Parse.User.current().id,
          userName: Parse.User.current().attributes.username,
          firstName: Parse.User.current().attributes.firstName,
          lastName: Parse.User.current().attributes.lastName
        });
      } else {
        return null;
      }
    },
    getEmailMessages: function(callback) {
      var EmailMessage, emailMessageQuery,
        _this = this;
      EmailMessage = Parse.Object.extend('EmailMessage');
      emailMessageQuery = new Parse.Query(EmailMessage);
      emailMessageQuery.descending('updatedAt');
      emailMessageQuery.equalTo('user', Parse.User.current());
      return emailMessageQuery.find({
        success: function(data) {
          var i, message, messages, parseMessage, user, _i, _ref;
          messages = Ember.makeArray();
          user = _this.getCurrentUser();
          for (i = _i = 0, _ref = data.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
            parseMessage = data[i];
            message = Neptune.EmailMessage.create({
              objectId: parseMessage.id,
              fromUser: user,
              toEmail: parseMessage.attributes.toEmail,
              subject: parseMessage.attributes.subject,
              body: parseMessage.attributes.body
            });
            messages.pushObject(message);
          }
          return callback(messages, null);
        },
        error: function(error) {
          return callback(null, _this.getError(error.code, error.message, 'Neptune.parseDataSource-getEmailMessages'));
        }
      });
    },
    getSmsMessages: function(callback) {
      var SmsMessage, smsMessageQuery,
        _this = this;
      SmsMessage = Parse.Object.extend('SmsMessage');
      smsMessageQuery = new Parse.Query(SmsMessage);
      smsMessageQuery.descending('updatedAt');
      smsMessageQuery.equalTo('user', Parse.User.current());
      return smsMessageQuery.find({
        success: function(data) {
          var i, message, messages, parseMessage, user, _i, _ref;
          messages = Ember.makeArray();
          user = _this.getCurrentUser();
          for (i = _i = 0, _ref = data.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
            parseMessage = data[i];
            message = Neptune.SmsMessage.create({
              objectId: parseMessage.id,
              fromUser: user,
              toPhoneNumber: parseMessage.attributes.toPhoneNumber,
              message: parseMessage.attributes.message
            });
            messages.pushObject(message);
          }
          return callback(messages, null);
        },
        error: function(error) {
          return callback(null, _this.getError(error.code, error.message, 'Neptune.parseDataSource-getSmsMessages'));
        }
      });
    },
    sendEmailMessage: function(message, callback) {
      var EmailMessage, parseMessage,
        _this = this;
      EmailMessage = Parse.Object.extend('EmailMessage');
      parseMessage = new EmailMessage;
      parseMessage.set('user', Parse.User.current());
      parseMessage.set('toEmail', message.toEmail);
      parseMessage.set('subject', message.subject);
      parseMessage.set('body', message.body);
      return parseMessage.save(null, {
        success: function(data) {
          message.objectId = data.id;
          return callback(message, null);
        },
        error: function(error) {
          return callback(null, _this.getError(error.code, error.message, 'Neptune.parseDataSource-sendEmailMessage'));
        }
      });
    },
    sendSmsMessage: function(message, callback) {
      var SmsMessage, parseMessage,
        _this = this;
      SmsMessage = Parse.Object.extend('SmsMessage');
      parseMessage = new SmsMessage;
      parseMessage.set('user', Parse.User.current());
      parseMessage.set('toPhoneNumber', message.toPhoneNumber);
      parseMessage.set('message', message.message);
      return parseMessage.save(null, {
        success: function(data) {
          message.objectId = data.id;
          return callback(message, null);
        },
        error: function(error) {
          return callback(null, _this.getError(error.code, error.message, 'Neptune.parseDataSource-sendSmsMessage'));
        }
      });
    },
    getError: function(code, message, severity, location, callback) {
      var ErrorLog, error, errorLog;
      error = Neptune.Error.create({
        code: code,
        severity: severity,
        location: location,
        message: message
      });
      if (Neptune.ApplicationController.debug) {
        console.log('Neptune - ' + severity + ' - Code: ' + code + ' Message: ' + message + ' Location: ' + location);
      }
      ErrorLog = Parse.Object.extend('ErrorLog');
      errorLog = new ErrorLog();
      errorLog.set('code', code);
      errorLog.set('severity', severity);
      errorLog.set('location', location);
      errorLog.set('message', message);
      errorLog.save(null);
      return error;
    }
  });

}).call(this);
