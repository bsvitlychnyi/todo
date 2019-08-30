<?php

namespace AppBundle\Controller;

use AppBundle\Entity\Todo;
use AppBundle\Entity\TodoList;
use http\Header;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\Controller\FOSRestController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\View\View;
use AppBundle\Entity\User;

class UserController extends FOSRestController
{

    /**
     * @Rest\Get("/user/{userId}/list/{listId}/")
     * @param $userId, $listId
     * @return array|View
     */
    public function actionGetAllTodoByList($userId, $listId) // посмотреть задания пользователя
    {
        $todo = $this->getDoctrine()->getRepository('AppBundle:Todo')->findBy(array('list'=>$listId));
        if (empty($todo)){
            return new View("Заданий нет", Response::HTTP_NOT_FOUND);
        }
        else{
            $result = array();
            foreach ($todo as $todoObject){
                $result[$todoObject->getId()]=$todoObject->getText();
            }
            return $result;
        }
    }

    /**
     * @Rest\Post("/user/{userId}/list/{listId}/add/")
     */
    public function actionAddTodo(Request $request, $userId, $listId) // добавить задание пользователя
    {
        $text = $request->get('text');
        if (empty($text)){
            return new View(" NULL VALUES ARE NOT ALLOWED", Response::HTTP_NO_CONTENT);
        }
        else{
            $list = $this->getDoctrine()->getRepository('AppBundle:TodoList')->findOneBy(array('id'=>$listId));
            // можно доп проверку какуюнить навернуть
            $newTodo = new Todo;
            $newTodo->setText($text);
            $newTodo->setList($list);
            $newTodo->setDone(false);
            $em = $this->getDoctrine()->getManager();
            $em->persist($newTodo);
            $em->flush();
            return new View(array('message'=>'Successful'), Response::HTTP_OK);
            }
        }

    /**
     * @Rest\Post("/user/{id}/addList/")
     */
    public function actionAddTodoList(Request $request, $id) // добавить список заданий
    {
        $text = $request->get('text');
        if (empty($text)){
            return new View(" NULL VALUES ARE NOT ALLOWED", Response::HTTP_NOT_ACCEPTABLE);
        }
        else{
            $user = $this->getDoctrine()->getRepository('AppBundle:User')->findOneBy(array('id'=>$id));
            $newTodoList = new TodoList();
            $newTodoList->setText($text);
            $newTodoList->setUser($user);
            $em = $this->getDoctrine()->getManager();
            $em->persist($newTodoList);
            $em->flush();
            return new View(array('message'=>'Nice', 'id'=>$newTodoList->getId()), Response::HTTP_OK);
        }
    }

    /**
     * @Rest\Get("/user/{id}/list/")
     * @param $id
     * @return array|View
     */
    public function actionGetAllLists($id) // посмотреть задания пользователя по определенному списку
    {
        $todoLists = $this->getDoctrine()->getRepository('AppBundle:TodoList')->findBy(array('user'=>$id));
        if (empty($todoLists)){
            return new View("Списков нет", Response::HTTP_NOT_FOUND);
        }
        else{
            $result = array();
            foreach ($todoLists as $todoList){
                $result[$todoList->getId()]=$todoList->getText();
            }
            return $result;
        }
    }

    /**
     * @Rest\Post("/user/{userId}/list/{listId}/dell/")
     */
    public function actionDellTodo(Request $request, $userId, $listId) // удалить задани(е/я) пользователя
    {
        $string = $request->get('text');
        $textsForDell = explode("||SPLITER||", $string);

        if (empty($textsForDell)){
            return new View(" NULL VALUES ARE NOT ALLOWED", Response::HTTP_NOT_ACCEPTABLE);
        }
        else{
            $todo = $this->getDoctrine()->getRepository('AppBundle:Todo')->findBy(array('list'=>$listId));
            $em = $this->getDoctrine()->getManager();

            foreach ($todo as $forDell){
                if (in_array($forDell->getText(), $textsForDell)){
                    $em->remove($forDell);
                }
            }
            $em->flush();
            return new View("Дело в шляпе", Response::HTTP_OK);
        }
    }

    /**
     * @Rest\Post("/user/{userId}/dellListFull/")
     */
    public function actionDellList(Request $request, $userId) // удалить список с заданиями пользователя
    {
        $id = $request->get('id');

        if (empty($id)){
            return new View(" NULL VALUES ARE NOT ALLOWED", Response::HTTP_NOT_ACCEPTABLE);
        }
        else{
            $list = $this->getDoctrine()->getRepository('AppBundle:TodoList')->findOneBy(array('id'=>$id));
            if (empty($list)) {
                return new View("Not found", Response::HTTP_NOT_ACCEPTABLE);
            }
            else{
                $em = $this->getDoctrine()->getManager();
                $em->remove($list);
                $em->flush();
                return new View("Дело в шляпе", Response::HTTP_OK);
            }
        }
    }


    /**
     * @Rest\Post("/registration/")
     */
    public function registration(Request $request) // це можна регистрацию делать
    {
        $user = new User;
        $firstName = $request->get('firstName');
        $username = $request->get('username');
        $email = $request->get('email');
        $pass = $request->get('pass');

        if(empty($firstName) or empty($username) or empty($email) or empty($pass))
        {
            return new View(" NULL VALUES ARE NOT ALLOWED", Response::HTTP_NOT_ACCEPTABLE);
        }
        $user->setFirstname($firstName);
        $user->setUsername($username);
        $user->setEmail($email);
        $user->setPassword($pass);
        $user->setApiKey(md5(uniqid($username, true)));
        $em = $this->getDoctrine()->getManager();
        $em->persist($user);
        $em->flush();
        return new View(array('token'=>$user->getApiKey(),
                            'userId'=> $user->getId(),
                            'userName'=>$user->getFirstname(),
                            'userEmail'=>$user->getEmail(),
                            'userUsername'=>$user->getUsername()),
                            Response::HTTP_ACCEPTED);
    }

    /**
     * @Rest\Post("/changeProfile/user/{id}")
     */
    public function changeProfile(Request $request, $id) // изменение профиля
    {
        $user = $this->getDoctrine()->getRepository('AppBundle:User')->findOneBy(array('id'=>$id));

        $firstName = $request->get('firstName');
        $lastName = $request->get('lastName');
        $username = $request->get('username');
        $email = $request->get('email');

        if(empty($user))
        {
            return new View(" Нет такого юзверя", Response::HTTP_NOT_ACCEPTABLE);
        }
        else{
            if(empty($firstName) or empty($username) or empty($email))
            {
                return new View(" NULL VALUES ARE NOT ALLOWED", Response::HTTP_NOT_ACCEPTABLE);
            }
            else{
                $user->setFirstname($firstName);
                $user->setUsername($username);
                $user->setEmail($email);
                $user->setApiKey(md5(uniqid($username, true)));
                $em = $this->getDoctrine()->getManager();
                $em->persist($user);
                $em->flush();
                return new View(array('token'=>$user->getApiKey(),
                    'userId'=> $user->getId(),
                    'userName'=>$user->getFirstname(),
                    'userEmail'=>$user->getEmail(),
                    'userUsername'=>$user->getUsername()),
                    Response::HTTP_ACCEPTED);
            }
        }



    }


    /**
     * @Rest\Get("/login/")
     */
    public function login(Request $request) // логинимся
    {
        $username = $request->get('username');
        $pass = $request->get('pass');
        $user = $this->getDoctrine()->getRepository('AppBundle:User')->findOneBy(array('username'=>$username));
        if ($user === null) {
            return new View("Нет такого пользователя", Response::HTTP_NOT_FOUND);
        }
        else{
            if ($user->getPassword() == $pass){
                return new View(array('token'=>$user->getApiKey(),
                                    'userId'=> $user->getId(),
                                    'userName'=>$user->getFirstname(),
                                    'userEmail'=>$user->getEmail(),
                                    'userUsername'=>$user->getUsername()),
                                    Response::HTTP_ACCEPTED);
            }
            else{
                return new View("Неверный пароль", Response::HTTP_LOCKED);
            }
        }
    }
}
