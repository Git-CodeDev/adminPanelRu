<?php
session_start();
if ($_SESSION["auth"] != true) {
    header("HTTP/1.0 403 Forbidden"); 
    die; 
}

$_POST = json_decode( file_get_contents("php://input"), true );

$file = $_POST["pageName"];  //имя страницы куда сохранится отредактированная страница
$newHTML = $_POST["html"];  //html с фронта (DOM структура в виде строки)

if (!is_dir("../backups/")) {
    mkdir("../backups/");
}

$backups = json_decode(file_get_contents("../backups/backups.json"));  //запишем в переменную все предыдущие данные из других бэкапов, хранящихся в backups.json
if(!is_array($backups)) {
    $backups = [];  //если данного файла не существует, или в нем что-то невнятное вместо массива с данными, мы ему данные создадим/пересоздадим с нуля
}

if ($newHTML && $file) { //проверка: мы именно редактируем
    $backupFN = uniqid() . ".html";
   
    copy("../../" . $file, "../backups/" . $backupFN);  //копируем страницу $file до изменений для бэкапа
    array_push($backups, ["page" => $file, "file" => $backupFN, "time" => date("H:i:s d:m:y")]);  //добавляет в backups массив, где "page" - какая страница была отредактирована и "file" - какой за ней бэкап, также передадим время создания файла
    file_put_contents("../backups/backups.json", json_encode( $backups ));  //создаст файл backups.json, в который будут помещаться вся инфа о наших бекапах - а именно массив backups в json формате
    file_put_contents("../../" . $file, $newHTML);  //применяем изменения
} else {    
    header("HTTP/1.0 400 Bad Request"); 
}