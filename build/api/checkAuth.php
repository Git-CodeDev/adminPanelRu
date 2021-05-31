<?php
session_start();

if ($_SESSION["auth"] != true) {  //если пользователь не заавторизован
    header("HTTP/1.0 403 Forbidden");
    die;  //если при учете того что пользователь не авторизован но както имеет сюда доступ, то мы просто оборвем код
}

if ($_SESSION["auth"] == true) {  //если пользователь авторизован
    echo json_encode( array("auth" => true) );
} else {
    echo json_encode( array("auth" => false) );
}