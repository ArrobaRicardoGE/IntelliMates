from playerCommands import get_world, send_move
file_path = "snake_output.txt"  # Replace with your desired file path


while(True):
    world = get_world()
    with open(file_path, "w") as file:
        file.write(str(world))
    if(world['game_status'] != 400):
        break
    send_move(0)
