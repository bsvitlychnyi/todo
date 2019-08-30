'use strict';

angular.
  module('todoApp').controller('loginController', function($location, $window, $rootScope, $http, $scope, $route, $routeParams) {

        // функция для отправки формы после проверки            
        $scope.submitForm = function() {

            // если форма полностью валидна
            if ($scope.userForm.$valid) {
                $http({
                    method: 'GET',
                    url: $rootScope.baseUrl+'login/?username='+$scope.username+'&pass='+$scope.password                    
                }).then(function (response){

                    console.log(response);
                    var user = {
                                id: response.data['userId'],
                                token: response.data['token'],
                                username: response.data['userUsername'],                            
                                name: response.data['userName'], 
                                email: response.data['userEmail']
                                };
                    var serialUser = JSON.stringify(user);
                    localStorage.setItem('user', serialUser);

                    $location.path('/')
                },function (error){
                    console.log(error);
                });               
            }
        };
    }); // закрытие контроллера