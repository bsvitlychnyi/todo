'use strict';

angular.module('todoApp').controller('mainController', function($location, $rootScope, $http, $scope, $route, $routeParams) {
        var mc = this;
        var userch = JSON.parse(localStorage.getItem("user"));
        mc.user = userch;
        mc.newUser = userch;

        // функция для отправки формы после проверки            
        $scope.submitForm = function() {

            // если форма полностью валидна
            if ($scope.userForm.$valid) {
                $http({
                    method: 'POST',
                    url: $rootScope.baseUrl+'registration/?firstName='+$scope.name+'&email='+$scope.email+'&username='+$scope.username+'&pass='+$scope.password
                }).then(function (response){
                    console.log(response);
                    mc.user = {
                                id: response.data['userId'],
                                token: response.data['token'],
                                username: response.data['userUsername'],                            
                                name: response.data['userName'], 
                                email: response.data['userEmail']
                                };
                    var serialUser = JSON.stringify(mc.user);
                    localStorage.setItem('user', serialUser);

                    $location.path('/')
                },function (error){
                    console.log(error);
                });
            }
        };

// добавление нового списка +++
        mc.changeUserInfo = function() {
            
            console.log($scope.username, $scope.firstname, $scope.lastname, $scope.email);
            console.log(mc.newUser);
            $http({
                    method: 'POST',
                    url: $rootScope.baseUrl+'changeProfile/user/'+mc.newUser.id,
                    data: {
                        'firstName':mc.newUser.name,
             //           'lastName':mc.newUser,
                        'username':mc.newUser.username,
                        'email':mc.newUser.email,
                    },   
                    headers: {
                                'X-AUTH-TOKEN': userch.token
                             }
                }).then(function (response){                    
                    console.log(response);
                    mc.user = {
                                id: response.data['userId'],
                                token: response.data['token'],
                                username: response.data['userUsername'],                            
                                name: response.data['userName'], 
                                email: response.data['userEmail']
                                };
                    var serialUser = JSON.stringify(mc.user);
                    localStorage.setItem('user', serialUser);

                    location.reload()

                },function (error){
                    console.log(error);
                });               
       };

        $scope.add = function() {
            var f = document.getElementById('file').files[0],
            r = new FileReader();

            r.onloadend = function(e) {
            var data = e.target.result;
            console.log(data);
            //send your binary data via $http or $resource or do anything else with it
            }

            r.readAsArrayBuffer(f);
            console.log(r);
        }

    });