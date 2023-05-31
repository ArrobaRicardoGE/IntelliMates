from playerCommands import get_world, send_move

cnt = 0
advance = 1
while(True):
    world = get_world()
    if(world['game_status'] != 400):
        break
    if advance > 0:
        advance -= 1
        send_move(0)
        continue
    
    if cnt == 29:
        send_move(-1)
        cnt = 0
    else: 
        send_move(0)
        cnt += 1