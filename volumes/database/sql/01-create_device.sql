/* Create a user in the Overseer_Users table */

DROP PROCEDURE IF EXISTS create_device;

DELIMITER $$

CREATE PROCEDURE create_device(
    IN p_device_name VARCHAR(50),
    IN p_parent VARCHAR(255)
)
BEGIN

    DECLARE v_parent_id INT;

    -- Look up the user ID from the username.
    SELECT id INTO v_parent_id
    FROM Overseer_users
    WHERE username = p_parent_username
    LIMIT 1;

    -- Insert device into table.
    INSERT INTO Overseer_devices (
        verified, device_name, parent
    ) VALUES (
        'false', p_device_name, v_parent_id
    );

END$$

DELIMITER ;