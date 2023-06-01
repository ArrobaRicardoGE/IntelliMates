-- For development ONLY
-- Populate intellimates.db with test data. Make sure that the tables are created by running gen.sql

INSERT INTO `games` (`name`, `description`, `route`, `api_filepath`) VALUES ('Snake Game', 'Dos algoritmos controlan serpientes, compiten por comer y crecer mientras evitan colisionar. ¡El más largo gana!', 'snake-game', '');
INSERT INTO `users` (`username`, `email`, `password`, `created_on`) VALUES ('test', 'test@mail.com', 'test', unixepoch());
INSERT INTO `algorithms` (`name`, `owner_id`, `game_id`, `filepath`, `submitted_on`) VALUES ('Stupid Snake', 1, 1, '/test_algorithms/stupid_snake.py', unixepoch());
INSERT INTO `algorithms` (`name`, `owner_id`, `game_id`, `filepath`, `submitted_on`) VALUES ('Mayweather Snake', 1, 1, '/test_algorithms/mayweather_snake.py', unixepoch());
INSERT INTO `algorithms` (`name`, `owner_id`, `game_id`, `filepath`, `submitted_on`) VALUES ('Border Patrol Snake', 1, 1, '/test_algorithms/border_patrol_snake.py', unixepoch());