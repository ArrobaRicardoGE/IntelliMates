CREATE TABLE IF NOT EXISTS `game`(
    `game_id` INTEGER PRIMARY KEY,
    `name` TEXT,
    `description` TEXT,
    `route` TEXT,
    `api_filepath` TEXT 
);

CREATE TABLE IF NOT EXISTS `algorithm`(
    `algorithm_id` INTEGER PRIMARY KEY,
    `owner_id` INTEGER,
    `game_id` INTEGER,
    `filepath` TEXT,
    `submitted_on` INTEGER,
    FOREIGN KEY(`game_id`) REFERENCES `game`(`game_id`)
    -- Must add reference to owner_id once the table is created
);

 