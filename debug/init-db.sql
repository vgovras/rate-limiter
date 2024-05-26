DROP TABLE IF EXISTS trotler_task;

CREATE TABLE IF NOT EXISTS trotler_task (
    trotler_task_id SMALLINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) default 'default',
    ttl BIGINT default null,
    start_in BIGINT DEFAULT 0,
    created_in BIGINT NOT NULL
);

CREATE TRIGGER before_insert_trotler_task BEFORE
INSERT ON trotler_task FOR EACH ROW BEGIN
SET NEW.created_in = UNIX_TIMESTAMP(NOW(3)) * 1000;
END;

INSERT INTO trotler_task VALUES ();

SELECT * FROM trotler_task;
