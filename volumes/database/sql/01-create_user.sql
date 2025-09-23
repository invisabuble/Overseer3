/* Create a user in the Overseer_Users table */

DROP PROCEDURE IF EXISTS create_user;

DELIMITER $$

CREATE PROCEDURE create_user(
    IN p_username VARCHAR(50),
    IN p_permissions VARCHAR(50),
    IN p_password_hash VARCHAR(255),
    IN p_devices INT
)
BEGIN

    -- Insert user into table.
    INSERT INTO Overseer_users (
        username, permissions, password_hash, devices
    ) VALUES (
        p_username, p_permissions, p_password_hash, p_devices
    );

END$$

DELIMITER ;
