#pragma once

#include<string>
#include<vector>

namespace backend{

    enum FILE_DESCRIPTOR { 
        READ, 
        WRITE
    };

    const int pipe_size = 2;
    using communication_pipe = int[pipe_size];
    
    class GameSpawner{
        public:
            GameSpawner(std::string game_path, std::string game_name, size_t number_players);
            
            /* Creates *number_of_players* instances of the game,
             * and returns a list of pipes, one for each player
             */
            std::vector<communication_pipe> create();
        
        private:
            GameSpawner();
            std::string game_path;
            std::string game_name;
            size_t number_players;
    };
}
