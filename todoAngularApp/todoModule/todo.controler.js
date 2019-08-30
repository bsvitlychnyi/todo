'use strict';

angular.
  module('todoApp').controller('TodoListController', function($location, $rootScope, $http, $scope, $route, $routeParams) {
        var todoList = this;
        var user = JSON.parse(localStorage.getItem("user"));
       
        todoList.todos = [];
        todoList.lists = [];
        if (localStorage.getItem('title')){
            todoList.title = localStorage.getItem('title');
        }
        else{
            todoList.title = 0;
        }
        todoList.user = user;

        if (user === null || user.token === null ){
            $location.path('/login')
        }else{
            $http({
                    method: 'GET',
                    url: $rootScope.baseUrl+'user/'+user.id+'/list/',
                    headers: {
                                'X-AUTH-TOKEN': user.id
                             }
                }).then(function (response){                    
                    console.log(response);

                    angular.forEach(response.data, function(text, id) {
                        todoList.lists.push({text:text, id:id});
                    });

                },function (error){
                    console.log(error);
                    // тут получается нужно редиректить. Типа токен не подошел 
                });               
        }

        // добавление задания +++
        todoList.addTodo = function() {                

            $http({
                    method: 'POST',
                    url: $rootScope.baseUrl+'user/'+user.id+'/list/'+$rootScope.activeList+'/add/?text='+todoList.todoText,
                    headers: {
                                'X-AUTH-TOKEN': user.token
                             }
                }).then(function (response){                    
                    console.log(response);

                    todoList.todos.push({text:todoList.todoText, done:false});
                    todoList.todoText = '';
                    $.notify("Задание добавлено!", "success");

                },function (error){
                    console.log(error);
                });               
       };

       // добавление нового списка +++
        todoList.addTodoList = function() {                

            $http({
                    method: 'POST',
                    url: $rootScope.baseUrl+'user/'+user.id+'/addList/?text='+todoList.todoListTitle,
                    headers: {
                                'X-AUTH-TOKEN': user.token
                             }
                }).then(function (response){                    
                    console.log(response);

                    todoList.lists.push({text:todoList.todoListTitle, id:response.data.id});
                    todoList.todoListTitle = '';
                    $.notify("Список успешно создан!", "success");

                },function (error){
                    console.log(error);
                });               
       };

       // получение заданий в списке +++
        todoList.getListItems = function(id, text){
            $rootScope.activeList = id;
            $rootScope.activeListText = text;
            localStorage.setItem('title', text);
            todoList.title=localStorage.getItem('title');            
            
            $http({
                    method: 'GET',
                    url: $rootScope.baseUrl+'user/'+user.id+'/list/'+$rootScope.activeList+'/',
                    headers: {
                                'X-AUTH-TOKEN': user.token
                             }
                }).then(function (response){                    
                    console.log(response);
                    todoList.todos =[];
                    angular.forEach(response.data, function(text) {
                        todoList.todos.push({text:text, done:false});
                    });

                },function (error){
                    console.log(error);
                    todoList.todos =[];
                });               
        };


        todoList.profile = function() {
            localStorage.setItem('title', 'Profile');
           todoList.title=localStorage.getItem('title');
           
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
            });
                $http({
                    method: 'POST',
                    url: $rootScope.baseUrl+'user/'+user.id+'/list/'+$rootScope.activeList+'/dell/'+url,
                    headers: {
                                'X-AUTH-TOKEN': user.token
                             }
                }).then(function (response){                    
                    console.log(response);
                    $.notify("Задания удалены!", "success");
                    
                },function (error){
                    console.log(error);
                });
        };

        // удаление целого списка
        todoList.archiveList = function(id) {
                $http({
                    method: 'POST',
                    url: $rootScope.baseUrl+'user/'+user.id+'/dellListFull/?id='+id,
                    headers: {
                                'X-AUTH-TOKEN': user.token
                             }
                }).then(function (response){                    
                    console.log(response);
                    var oldLists = todoList.lists;
                    todoList.lists = [];
                    angular.forEach(oldLists, function(list) {
                    if (list.id!==id){                
                        todoList.lists.push(list);                
                        }
                    });
                    if (todoList.lists.length !== 0){ // если списки еще есть
                        var idForRedirect = todoList.lists.find(e => !!e); // получаем первый елемент из масива со списками задач
                    
                        if (id===$rootScope.activeList){ //если в момент удаления списка он был открыт у пользователя то его перекинет на первый активный список
                            todoList.getListItems(idForRedirect.id, idForRedirect.text);
                        }
                    }
                    else{
                        localStorage.setItem('title', 0);
           todoList.title=localStorage.getItem('title');
                    }
                    $.notify("Список удален!", "success");

                },function (error){
                    console.log(error);
                    
                });
        };



    });// закрытие контроллера