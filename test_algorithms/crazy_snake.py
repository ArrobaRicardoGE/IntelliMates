from playerCommands import get_world, send_move
from random import randint

DOWN = 0
LEFT = 1
UP = 2
RIGHT = 3

actual_dir = UP

def front_free(x, y, world_walls, new_dir):
    return (world_walls[x][y][new_dir] == 0)

def occupied(x, y, world):
    if world['world_map'][x][y] != 0 and world['world_map'][x][y] != 20:
        return True
    return False

def get_head_position(pid, world_map):
    for i in range(len(world_map)):
        for j in range(len(world_map[i])):
            if world_map[i][j] == 10 + pid:
                return i, j

while(True):
    world = get_world()
    if(world['game_status'] != 400):
        break
    my_player_id = world['my_player_id']
    x, y = get_head_position(my_player_id, world['world_map'])

    new_move = randint(-1, 1)
    while not front_free(x, y, world['world_walls'], (actual_dir + new_move + 4) % 4):
        new_move = randint(-1, 1)

    actual_dir = (actual_dir + new_move + 4) % 4
    send_move(new_move)    