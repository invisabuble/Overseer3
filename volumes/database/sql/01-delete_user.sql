/* Delete a user from the Overseer_users table */

DROP PROCEDURE IF EXISTS delete_user;

DELIMITER $$

CREATE PROCEDURE delete_user(
    IN p_username VARCHAR(50)
)
BEGIN
    -- Check if the user exists.
    IF EXISTS (

        SELECT 1 FROM Overseer_users WHERE username = p_username

    ) THEN

        -- Delete the user from the database.
        DELETE FROM Overseer_users
        WHERE username = p_username;

        -- Return a success message.
        SELECT 'SUCCESS' AS message;

    ELSE

        -- Raise a user error (45000) lowest user definable error.
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'User does not exist';

    END IF;
END$$

DELIMITER ;