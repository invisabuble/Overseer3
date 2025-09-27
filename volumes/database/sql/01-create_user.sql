/* Create a user in the Overseer_Users table */

DROP PROCEDURE IF EXISTS create_user;

DELIMITER $$

CREATE PROCEDURE create_user(
    IN p_username       VARCHAR(50),
    IN p_permissions    VARCHAR(50),
    IN p_password_hash  VARCHAR(255),
    IN p_secret_key     VARCHAR(255)
)
BEGIN
    -- Check if the user already exists.
    IF NOT EXISTS (
        SELECT 1 FROM Overseer_users WHERE username = p_username
    ) THEN
    -- If the user doesnt exist create them in the database.
        INSERT INTO Overseer_users (
            username, permissions, password_hash, secret_key
        ) VALUES (
            p_username, p_permissions, p_password_hash, p_secret_key
        );
    ELSE
        -- Raise a user error (1000)
        SIGNAL SQLSTATE '1000'
            SET MESSAGE_TEXT = 'User already exists';
    END IF;
END$$

DELIMITER ;
