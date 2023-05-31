#include "Snake.h"

#include <vector>

namespace backend::snake{
    Snake::Snake(std::deque<coordinate>& start_positions, ORIENTATION start_orientation) :
        snake_body(start_positions), 
        my_orientation(start_orientation),
        alive(true) {}

    coordinate Snake::get_left(){
        coordinate head_coordinate = *snake_body.begin();
        ORIENTATION new_orientation = left_orientation[my_orientation];

        head_coordinate.first += delta_x[new_orientation];
        head_coordinate.second += delta_y[new_orientation];
        return head_coordinate;
    }


    coordinate Snake::get_right(){
        coordinate head_coordinate = *snake_body.begin();
        ORIENTATION new_orientation = right_orientation[my_orientation];

        head_coordinate.first += delta_x[new_orientation];
        head_coordinate.second += delta_y[new_orientation];
        return head_coordinate;
    }

    coordinate Snake::get_front(){
        coordinate head_coordinate = *snake_body.begin();

        head_coordinate.first += delta_x[my_orientation];
        head_coordinate.second += delta_y[my_orientation];
        return head_coordinate;
    }

    void Snake::move_left(int N, int M, bool grow){
        coordinate next_head = get_left();
        next_head.first %= N;
        next_head.second %= M;
        snake_body.push_front(next_head);
        if(!grow){ 
            snake_body.pop_back();
        }
        my_orientation = left_orientation[my_orientation];
    }
        
    void Snake::move_right(int N, int M, bool grow){
        coordinate next_head = get_right();
        next_head.first %= N;
        next_head.second %= M;
        snake_body.push_front(next_head);
        if(!grow){ 
            snake_body.pop_back();
        }
        my_orientation = right_orientation[my_orientation];
    }

    void Snake::move_front(int N, int M, bool grow){
        coordinate next_head = get_front();
        next_head.first %= N;
        next_head.second %= M;
        snake_body.push_front(next_head);
        if(!grow){ 
            snake_body.pop_back();
        }
    }

    std::vector<coordinate> Snake::get_body(){
        std::vector<coordinate> body;
        for(coordinate& block_coordinate: snake_body){
            body.push_back(block_coordinate);
        }
        return body;
    }

    coordinate Snake::get_head(){
        return *snake_body.begin();
    }

    bool Snake::is_alive(){
        return alive;
    }

    void Snake::kill(){
        alive = false;
    }
}
