-- Scripts for database generation
-- Read the wiki for instructions to set up the database

CREATE TABLE IF NOT EXISTS `games`(
    `game_id` INTEGER PRIMARY KEY,
    `name` TEXT,
    `description` TEXT,
    `route` TEXT,
    `api_filepath` TEXT 
);

CREATE TABLE IF NOT EXISTS `algorithms`(
    `algorithm_id` INTEGER PRIMARY KEY,
    `name` TEXT,
    `owner_id` INTEGER,
    `game_id` INTEGER,
    `filepath` TEXT,
    `submitted_on` INTEGER,
    FOREIGN KEY(`game_id`) REFERENCES `games`(`game_id`)
    -- Must add reference to owner_id once the table is created
);

 