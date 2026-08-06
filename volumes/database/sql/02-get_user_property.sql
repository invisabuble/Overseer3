/* Get any single property of a user, by column name. */
 
DROP PROCEDURE IF EXISTS get_user_property;
 
DELIMITER $$
 
CREATE PROCEDURE get_user_property(
    IN p_username VARCHAR(255),
    IN p_column   VARCHAR(64)
)
BEGIN
    -- Column names can't be passed as bound parameters (those only work for
    -- values), so this has to build the query as a string. To keep that safe,
    -- p_column is checked against the table's actual columns first — only a
    -- name that already exists on Overseer_users can ever reach the query.
    -- Anything else (typos, injection attempts, junk input) is rejected here
    -- before any dynamic SQL is built at all.
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'Overseer_users'
          AND COLUMN_NAME = p_column
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid column name';
    END IF;
 
    -- p_username still goes through a normal bound parameter (USING @username)
    -- rather than being concatenated — only the already-validated column name
    -- is ever built into the query string.
    SET @sql = CONCAT('SELECT `', p_column, '` FROM Overseer_users WHERE username = ?');
    PREPARE stmt FROM @sql;
    SET @username = p_username;
    EXECUTE stmt USING @username;
    DEALLOCATE PREPARE stmt;
END$$
 
DELIMITER ;
