<?php
session_start();
if ($_SESSION["auth"] != true) {  
    header("HTTP/1.0 403 Forbidden"); 
    die;
}

$_POST = json_decode( file_get_contents("php://input"), true );

$file = $_POST["file"];  //имя бэкапа страницы что будет восстанавливаться например 60829eb895f79.html
$page = $_POST["page"];  //та страница что будет восстанавливаться например index.html

if ($page && $file) {
    copy("../backups/" . $file, "../../" . $page);
} else {    
    header("HTTP/1.0 400 Bad Request"); 
}