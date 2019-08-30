
// создаём приложение
var app = angular.module('todoApp', ['ngRoute']);

    app.run(function($rootScope) {
        $rootScope.token = "";
        $rootScope.userId = "";
    });

    // создаём контроллер для регистрации
    app.controller('mainController', function($location, $rootScope, $http, $scope, $route, $routeParams, $location) {
        
        // функция для отправки формы после проверки            
        $scope.submitForm = function() {

            // если форма полностью валидна
            if ($scope.userForm.$valid) {
                $http({
                    method: 'POST',
                    url: 'http://www.projectfromgit.loc/app_dev.php/registration/?firstName='+$scope.name+'&email='+$scope.email+'&username='+$scope.username+'&pass='+$scope.password
                }).then(function (response){
                    console.log(response);
                    $rootScope.token = response.data['token'];
                    $rootScope.userId = response.data['userId'];
                    $location.path('/todo')
                },function (error){
                    console.log(error);
                });
            }
        };
    });// закрытие контроллера

    // создаём контроллер для входа на сайт
    app.controller('loginController', function($location, $window, $rootScope, $http, $scope, $route, $routeParams, $location) {

        // функция для отправки формы после проверки            
        $scope.submitForm = function() {

            // если форма полностью валидна "Access-Control-Allow-Origin" value="*"
            if ($scope.userForm.$valid) {
                $http({
                    method: 'GET',
                    url: 'http://projectfromgit.loc/app_dev.php/login/?username='+$scope.username+'&pass='+$scope.password                    
                }).then(function (response){                    
                    console.log(response);
                    $rootScope.token = response.data['token'];
                    $rootScope.userId = response.data['userId'];
                    $location.path('/todo')
                },function (error){
                    console.log(error);
                });               
            }
        };
    }); // закрытие контроллера



    // создаём контроллер для списка заданий
    app.controller('TodoListController', function($location, $rootScope, $http, $scope, $route, $routeParams, $location) {
        var todoList = this;
        todoList.todos = [];
        if ($rootScope.token===''){
            $location.path('/login')
        }else{
            $http({
                    method: 'GET',
                    url: 'http://projectfromgit.loc/app_dev.php/user/'+$rootScope.userId,
                    headers: {
                                'X-AUTH-TOKEN': $rootScope.token
                             }
                }).then(function (response){                    
                    console.log(response);

                    angular.forEach(response.data, function(todo) {
                        todoList.todos.push({text:todo, done:false});
                    });

                },function (error){
                    console.log(error);
                });               
        }

        // добавление задания
        todoList.addTodo = function() {                

            $http({
                    method: 'POST',
                    url: 'http://projectfromgit.loc/app_dev.php/user/'+$rootScope.userId+'/add/?text='+todoList.todoText,
                    headers: {
                                'X-AUTH-TOKEN': $rootScope.token
                             }
                }).then(function (response){                    
                    console.log(response);

                    todoList.todos.push({text:todoList.todoText, done:false});
                    todoList.todoText = '';

                },function (error){
                    console.log(error);
                });               
       };

        todoList.remaining = function() {
           var count = 0;
           angular.forEach(todoList.todos, function(todo) {
           count += todo.done ? 0 : 1;
         });
         return count;
        }; 

        // удаление выполненного задания
        todoList.archive = function() {

          var oldTodos = todoList.todos;
          todoList.todos = [];
          var url ='?text=';
          angular.forEach(oldTodos, function(todo) {
            if (!todo.done){                
                todoList.todos.push(todo);
                
                }
                else{
                    url +=todo.text + '||SPLITER||'
                }
                console.log(url);

 });
                $http({
                    method: 'POST',
                    url: 'http://projectfromgit.loc/app_dev.php/user/'+$rootScope.userId+'/dell/'+url,
                    headers: {
                                'X-AUTH-TOKEN': $rootScope.token
                             }
                }).then(function (response){                    
                    console.log(response);
                    
                },function (error){
                    console.log(error);
                });
        };
    });// закрытие контроллера

  app.config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
        templateUrl: 'login.html',                                               
        controller:'loginController'
    })
    .when('/todo', {
        templateUrl: 'todoList.html',                                               
        controller:'TodoListController'
    })
    .when('/login', {
        templateUrl: 'login.html',                                               
        controller:'loginController'
    })
    .when('/sign-up', {
        templateUrl: 'register.html',                                               
        controller:'mainController'
    });
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false});
    
  });
