'use strict';

angular.
  module('todoApp').
  config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
        templateUrl: 'todoModule/todoList.html',                                               
        controller:'TodoListController'
    })

   
    .when('/login', {
        templateUrl: 'userModule/login.html',                                               
        controller:'loginController'
    })
    .when('/sign-up', {
        templateUrl: 'userModule/register.html',                                               
        controller:'mainController'
    });
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false});    
  });