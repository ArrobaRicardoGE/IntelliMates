#pragma once

#include <string>

namespace backend{
    class PipeWrapper {
        public:
            PipeWrapper(int read_end, int write_end);
            ~PipeWrapper();

            /* adds a number to the buffer, if there was data in the buffer, 
             * then it will add a delimiter between the old data and the new 
             * one
             */
            void add(int number, char delimiter = ' ');
            
            // Same behaviour as add(int number, ...) but with a string
            void add(std::string str, char delimiter = ' ');

            /* Writes out the buffer data to the write_end of the pipe followed
             * by an end of line.
             */
            void write_data();
            std::string read_data(int timeout_seconds);

        private:
            PipeWrapper();
            int read_end;
            int write_end;
            std::string buffer;

            const int c_buffer_size = 4096;
    };
}
