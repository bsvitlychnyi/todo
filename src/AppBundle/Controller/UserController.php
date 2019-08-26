<?php

namespace AppBundle\Controller;

use AppBundle\Entity\Todo;
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
     * @Rest\Get("/user/{id}/")
     * @param $id
     * @return array|View
     */
    public function actionGetAllTodo($id) // посмотреть задания пользователя
    {
        $todo = $this->getDoctrine()->getRepository('AppBundle:Todo')->findBy(array('user'=>$id));
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
     * @Rest\Post("/user/{id}/add/")
     */
    public function actionAddTodo(Request $request, $id) // добавить задание пользователя
    {
        $text = $request->get('text');
        if (empty($text)){
            return new View(" NULL VALUES ARE NOT ALLOWED", Response::HTTP_NOT_ACCEPTABLE);
        }
        else{
            $user = $this->getDoctrine()->getRepository('AppBundle:User')->findOneBy(array('id'=>$id));
            $newTodo = new Todo;
            $newTodo->setText($text);
            $newTodo->setUser($user);
            $em = $this->getDoctrine()->getManager();
            $em->persist($newTodo);
            $em->flush();
            return new View("Дело в шляпе", Response::HTTP_OK);
            }
        }

    /**
     * @Rest\Post("/user/{id}/dell/")
     */
    public function actionDellTodo(Request $request, $id) // удалить задани(е/я) пользователя sfdsdefsefewf
    {
        $string = $request->get('text');
        $textsForDell = explode("||SPLITER||", $string);

        if (empty($textsForDell)){
            return new View(" NULL VALUES ARE NOT ALLOWED", Response::HTTP_NOT_ACCEPTABLE);
        }
        else{
            $todo = $this->getDoctrine()->getRepository('AppBundle:Todo')->findBy(array('user'=>$id));
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
     * @Rest\Post("/registration/")
     */
    public function registration(Request $request) // це можна регистрацию делать
    {
        $data = new User;
        $firstName = $request->get('firstName');
        $username = $request->get('username');
        $email = $request->get('email');
        $pass = $request->get('pass');

        if(empty($firstName) or empty($username) or empty($email) or empty($pass))
        {
            return new View(" NULL VALUES ARE NOT ALLOWED", Response::HTTP_NOT_ACCEPTABLE);
        }
        $data->setFirstname($firstName);
        $data->setUsername($username);
        $data->setEmail($email);
        $data->setPassword($pass);
        $data->setApiKey(md5(uniqid($username, true))        );
        $em = $this->getDoctrine()->getManager();
        $em->persist($data);
        $em->flush();
        return array('token'=>$data->getApiKey(), 'userId'=> $data->getId());
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
                return array('token'=>$user->getApiKey(), 'userId'=> $user->getId());
            }
            else{
                return new View("Неверный пароль", Response::HTTP_LOCKED);
            }
        }
    }
}
