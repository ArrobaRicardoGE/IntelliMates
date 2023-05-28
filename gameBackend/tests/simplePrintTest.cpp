#include <iostream>
#include <chrono>
#include <thread>

int main() {

    std::this_thread::sleep_for(std::chrono::seconds(2));
    std::cout << "First second 3 \n  45 " << '\n';
    std::this_thread::sleep_for(std::chrono::seconds(2));
    std::cout << 6 << std::endl;

    return 0;
}
