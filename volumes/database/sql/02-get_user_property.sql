/* Get a property of a user */

DROP PROCEDURE IF EXISTS get_user_permissions;

DELIMITER $$

CREATE PROCEDURE get_user_permissions(
    IN p_username VARCHAR(255)
)
BEGIN
    SELECT permissions
    FROM Overseer_users
    WHERE username=p_username;
END$$

DELIMITER ;