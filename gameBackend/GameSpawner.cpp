#include "GameSpawner.h"

#include <glog/logging.h>
#include <string>
#include <unistd.h>
#include <vector>

namespace backend{
    GameSpawner::GameSpawner(std::vector<std::string> game_path, std::vector<std::string> game_name, size_t number_players) : 
        game_path(game_path), game_name(game_name), number_players(number_players) {}

    std::vector<communication_pipe> GameSpawner::create(){
        std::vector<communication_pipe> all_pipes(2*number_players);
        for(int i=0; i<number_players; i++){
            pipe(all_pipes[i*2]);
            pipe(all_pipes[i*2+1]);
            pid_t process_id = fork();
            if(process_id == 0){
                // child process
                
                // close logger
                google::ShutdownGoogleLogging();

                // close all pipes except the ones of this process
                for(int j=0; j<2*i; j++){
                    close(all_pipes[j][0]);
                    close(all_pipes[j][1]);
                }

                // duplicate the read and write end.
                dup2(all_pipes[2*i][FILE_DESCRIPTOR::READ], STDIN_FILENO);
                dup2(all_pipes[2*i+1][FILE_DESCRIPTOR::WRITE], STDOUT_FILENO);
                // close remaining pipes
                //close(all_pipes[2*i][FILE_DESCRIPTOR::WRITE]);
                //close(all_pipes[2*i+1][FILE_DESCRIPTOR::READ]);

                int a = execl(game_path[i].c_str(), game_name[i].c_str(), NULL);
                exit(0);
            }

            LOG(INFO) << "Forked process with pid: " << process_id;
        }

        std::vector<communication_pipe> master_pipes(number_players);
        // get master end of the pipes
        for(int i=0; i<number_players; i++){
            master_pipes[i][FILE_DESCRIPTOR::READ] = all_pipes[2*i+1][FILE_DESCRIPTOR::READ];
            master_pipes[i][FILE_DESCRIPTOR::WRITE] = all_pipes[2*i][FILE_DESCRIPTOR::WRITE];
        }

        // clase remaining pipes
        for(int i=0; i<number_players; i++){
            close(all_pipes[2*i][FILE_DESCRIPTOR::READ]);
            close(all_pipes[2*i+1][FILE_DESCRIPTOR::WRITE]);
        }
        LOG(INFO) << "Finished creating pipes";
        return master_pipes;
    }
        
}
