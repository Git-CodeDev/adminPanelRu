<?php
session_start();

if ($_SESSION["auth"] == true) {
    $_SESSION = false;
    unset($_SESSION["auth"]);
    session_destroy();
}