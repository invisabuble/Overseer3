/* Change a user's password in the Overseer_Users table */

DROP PROCEDURE IF EXISTS change_password;

DELIMITER $$

CREATE PROCEDURE change_password(
    IN p_username       VARCHAR(50),
    IN p_password_hash  VARCHAR(255),
    IN p_secret_key     VARCHAR(255)
)
BEGIN
    -- Check if the user exists.
    IF EXISTS (

        SELECT 1 FROM Overseer_users WHERE username = p_username

    ) THEN

        -- Update the user's password information.
        UPDATE Overseer_users
        SET
            password_hash = p_password_hash,
            secret_key = p_secret_key
        WHERE username = p_username;

        -- Return a success message.
        SELECT 'SUCCESS' AS message;

    ELSE

        -- Raise a user error if the user does not exist.
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'User does not exist';

    END IF;
END$$

DELIMITER ;