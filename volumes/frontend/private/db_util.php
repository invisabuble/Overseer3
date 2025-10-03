<?php

$host = $_ENV["DB_HOST"] . "_DB";
$db   = $_ENV["DB_NAME"];
$user = $_ENV["DB_NAME"];
$pass = $_ENV["MASTER_PASSWORD"];

// Paths inside the container where the certificates are mounted
$ssl_ca   = "/certs/root/SSL-root.crt";       // Root CA
$ssl_cert = "/certs/apache/apache-client.crt";       // Overseer client certificate
$ssl_key  = "/certs/apache/apache-client.key";       // Overseer client private key

$options = [
    PDO::MYSQL_ATTR_SSL_CA   => $ssl_ca,
    PDO::MYSQL_ATTR_SSL_CERT => $ssl_cert,
    PDO::MYSQL_ATTR_SSL_KEY  => $ssl_key,
    PDO::ATTR_ERRMODE        => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
];

try {
    $OS_DB = new PDO(
        "mysql:host=$host;dbname=$db;charset=utf8",
        $user,
        $pass,
        $options
    );
} catch (PDOException $e) {
    $Err = "Could not connect to MySQL over SSL: " . $e->getMessage();
    header("Location: issue.php?issue=" . urlencode($Err));
}

function db_execute($query, $args = []) {
    global $OS_DB;
    $stmt = $OS_DB->prepare($query);
    $stmt->execute($args);
    return $stmt;
}

?>