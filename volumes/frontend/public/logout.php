<?php
session_start(); // Start the session

// Unset all session variables
$_SESSION = [];

// Destroy the session
session_destroy();

// Clear the remember_token cookie
if (isset($_COOKIE['remember_token'])) {
    // Set the cookie expiration time to the past
    setcookie('remember_token', '', time() - 3600, "/");
}

// Redirect to login page
header("Location: index.php");
exit;
?>