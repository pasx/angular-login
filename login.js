'use strict';

angular.module('login', ['ngCookies','ab-base64']);

angular.module('login')

.run(['$rootScope', '$location', '$cookieStore', '$http', 'loginService',
    function ($rootScope, $location, $cookieStore, $http,loginService) {

        // keep user logged in after page refresh
        loginService.loginOnRefresh();

        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            var isLoggedIn = loginService.isLoggedIn();
            // redirect to login page if not logged in
            if ($location.path() !== '/' && !isLoggedIn) {
                $location.path('/');
            }
        });
    }])

.factory('loginService',
    ['base64', '$http', '$cookieStore', '$rootScope', '$timeout',
    function (base64, $http, $cookieStore, $rootScope, $timeout) {
        var service = {};

        var CookieName = 'credentials';
        var AccessLevel = 'basic';
        var Header = 'login';

        service.isLoggedIn = function () {
            if (!$rootScope.currentUser.authData) {
                return false;
            }
            return true;
        }; 

        service.setHttpHeaders = function (value) {
            $http.defaults.headers.common[Header] = value;
        };        

        service.clearCookies = function () {
            $cookieStore.remove(CookieName);
        };

        service.clearCredentials = function () {
            $rootScope.currentUser = {};
            $rootScope.loggedIn = false;
            this.clearCookies();
            this.setHttpHeaders('');
        };

        function getAuthenticationData(accessLevel, userName, password){
            var authData = base64.urlencode(accessLevel + ':' + userName + ':' + password);
            return authData;
        };

        function getPassword(authData){
            if(!authData){return "";}
            var data = base64.urldecode(authData).split(':');
            var password = data.length>2 ? data[2] : "";
            return password;
        };

        function getCookie () {
            return $cookieStore.get(CookieName) || {};
        };

        service.loginOnRefresh = function () {
            $rootScope.currentUser = getCookie (); //get credentials cookie
            if(!this.isLoggedIn())
            {
                this.clearCredentials();
                return;
            }
            var currentUser = $rootScope.currentUser;
            var password = getPassword(currentUser.authData);
            this.handleLoginStatus(currentUser.userName , password , this.isLoggedIn(),true);
        };

        service.handleLoginStatus = function (userName,password, isLoggedIn, isRefresh) {
            $rootScope.loggedIn = isLoggedIn;
            if (isLoggedIn) {     
                if(!isRefresh){
                    this.setCredentials(userName, password);
                } 
                var currentUser = $rootScope.currentUser;
                this.setHttpHeaders(currentUser.authData);
                return;
            }
            //login failure
            this.clearCredentials();
        };

        service.setCredentials = function (userName, password) {
            var authData = getAuthenticationData(AccessLevel,userName,password);
            $rootScope.currentUser = {
             userName: userName,
             authData: authData };
             this.setHttpHeaders(authData);
             $cookieStore.put(CookieName, $rootScope);
         };

         service.logout = function(callback){
            this.clearCredentials();
            callback();
        };

        service.login = function (loginData, callback) {

            var userName = loginData.userName;
            var password = loginData.password;

            // reset login status
            this.clearCredentials();
            /* Dummy login for testing, uses $timeout to simulate api call
            ----------------------------------------------*/
            var thisService = this;
            $timeout(function(){
                var response = { success: userName === 'test' && password === 'test' };
                thisService.handleLoginStatus(userName, password, response.success,false);
                if(!response.success) {
                    response.message = 'Username or password is incorrect';
                }
                callback(response);
            }, 500);


            /* Use this for real login
            ----------------------------------------------*/
            //$http.post('/api/authenticate', { userName: userName, password: password })
            //    .success(function (response) {
            //        callback(response);
                        // this.handleLoginStatus(userName, password, response.success);
                        // return;
            //    });
            //this.handleLoginStatus(userName, password, false);

        };

        return service;
    }])

.controller('loginController',
    ['$scope', '$rootScope', '$location', '$timeout', 'loginService',
    function ($scope, $rootScope, $location, $timeout, loginService) {

        $rootScope.login = function () {
            $rootScope.busy = true;
            $scope.errorLogin = "";
            loginService.login($scope.loginData, function(response) {
                if(!response.success) {
                    $scope.errorLogin = response.message;
                    $scope.loggedInFailed = true;
                }
                else{
                    $scope.loggedInFailed = false;
                    $scope.showLoginForm = false;
                }
                $rootScope.busy = false;
            });
        };

        $rootScope.logout = function () {
            $rootScope.busy = true;
            loginService.logout(function() {
                if('/' != $location.path()){
                    $location.path('/');}
                    $rootScope.busy = false;
                    $rootScope.$apply();
                });
        };

        $rootScope.logoutConfirm = function() {
            var message = $rootScope.loc.DoYouReallyWantToLogOut;
            var title = $rootScope.loc.LogOutTitle;
            var dlgType = $rootScope.dialogs.messageBoxType.OkCancel;

            var callback = function(param) {
                $timeout(function() {
                  $rootScope.logout();
              }, 0);};

                $rootScope.dialogs.messageBox(message, title, callback, null, dlgType);
            };

            $rootScope.loginButtonClick = function () {

                if(!$rootScope.loggedIn)
                {
                  $scope.showLoginForm = !$scope.showLoginForm;
                  return;
              }

              this.logoutConfirm();
          };

      }]);
