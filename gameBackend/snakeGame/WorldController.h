#pragma once

#include "Snake.h"
#include "../PipeWrapper.h"

#include <map>
#include <set>
#include <string>
#include <vector>

namespace backend::snake{

    enum WALL_DIRECTION{
        DOWN,
        LEFT, 
        UP,
        RIGHT
    };
        
    class WorldController{

        public:
            WorldController(
                    int number_of_players,
                    std::vector<PipeWrapper> communication_pipes,
                    int read_timeout,
                    int max_number_of_moves);

            void build_world_from_file(std::string world_file);

            void run_game();

            void write_events(std::string events_file);

        
        private:

            

            ORIENTATION get_snake_orientation(coordinate head,
                    coordinate next_head);

            bool check_collision(WALL_DIRECTION direction, coordinate block);

            bool is_collision(coordinate previous_block, coordinate next_block);

            std::map<int,int> get_players_move();
            void send_players_world_info();

            coordinate spawn_food();
            void log_turn(
                    std::map<int,int>& players_move, 
                    std::map<int, bool>& players_eat,
                    std::map<int, bool>& players_alive,
                    coordinate food_coordinate);

            void run_turn();

            int status=400;

            int number_of_players;
            std::vector<PipeWrapper> communication_pipes;
            int read_timeout;
            int max_number_of_moves;

            int rows;
            int columns;
            std::vector<Snake> snakes;
            std::set<coordinate> snake_food;
            std::vector<std::vector<std::vector<int>>> walls_matrix;
            std::vector<std::vector<int>> game_turns;
            std::vector<std::vector<int>> snake_grow;
            std::vector<std::vector<int>> snake_status;
            std::vector<coordinate> food_spawn_log;
    };
}

