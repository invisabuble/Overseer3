<?php

session_start();

// User util requires db_util so no need to require it here.
require '/private/user_util.php';

check_token();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];

    // Checkbox: true if checked, false otherwise
    $rememberMe = !empty($_POST['remember_me']);

    if (validate_login($username, $password)) {
        // Set remember token only if checkbox was checked
        if ($rememberMe) {
            set_token($username);
        }

        login_user($username);
        
    } else {
        $login_error = "Invalid credentials";
    }
}


?>
<html>

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <title>Overseer 3 | Login</title>

        <link rel="stylesheet" href="css/Overseer.css">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
        <link href="https://db.onlinewebfonts.com/c/5b026bf0b879e4356472ed8c36dc48c7?family=EmojiSymbols-Regular" rel="stylesheet"> 

        <link rel="icon" type="image/svg+xml" href="svg/eye.svg">

    </head>

    <body id="body" class="login-body display-flex-col">

        <logo_container class="display-flex noselect">
            <logo>
                <img src="svg/eye.svg">
            </logo>
            <logo_text>
                Overseer
            </logo_text>
        </logo_container>

        <?php if (isset($login_error)): ?>
            <span class="_font"><?= htmlspecialchars($login_error) ?></span>  
        <?php endif; ?>

    </body>

    <script>
        window.LOGIN_PAGE = true;
    </script>
    <script type="module" src="./js/Overseer.js"></script>
    <script>
        const waitForImports = setInterval(() => {
            if (window.DYNAMIC_IMPORT_FINISHED) {
                clearInterval(waitForImports);
                new window.OS_Components.login();
            }
        }, 50);
    </script>

</html>