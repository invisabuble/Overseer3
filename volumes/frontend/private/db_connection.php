<?php

$host = $_ENV["DB_HOST"];
$db = $_ENV["DB_NAME"];
$user = $_ENV["DB_NAME"];
$pass = $_ENV["MASTER_PASSWORD"];

try {
    $OS_DB = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $OS_DB->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    header("Location: issue.php");
}

?>