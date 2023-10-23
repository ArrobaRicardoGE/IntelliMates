#include "GameSpawner.h"
#include "PipeWrapper.h"
#include "snakeGame/WorldController.h"

#include <chrono> 
#include <thread>
#include <iostream>
#include <glog/logging.h>
#include <memory>
#include <string>
#include <vector>

using namespace backend;
int main(int argc, char **argv) {
    google::InitGoogleLogging(argv[0]);

    int number_of_players = std::stoi(argv[1]);
    std::string init_dir = argv[2];
    std::string result_dir = argv[3];
    int read_timeout = std::stoi(argv[4]);
    int max_number_of_moves = std::stoi(argv[5]);
    LOG(INFO) << "my init dir is: " << init_dir;

    int number_arguments = 6;
    std::vector<std::string> game_paths(number_of_players);
    for(int i=number_arguments; i<number_arguments+number_of_players; i++){
        game_paths[i-number_arguments] = argv[i];
    }

    GameSpawner game_spawner(game_paths, game_paths, number_of_players);
    auto raw_pipes = game_spawner.create();

    std::chrono::seconds duration(1);
    std::this_thread::sleep_for(duration);

    std::vector<std::unique_ptr<PipeWrapper>> wrapped_pipes;
    for(int i=0; i<number_of_players; i++){
       auto wrapper = std::make_unique<PipeWrapper>(raw_pipes[i][FILE_DESCRIPTOR::READ], raw_pipes[i][FILE_DESCRIPTOR::WRITE]);
       wrapped_pipes.push_back(std::move(wrapper));
    }
    
    snake::WorldController world(
            number_of_players,
            std::move(wrapped_pipes),
            read_timeout,
            max_number_of_moves);

    world.build_world_from_file(init_dir);
    LOG(INFO) << "Initialized world from: " << init_dir;
    world.run_game();
    LOG(INFO) << "Finished running the game: ";
    world.write_events(result_dir);
    LOG(INFO) << "Wrote game results to: " << result_dir;
}



    

