#include "WorldController.h"

#include <algorithm>
#include <deque>
#include <glog/logging.h>
#include <fstream>
#include <iostream>
#include <random>
#include <vector>

namespace backend::snake{

    WorldController::WorldController(
            int number_of_players,
            std::vector<std::unique_ptr<PipeWrapper>>&& communication_pipes,
            int read_timeout,
            int max_number_of_moves) : 
        number_of_players(number_of_players),
        communication_pipes(std::move(communication_pipes)),
        read_timeout(read_timeout),
        max_number_of_moves(max_number_of_moves) {
            game_turns.resize(number_of_players);
            snake_grow.resize(number_of_players);
            snake_status.resize(number_of_players);
        }


    void WorldController::build_world_from_file(std::string world_file){
        std::fstream file(world_file, std::ios::in); 
        if (!file.is_open()) {
            LOG(ERROR) << "Failed to open world file.";
        }

        file >> rows >> columns;
        int num; file >> num;
        LOG(INFO) << "Read number of players";

        std::vector<std::vector<std::pair<int,coordinate>>> snake_containers(number_of_players);
        for(int i=0; i<rows; i++){
            for(int j=0; j<columns; j++){
                int block_status=0;
                file >> block_status;

                if(block_status == 0) continue;

                int idx = block_status/1000 - 1;
                if(idx < 0 || idx >= number_of_players){
                    LOG(ERROR) << "Invalid world map block with status: " << block_status;
                    continue;
                }
                snake_containers[idx].push_back({block_status,{i,j}});
            }
        }
        LOG(INFO) << "FINISHED READING WORLD BLOCKS";

        for(int idx=0; idx<number_of_players; idx++){
            if(snake_containers[idx].size() == 0){
                LOG(WARNING) << "Snake of size 0";
            }
            std::sort(snake_containers[idx].begin(), snake_containers[idx].end());
            ORIENTATION snake_orientation = ORIENTATION::NORTH;
            if(snake_containers[idx].size() > 1){
                snake_orientation = get_snake_orientation(snake_containers[idx][0].second, 
                        snake_containers[idx][1].second);
            }

            std::deque<coordinate> snake_deque;
            for(auto snake_coordinate : snake_containers[idx]){
                snake_deque.push_back(snake_coordinate.second);
            }



            snakes.push_back(Snake(snake_deque, snake_orientation));
        }

        LOG(INFO) << "FINISHED setting snakes";


        walls_matrix.resize(rows);
        for(int i=0; i<rows; i++){
            walls_matrix[i].resize(columns);
            for(int j=0; j<columns; j++){
                walls_matrix[i][j].resize(4);
                for(int k=0; k<4; k++) file>>walls_matrix[i][j][k];
            }
        }
    }


    ORIENTATION WorldController::get_snake_orientation(
            coordinate head,
            coordinate next_head){
        if((head.first+1)%rows == next_head.first) return ORIENTATION::NORTH;
        if((head.first-1+rows)%rows == next_head.first) return ORIENTATION::SOUTH;
        if((head.second+1)%columns == next_head.second) return ORIENTATION::WEST;
        return ORIENTATION::EAST;
    }

    bool WorldController::is_collision(coordinate previous_block, coordinate next_block){
        if((previous_block.first+1)%rows == next_block.first){
            return check_collision(WALL_DIRECTION::DOWN, previous_block) && 
                check_collision(WALL_DIRECTION::UP, next_block);
        }
        if((previous_block.first-1+rows)%rows == next_block.first){
            return check_collision(WALL_DIRECTION::UP, previous_block) &&
                check_collision(WALL_DIRECTION::DOWN, next_block);
        }
        if((previous_block.second+1)%columns == next_block.second){
           return check_collision(WALL_DIRECTION::RIGHT, previous_block) &&
              check_collision(WALL_DIRECTION::LEFT, next_block);
        } 
        if((previous_block.second-1+columns)%columns == next_block.second){
            return check_collision(WALL_DIRECTION::LEFT, previous_block) &&
                check_collision(WALL_DIRECTION::RIGHT, next_block);
        }
        return true;
    }

    bool WorldController::check_collision(WALL_DIRECTION direction, coordinate block){
        return walls_matrix[block.first][block.second][direction];
    }

    std::map<int,int> WorldController::get_players_move(){
        std::map<int,int> turns_move;
        for(int i=0; i<number_of_players; i++){
            if(snakes[i].is_alive() == false) continue;
            std::string move_string = communication_pipes[i]->read_data(read_timeout);
            if(move_string.empty()) snakes[i].kill();
            if(snakes[i].is_alive() == false) continue;

            int move_int = stoi(move_string);
            turns_move[i]=move_int;
        }
        return turns_move;
    }

    void WorldController::send_players_world_info(){
        std::vector<int> players_alive;
        for(int i=0; i<number_of_players; i++){
            if(snakes[i].is_alive()) players_alive.push_back(i+1);
        }

        std::vector<std::vector<int>> world_map;
        world_map.resize(rows);
        for(int i=0; i<rows; i++) world_map[i].resize(columns);
        for(int i=0; i<number_of_players; i++){
            if(snakes[i].is_alive() == false) continue;
            auto snake_body = snakes[i].get_body();
            for(coordinate coord: snake_body){
                world_map[coord.first][coord.second] = i+1;
                if(coord == snakes[i].get_head()) world_map[coord.first][coord.second]+=10;
            }
        }


        for(coordinate coord: snake_food){
           world_map[coord.first][coord.second] = 20;
        } 



        for(int i=0; i<number_of_players; i++){
            //_get_game_status
            communication_pipes[i]->add(status);
            communication_pipes[i]->add_eol();
            //_get_my_player_id
            communication_pipes[i]->add(i+1);
            communication_pipes[i]->add_eol();
            //_get_players_alive
            for(int idx: players_alive) communication_pipes[i]->add(idx);
            communication_pipes[i]->add_eol();
            //_get_world_dimensions
            communication_pipes[i]->add(rows);
            communication_pipes[i]->add(columns);
            communication_pipes[i]->add_eol();

            //
            //_get_world_map
            communication_pipes[i]->add(rows);
            communication_pipes[i]->add(columns);
            communication_pipes[i]->add_eol();
            for(int ii=0; ii<rows; ii++){
                for(int j=0; j<columns; j++) communication_pipes[i]->add(world_map[ii][j]);
                communication_pipes[i]->add_eol();
            }

            // _get_world_walls
            communication_pipes[i]->add(rows);
            communication_pipes[i]->add(columns);
            communication_pipes[i]->add_eol();
            for(int ii=0; ii<rows; ii++){
                for(int j=0; j<columns; j++){
                    communication_pipes[i]->add(walls_matrix[ii][j][WALL_DIRECTION::DOWN]);
                    communication_pipes[i]->add(walls_matrix[ii][j][WALL_DIRECTION::LEFT]);
                    communication_pipes[i]->add(walls_matrix[ii][j][WALL_DIRECTION::UP]);
                    communication_pipes[i]->add(walls_matrix[ii][j][WALL_DIRECTION::RIGHT]);
                    if(ii != rows-1 || j != columns-1) communication_pipes[i]->add_eol();
                }
            }
            communication_pipes[i]->write_data();
        }
    }

    coordinate WorldController::spawn_food(){
        std::set<coordinate> bad_coordinates;
        for(int i=0; i<number_of_players; i++){
            if(!snakes[i].is_alive()) continue;
            auto snake_body = snakes[i].get_body();
            for(auto coord : snake_body){
                bad_coordinates.insert(coord);
            }
        }

        std::random_device rd;  
        std::mt19937 gen(rd()); 
        std::uniform_int_distribution<int> dist(0, 1000000);
        int spawn_rate = dist(gen);
        if(spawn_rate % 4 != 0){
           return {-1,-1};
        }
        int x = dist(gen)%rows;
        int y = dist(gen)%columns;
        coordinate new_food(x,y);
        if(bad_coordinates.find(new_food) != bad_coordinates.end()) return {-1,-1};
        if(snake_food.find(new_food) != snake_food.end()) return {-1,-1};
        return new_food;

    }

    void WorldController::log_turn(
            std::map<int,int>& players_move,
            std::map<int,bool>& players_eat,
            std::map<int,bool>& players_alive,
            coordinate food_coordinate){
        food_spawn_log.push_back(food_coordinate);
        for(int i=0; i<number_of_players; i++){
             game_turns[i].push_back(players_move[i]);
             snake_grow[i].push_back(players_eat[i]);
             snake_status[i].push_back(players_alive[i]);
        }
    }

    void WorldController::run_turn(){
        
        send_players_world_info();
        auto players_move = get_players_move();
        std::map<int,bool> snake_grow;
        for(int i=0; i<number_of_players; i++){
            if(!snakes[i].is_alive()) continue;
            int mv = players_move[i];
            coordinate head_block = snakes[i].get_head();
            coordinate next_block;
            next_block.first %= rows;
            next_block.second %= columns;
            if(mv == 0) next_block = snakes[i].get_front();
            if(mv == 1) next_block = snakes[i].get_right();
            if(mv == -1) next_block = snakes[i].get_left();

            if(is_collision(head_block, next_block)){ 
                snakes[i].kill();
                continue;
            }
            bool grow = false;
            if(snake_food.find(next_block) != snake_food.end()) {
                grow=true;
                snake_food.erase(next_block);
            }
            snake_grow[i] = grow;
            if(mv == 0) snakes[i].move_front(rows, columns, grow);
            if(mv == 1) snakes[i].move_right(rows, columns, grow);
            if(mv == -1) snakes[i].move_left(rows, columns, grow);
            
        }

        std::map<coordinate, int> body_count;
        for(int i=0; i<number_of_players; i++){
            auto vector_coordinates = snakes[i].get_body();
            for(coordinate coord: vector_coordinates){
                body_count[coord]++;
            }
        }

        for(int i=0; i<number_of_players; i++){
            if(body_count[snakes[i].get_head()] > 1) snakes[i].kill();
        }

        std::map<int,bool> players_alive;
        for(int i=0; i<number_of_players; i++) players_alive[i] = snakes[i].is_alive();

        coordinate food_coordinate = spawn_food();
        if(food_coordinate.first != -1) snake_food.insert(food_coordinate);
        log_turn(players_move, snake_grow, players_alive, food_coordinate);
    }

    void WorldController::run_game(){
        int moves = 0;
        while(moves < max_number_of_moves){
            moves++;
            int number_alive = 0;
            for(int i=0; i<number_of_players; i++){
                if(snakes[i].is_alive()) number_alive++;
            }
            if(number_alive == 0){
                status = 500;
                send_players_world_info();
                return;
            }
            int winner = 0;
            if(number_alive == 1){
                for(int i=0; i<number_of_players; i++){
                    if(snakes[i].is_alive()) winner = i+1;
                }
                status = winner; 
                send_players_world_info();
                return;
            }

            run_turn();
        }
        status = 100;
        send_players_world_info();
        return;
    }

    void WorldController::write_events(std::string events_file){
        std::ofstream file(events_file);
        file << game_turns[0].size() << ' ' << game_turns.size() << '\n';
        for(int i=0; i<game_turns[0].size(); i++){
            for(int j=0; j<number_of_players; j++){
                file << game_turns[j][i] << ' ' << snake_grow[j][i] << ' ' << snake_status[j][i] << '\n';
            }
            file << food_spawn_log[i].first << ' ' << food_spawn_log[i].second << '\n';
        }
        file << status << std::endl;
        file.close();
    }
}
