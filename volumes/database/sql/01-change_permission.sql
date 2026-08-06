/* Change a user's permission level in the Overseer_users table */

DROP PROCEDURE IF EXISTS change_permission;

DELIMITER $$

CREATE PROCEDURE change_permission(
    IN p_username   VARCHAR(50),
    IN p_permission VARCHAR(255)
)
BEGIN
    -- Check if the user exists.
    IF EXISTS (
        SELECT 1 FROM Overseer_users WHERE username = p_username
    ) THEN

        -- Update the user's permission level.
        UPDATE Overseer_users
        SET permissions = p_permission
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