-- For development ONLY
-- Populate intellimates.db with test data. Make sure that the tables are created by running gen.sql

INSERT INTO `games` (`name`, `description`, `route`, `api_filepath`) VALUES ('Snake Game', 'Dos algoritmos controlan serpientes, compiten por comer y crecer mientras evitan colisionar. ¡El más largo gana!', 'snake-game', '');
INSERT INTO `algorithms` (`name`, `owner_id`, `game_id`, `filepath`, `submitted_on`) VALUES ('Testing algorithm 1', 1, 1, '', unixepoch());
INSERT INTO `algorithms` (`name`, `owner_id`, `game_id`, `filepath`, `submitted_on`) VALUES ('Testing algorithm 2', 2, 1, '', unixepoch());
INSERT INTO `algorithms` (`name`, `owner_id`, `game_id`, `filepath`, `submitted_on`) VALUES ('Testing algorithm 3', 3, 1, '', unixepoch());
INSERT INTO `algorithms` (`name`, `owner_id`, `game_id`, `filepath`, `submitted_on`) VALUES ('Testing algorithm 4', 4, 1, '', unixepoch());
INSERT INTO `algorithms` (`name`, `owner_id`, `game_id`, `filepath`, `submitted_on`) VALUES ('Testing algorithm 5', 5, 1, '', unixepoch());