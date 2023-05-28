#include "PipeWrapper.h"

#include <cstring>
#include <fcntl.h>
#include <glog/logging.h>
#include <iostream>
#include <sys/time.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>

namespace backend{

    PipeWrapper::PipeWrapper(int read_end, int write_end) : 
        read_end(read_end), write_end(write_end), buffer("") {
            if (read_end == -1 || write_end == -1) {
                LOG(ERROR) << "Recieved invalid pipe descriptors";
            }
        }

    PipeWrapper::~PipeWrapper() {
        if (read_end != -1) {
            close(read_end);
        }
        if (write_end != -1) {
            close(write_end);
        }
    }

    void PipeWrapper::add(int number, char delimiter){
        if(!buffer.empty()){
            buffer.push_back(delimiter);
        }
        buffer = buffer + std::to_string(number);
    }

    void PipeWrapper::add(std::string str, char delimiter){
        if(!buffer.empty()){
            buffer.push_back(delimiter);
        }
        buffer = buffer + str;
    }

    void PipeWrapper::write_data() {
        buffer.push_back('\n');
        write(write_end, buffer.c_str(), buffer.length());

        LOG(INFO) << "Wrote " << buffer.size() << " characters";
        buffer.clear();
    }

    std::string PipeWrapper::read_data(int timeout_seconds) {
        fd_set fds;
        FD_ZERO(&fds);
        FD_SET(read_end, &fds);

        struct timeval tv;
        tv.tv_sec = timeout_seconds;
        tv.tv_usec = 0;

        int result = select(read_end + 1, &fds, NULL, NULL, &tv);
        if (result == -1) {
            LOG(ERROR) << "Failed to read data from the pipe.";
            return "";
        } else if (result == 0) {
            LOG(INFO) << "Timeout occurred while reading from the pipe.";
            return "";
        }

        char read_buffer[c_buffer_size];
        ssize_t bytes_read = read(read_end, read_buffer, sizeof(read_buffer) - 1);
        if (bytes_read == -1) {
            LOG(ERROR) << "Failed to read data from the pipe.";
            return "";
        }

        read_buffer[bytes_read] = '\0';
        LOG(INFO) << "Read " << bytes_read << " number of bytes";
        return std::string(read_buffer);
    }
}
