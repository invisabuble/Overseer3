/* Create a user in the Overseer_Users table */

DROP PROCEDURE IF EXISTS create_device;

DELIMITER $$

CREATE PROCEDURE create_device(
    IN p_device_name VARCHAR(50),
    IN p_parent VARCHAR(255)
)
BEGIN
    INSERT INTO Overseer_devices (
        verified, device_name, parent
    ) VALUES (
        'false', p_device_name, p_parent
    );
END$$

DELIMITER ;