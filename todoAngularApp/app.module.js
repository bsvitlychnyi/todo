'use strict';

angular.module('todoApp', ['ngRoute']);

angular.module('todoApp').run(function($rootScope) {
        $rootScope.activeList = 0;
        $rootScope.baseUrl = "http://projectfromgit.loc/app_dev.php/";

    });