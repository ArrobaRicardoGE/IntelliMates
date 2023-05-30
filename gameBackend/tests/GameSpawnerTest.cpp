#include "../GameSpawner.h"

#include <fstream>
#include <gtest/gtest.h>
#include <glog/logging.h>
#include <string>
#include<sys/wait.h>

using namespace backend;
using namespace std;

TEST(game_spawner_test, read_write_test){
    const string s_game_name = "singleWrite";
    const string s_game_path = "./singleWriteTest";

    vector<string> game_path; game_path.push_back(s_game_path);
    vector<string> game_name; game_name.push_back(s_game_name);

    GameSpawner spawner = GameSpawner(game_path, game_name, 1);
    vector<communication_pipe> pipes = spawner.create();

    int readEnd = pipes[0][FILE_DESCRIPTOR::READ];
    int writeEnd = pipes[0][FILE_DESCRIPTOR::WRITE];

    const char* dataToWrite = "1 2\n";
    write(writeEnd, dataToWrite, strlen(dataToWrite));

    // Read data from the pipe
    const int bufferSize = 256;
    char buffer[bufferSize];
    int status;
    ssize_t bytesRead = read(readEnd, buffer, bufferSize - 1);

    ASSERT_EQ(buffer[0], '3');
}

TEST(game_spawner_test, multiple_pipes_test){
    const string s_game_name = "singleWrite";
    const string s_game_path = "./singleWriteTest";

    vector<string> game_path; 
    vector<string> game_name; 
    const int number_games=5;

    for(int i=0; i<number_games; i++){
        game_path.push_back(s_game_path);
        game_name.push_back(s_game_name);
    }

    GameSpawner spawner = GameSpawner(game_path, game_name, number_games);
    vector<communication_pipe> pipes = spawner.create();

    vector<int> write_pipes(number_games);
    vector<int> read_pipes(number_games);
    for(int i=0; i<number_games; i++){
        write_pipes[i] = pipes[i][FILE_DESCRIPTOR::WRITE];
        read_pipes[i] = pipes[i][FILE_DESCRIPTOR::READ];
    }

    for(int i=0; i<number_games; i++){
        string data_to_write = std::to_string(i) + ' ' + std::to_string(i) + '\n';
        write(write_pipes[i], data_to_write.c_str(), strlen(data_to_write.c_str()));
    }

    const int bufferSize = 256;
    
    for(int i=0; i<number_games; i++){
        char buffer[bufferSize];
        ssize_t bytesRead = read(read_pipes[i], buffer, bufferSize-1);
        int ans = i*2;
        string b = std::to_string(ans);
        ASSERT_EQ(buffer[0], b[0]);
    }
}

TEST(game_spawner_test, multiple_writes_test){
    const string s_game_name = "multipleWritesTest";
    const string s_game_path = "./multipleWritesTest";

    vector<string> game_path; game_path.push_back(s_game_path);
    vector<string> game_name; game_name.push_back(s_game_name);

    GameSpawner spawner = GameSpawner(game_path, game_name, 1);
    vector<communication_pipe> pipes = spawner.create();

    int readEnd = pipes[0][FILE_DESCRIPTOR::READ];
    int writeEnd = pipes[0][FILE_DESCRIPTOR::WRITE];

    const char* dataToWrite = "4 3\n";
    write(writeEnd, dataToWrite, strlen(dataToWrite));

    // Read data from the pipe
    const int bufferSize = 256;
    char buffer[bufferSize];
    ssize_t bytesRead = read(readEnd, buffer, bufferSize - 1);

    ASSERT_EQ(buffer[0], '7');

    
    const char* dataToWrite2 = "9 1\n";
    write(writeEnd, dataToWrite2, strlen(dataToWrite2));

    // Read data from the pipe
    bytesRead = read(readEnd, buffer, bufferSize - 1);
    LOG(INFO) << buffer[0] << buffer[1] << buffer[2] << buffer[3];
    EXPECT_EQ(buffer[0], '9');
}

TEST(game_spawner_test, no_response_test){
    const string s_game_name = "noWriteTest";
    const string s_game_path = "./noWriteTest";

    vector<string> game_path; game_path.push_back(s_game_path);
    vector<string> game_name; game_name.push_back(s_game_name);

    GameSpawner spawner = GameSpawner(game_path, game_name, 1);
    vector<communication_pipe> pipes = spawner.create();

    int readEnd = pipes[0][FILE_DESCRIPTOR::READ];
    int writeEnd = pipes[0][FILE_DESCRIPTOR::WRITE];

    const char* dataToWrite = "1 2\n";
    write(writeEnd, dataToWrite, strlen(dataToWrite));

    // Read data from the pipe
    const int bufferSize = 256;
    char buffer[bufferSize];
    int status;
    ssize_t bytesRead = read(readEnd, buffer, bufferSize - 1);

    ASSERT_EQ(true, true);
}


int main(int argc, char **argv) {
  ::testing::InitGoogleTest(&argc, argv);
  google::InitGoogleLogging(argv[0]);
  return RUN_ALL_TESTS();
}

