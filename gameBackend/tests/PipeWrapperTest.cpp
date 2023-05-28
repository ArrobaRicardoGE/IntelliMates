#include "../PipeWrapper.h"

#include <fstream>
#include <gtest/gtest.h>
#include <glog/logging.h>
#include <string>
#include<sys/wait.h>

using namespace backend;
using namespace std;

TEST(pipe_wrapper_test, simple_print_test){
    const string test_path = "./simplePrintTest";
    const string test_name = "simplePrintTest";
    
    int pipe1[2];
    int pipe2[2];
    pipe(pipe1);
    pipe(pipe2);
    int master_read = pipe2[0];
    int master_write = pipe1[1];

    int rc = fork();
    if(rc == 0){
        dup2(pipe1[0], STDIN_FILENO);
        dup2(pipe2[1], STDOUT_FILENO);
        execl(test_path.c_str(), test_name.c_str(), NULL);
    }

    PipeWrapper pipe_wrapper(master_read, master_write);
    string first_read = pipe_wrapper.read_data(10);
    stringstream ss(first_read);
    string a,b,c;
    int d,e;
    ss >> a >> b >> c >> d >> e;
    ASSERT_EQ(a,"First");
    ASSERT_EQ(b,"second");
    ASSERT_EQ(c, "3");
    ASSERT_EQ(d, 45);
    ASSERT_EQ(e, 6);

    //check buffer is empty
    string second_read = pipe_wrapper.read_data(1);
    ASSERT_EQ(second_read.size(), 0);
}
    
TEST(pipe_wrapper_test, timeout_test){
    const string test_path = "./simplePrintTest";
    const string test_name = "simplePrintTest";
    
    int pipe1[2];
    int pipe2[2];
    pipe(pipe1);
    pipe(pipe2);
    int master_read = pipe2[0];
    int master_write = pipe1[1];

    int rc = fork();
    if(rc == 0){
        dup2(pipe1[0], STDIN_FILENO);
        dup2(pipe2[1], STDOUT_FILENO);
        execl(test_path.c_str(), test_name.c_str(), NULL);
    }

    PipeWrapper pipe_wrapper(master_read, master_write);
    string first_read = pipe_wrapper.read_data(1);
    ASSERT_EQ(first_read.size(), 0);
}

TEST(pipe_wrapper_test, multiple_writes){
    const string test_path = "./multipleWritesTest";
    const string test_name = "multipleWritesTest";
    
    int pipe1[2];
    int pipe2[2];
    pipe(pipe1);
    pipe(pipe2);
    int master_read = pipe2[0];
    int master_write = pipe1[1];

    int rc = fork();
    if(rc == 0){
        dup2(pipe1[0], STDIN_FILENO);
        dup2(pipe2[1], STDOUT_FILENO);
        execl(test_path.c_str(), test_name.c_str(), NULL);
    }

    PipeWrapper pipe_wrapper(master_read, master_write);
    pipe_wrapper.add(102); 
    pipe_wrapper.add(201);
    pipe_wrapper.write_data();
    int ans = stoi(pipe_wrapper.read_data(1));
    ASSERT_EQ(ans, 102+201);

    pipe_wrapper.add(-15);
    pipe_wrapper.add(20);
    pipe_wrapper.write_data();
    ans = stoi(pipe_wrapper.read_data(1));
    ASSERT_EQ(ans, -15*20);
}

int main(int argc, char **argv) {
  ::testing::InitGoogleTest(&argc, argv);
  google::InitGoogleLogging(argv[0]);
  return RUN_ALL_TESTS();
}

