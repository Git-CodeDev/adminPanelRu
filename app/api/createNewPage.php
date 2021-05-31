<?php
session_start();
if ($_SESSION["auth"] != true) {
    header("HTTP/1.0 403 Forbidden");
    die;
}

$_POST = json_decode( file_get_contents("php://input"), true );
$newFile = "../../" . $_POST["name"] . ".html";

if (file_exists($newFile)) {  //этот файл (страица) должна быть новой на сервере
    header("HTTP/1.0 400 Bad Request");  //если файл уже существует то вернем http заголовок
} else {  //если файл не сущесвтует, надо его создать
    fopen($newFile, "w");
}      
//создание новой страницы более не используется в панели, это было тестовое API
//но оно вполне рабочее и вы можете его применить если необходимо   
