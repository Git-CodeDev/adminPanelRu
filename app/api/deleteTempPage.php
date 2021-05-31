<?php
session_start();
if ($_SESSION["auth"] != true) {
    header("HTTP/1.0 403 Forbidden");
    die;
}

$file = "../../temp.html";  //временная страница
$_POST = json_decode( file_get_contents("php://input"), true );

if (file_exists($file)) {   
    unlink($file);        //удаляем временную страницу на сервере
} else {
    header("HTTP/1.0 400 Bad Request");
}
