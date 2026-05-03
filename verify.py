import os
from tools.auto_sorter.logic import FileSorter, SorterSignals
from PyQt6.QtWidgets import QApplication
import sys

def verify():
    app = QApplication(sys.argv)
    
    signals = SorterSignals()
    def on_log(msg):
        print(f"LOG: {msg}")
    
    signals.log_msg.connect(on_log)
    
    sorter = FileSorter(signals)
    
    test_dir = os.path.join(os.path.dirname(__file__), "test_dir")
    print(f"Testing sort on {test_dir}")
    
    sorter.sort_directory(test_dir)
    
    # Check if directories were created
    print("Contents after sort:")
    for root, dirs, files in os.walk(test_dir):
        level = root.replace(test_dir, '').count(os.sep)
        indent = ' ' * 4 * (level)
        print('{}{}/'.format(indent, os.path.basename(root)))
        subindent = ' ' * 4 * (level + 1)
        for f in files:
            print('{}{}'.format(subindent, f))

if __name__ == "__main__":
    verify()
