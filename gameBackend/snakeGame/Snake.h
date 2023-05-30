#pragma once

#include <deque>
#include <vector>

namespace backend::snake{

    using coordinate = std::pair<int,int>;

    enum ORIENTATION{
        NORTH,
        EAST,
        SOUTH,
        WEST
    };

    class Snake{

        public:
            Snake(std::deque<coordinate>& start_positions, ORIENTATION start_orientation);

            coordinate get_left();
            coordinate get_right();
            coordinate get_front();

            void move_left(int N, int M, bool grow);
            void move_right(int N, int M, bool grow);
            void move_front(int N, int M, bool grow);

            std::vector<coordinate> get_body();

            bool is_alive();
            void kill();

            coordinate get_head();

        private:
            const int delta_x[4] = {-1,0,1,0};
            const int delta_y[4] = {0,1,0,-1};
            const ORIENTATION left_orientation[4] = {
                ORIENTATION::WEST,
                ORIENTATION::NORTH,
                ORIENTATION::EAST,
                ORIENTATION::SOUTH
            };
            const ORIENTATION right_orientation[4] = {
                ORIENTATION::EAST,
                ORIENTATION::SOUTH,
                ORIENTATION::WEST,
                ORIENTATION::NORTH
            };
            std::deque<coordinate> snake_body;
            ORIENTATION my_orientation;
            bool alive;
    };
}

