import unittest
import threading
from playerCommands import get_world

# The class containing the unit tests
class MyTestCase(unittest.TestCase):

    # Set up any necessary test fixtures
    def setUp(self):
        # Code to set up any necessary test fixtures goes here
        pass

    # Tear down any resources used by the test case
    def tearDown(self):
        # Code to tear down any resources goes here
        pass

    def test_read_world(self):
        world = get_world()
        rows, cols = world['world_dimensions']
        self.assertEqual(rows, len(world['world_map']))
        self.assertEqual(rows, len(world['world_walls']))
        for i in range(rows):
            self.assertEqual(cols, len(world['world_map'][i]))
            self.assertEqual(cols, len(world['world_walls'][i]))
            for j in range(cols):
                self.assertEqual(4,len(world['world_walls'][i][j]))


# Run the tests
if __name__ == '__main__':
    unittest.main()
