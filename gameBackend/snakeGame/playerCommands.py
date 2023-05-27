def _get_game_status():
    r''' Reads a single number, the game status '''
    status = int(input())
    return status


def _get_my_player_id():
    r''' Reads a single number, the player_id'''
    player_id = int(input())
    return player_id

def _get_players_alive():
    r'''Reads the idx of the active players, separated by 
    spaces'''
    line = input()
    players_alive = list(map(int,line.split()))
    return players_alive

def _get_world_dimensions():
    r''' Reads a single line with two numbers, the number of rows,
    and the number of columns, separated by spaces'''
    line = input()
    rows, columns = map(int, line.split())
    return rows, columns

def _get_world_map():
    r''' Reads a line, with the number of rows and columns,
    then reads x lines, one for each row, with the world map, separated by spaces'''

    line = input()
    rows, columns = map(int, line.split())
    world_map = []
    for i in range(rows):
        line = input()
        world_row = list(map(int,line.split()))
        world_map.append(world_row)
    return world_map

def _get_world_walls():
    r''' Reads a line, with the number of rows and columns.
    Then for each row and columns, reads a line, the information of the walls.
    The order of transversal is row then column'''

    line = input()
    rows, columns = map(int, line.split())
    world_walls = []
    for i in range(rows):
        world_row = []
        for j in range(columns):
            line = input()
            walls = list(map(int,line.split()))
            world_row.append(walls)
        world_walls.append(world_row)

    return world_walls

    
def get_world():
    r''' Returns a dictionary with the following information
    game_status: a number representing the game status
        400: game in progress
        500: game error
        [1,4]: meaning that player won
    my_player_id: return player id, a number from [1,4]
    players_alive: returns a list with the indices of players alive, indices go from [1,4]
    world_dimensions: a tuple of how many (rows, columns)
    world_map: a matrix with a number indicating,
        0: empty square
        [1,4]: a snake with that index number occupies that square
        [11, 14]: the head of the snake with that number occupies that square
        [20]: food
    world_walls: a matrix with a list in each position,
        list goes [down, left, up, right]
        a value of 0 represents no wall, 
        a value of 1 represents a wall
    '''
    world = {}
    word['game_status'] = _get_game_status()
    world['my_player_id'] = _get_my_player_id()
    world['players_alive'] = _get_players_alive()
    world['world_dimensions'] = _get_world_dimensions()
    world['world_map'] = _get_world_map()
    world['world_walls'] = _get_world_walls()

