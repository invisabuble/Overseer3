<?php

$host = $_ENV["DB_HOST"];
$db = $_ENV["DB_NAME"];
$user = $_ENV["DB_NAME"];
$pass = $_ENV["MASTER_PASSWORD"];


try {
    $OS_DB = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $OS_DB->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    $Err = "Couldnt connect to MySQL";
    header("Location: issue.php?issue=$Err");
}


function db_execute ($query, $args = []) {
    // Execute a db query.
    global $OS_DB;
    $stmt = $OS_DB->prepare($query);
    $stmt->execute($args);
    return $stmt;
}

?>