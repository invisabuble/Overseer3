<?php

session_start();

require '/private/user_util.php';

// Check if the user is logged in
if (!isset($_SESSION['username'])) {
    // User is not logged in, redirect to login page
    header("Location: index.php");
    exit;
}

# Find the users permissions
$stmt = db_execute("CALL get_user_permissions(?)", [$_SESSION['username']]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);
$perm = $row['permissions'];

?>
<html>
    
    <head>
        <title>Overseer 3</title>
        <link rel="stylesheet" href="css/Overseer.css">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
        <link href="https://db.onlinewebfonts.com/c/5b026bf0b879e4356472ed8c36dc48c7?family=EmojiSymbols-Regular" rel="stylesheet"> 

        <link rel="icon" type="image/svg+xml" href="svg/eye.svg">

    </head>

    <body>
        <page_header id="cnf0C" class="display-flex-col _font collapsed">
            
            <header_container class="display-flex">
                <logo_container class="display-flex noselect" <?php if ($perm == "*") {echo 'onclick="window.minimax(\'cnf0\', \'var(--logo_header_height)\')"';} ?> >
                    <logo>
                        <img src="svg/eye.svg">
                    </logo>
                    <logo_text>
                        Overseer
                    </logo_text>
                </logo_container>
                <user_container class="display-flex">
                    <header_username class="display-flex">
                        <?php
                            echo htmlspecialchars($_SESSION['username']);
                        ?>
                        <vertical_divide></vertical_divide>
                        <a href="logout.php" class="OS_link">Logout</a>
                    </header_username>
                    <status id="server_status" class="connected"></status>
                </user_container>
            </header_container>

            <?php
            // Only render the control panel for admin users.
            if ($perm == "*") { 
                echo '<control_panel_container id="control_panel_container"></control_panel_container>';
            }
            ?>
            
        </page_header>
        <devices id="devices" class="display-flex">
        </devices>
    </body>

    <script src=" https://cdn.jsdelivr.net/npm/chart.js@4.5.0/dist/chart.umd.min.js "></script>
    <script type="module" src="./js/Overseer.js"></script>

    <script>
        // Get the WSS port number.
        window.OSN_port = <?php echo json_encode(getenv('OSN_PORT')) ?>;

        const waitForImports = setInterval(() => {
            if (window.DYNAMIC_IMPORT_FINISHED) {
                clearInterval(waitForImports);
                window.CreateInfoWindow();
            }
        }, 50);
    </script>

</html>