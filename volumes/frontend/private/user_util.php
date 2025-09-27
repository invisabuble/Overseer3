<?php


require '/private/db_util.php';
$remember_token_expiry = 60 * 60 * 24 * 30;


function validate_login ($username, $password) {
    // Checks the password hash against the one stored in the database for the passed username.
    global $db;

    // Query to get the stored password hash
    $stmt = db_execute("SELECT password_hash FROM " . $db . "_users WHERE username = ?", [$username]);
    $stored_hash = $stmt->fetch(PDO::FETCH_ASSOC);

    // If no user is found with the given username, return false
    if (!$stored_hash) {
        return false; // Username does not exist or invalid
    }

    // Check if the provided password matches the stored hash
    $pass_valid = password_verify($password, $stored_hash['password_hash']);

    return $pass_valid; // Returns true if valid, false if invalid
}


function login_user ($username) {
    // Logs a user in.
    $_SESSION['username'] = $username;

    // Redirect to the dashboard.
    header("Location: dashboard.php");
    exit;
}


function check_token () {
    // Checks if a token name has been set in the cookies, and return the user if its valid.
    global $db;

    // Check if the token is already set.
    if (isset($_COOKIE['remember_token'])) {
        // Get the token stored in the browser.
        $token = $_COOKIE['remember_token'];

        // Get the username the token belongs too:
        $stmt = db_execute("SELECT username FROM " . $db . "_users WHERE remember_token = ? AND remember_token_expiration > NOW()", [$token]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // If a username is returned then the token is valid, log the user in.
        if ($user) {
            login_user($user['username']);
        }

    } else {
        return false;
    }

}


function set_token ($username, $prevent_javascript_access = true) {
    // Generates a remember token valid for 30 days so that the user can be automatically re-logged in.
    // Expiry should be passed in seconds.
    global $db;

    // Generate the token and the expiration date.
    $token = bin2hex(random_bytes(32));
    $expiration = date('Y-m-d H:i:s', time() + $remember_token_expiry);

    // Set token and expiry in database.
    db_execute("UPDATE " . $db . "_users SET remember_token = ?, remember_token_expiration = ? WHERE username = ?", [$token, $expiration, $username]);

    // Set the cookie with the remember token, and set an expiration date (30 days time)
    setcookie('remember_token', $token, time() + $expiry, "/", "", $prevent_javascript_access, $prevent_javascript_access);
}


?>