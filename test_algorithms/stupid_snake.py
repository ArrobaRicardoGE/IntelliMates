from playerCommands import get_world, send_move

while(True):
    world = get_world()
    if(world['game_status'] != 400):
        break
    send_move(0)