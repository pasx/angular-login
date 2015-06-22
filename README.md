# angular-login

This Angular module provides function to manage user login in a web application.

I evolved it based on this sample: http://www.jasonwatmore.com/post/2014/05/26/AngularJS-Basic-HTTP-Authentication-Example.aspx
The code has been extensively refactored as a single Angular module for a single page application (no routing).

# Dependencies

The base64 conversion uses this library: https://github.com/stranger82/angular-utf8-base64

The loginController in the logoutConfirm relies on two modules developped by myself: i18n and dialogs.
The first one is available on github and the second one will be soon. Their role is pretty obvious from the code.

# Usage

The loginController defines 4 methods on the rootScope:
login, logout, loginButtonClick, logoutConfirm.

loginButtonClick is used by my application to conditionally show a login form when the user clicks on a button.

logoutConfirm shows a confirmation dialog before proceeding to log out the user.

# Security

Unless you use https, I would not recommend sending the password to the server the way the application currently does it. I am also unhappy about storing the password in a cookie

A more secure implementation should get a session key from the server on login and store that key instead of the password itself.

I will also be looking at encrypting data with an encryption key provided by the server via email on login for instance. This is not a panacea but probably sufficient for non critical applications.

