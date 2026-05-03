import os
import shutil
import time
from PyQt6.QtCore import QObject, pyqtSignal
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Define file categories based on extensions
CATEGORIES = {
    'Documents': ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx', '.ppt', '.pptx', '.csv'],
    'Images': ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.bmp', '.webp'],
    'Media': ['.mp4', '.mp3', '.wav', '.mkv', '.avi', '.mov'],
    'Archives': ['.zip', '.rar', '.7z', '.tar', '.gz'],
    'Executables': ['.exe', '.msi', '.bat', '.sh']
}

def get_category(filename):
    ext = os.path.splitext(filename)[1].lower()
    for cat, exts in CATEGORIES.items():
        if ext in exts:
            return cat
    return 'Other'

class SorterSignals(QObject):
    log_msg = pyqtSignal(str)

class FileSorter:
    def __init__(self, signals: SorterSignals):
        self.signals = signals

    def sort_directory(self, target_dir):
        if not target_dir or not os.path.exists(target_dir):
            self.signals.log_msg.emit("Invalid directory.")
            return

        self.signals.log_msg.emit(f"Starting one-time sort for: {target_dir}")
        moved_count = 0
        
        try:
            for item in os.listdir(target_dir):
                item_path = os.path.join(target_dir, item)
                if os.path.isfile(item_path):
                    if self._move_file(item_path, target_dir):
                        moved_count += 1
            self.signals.log_msg.emit(f"Sort complete. Moved {moved_count} files.")
        except Exception as e:
            self.signals.log_msg.emit(f"Error during sort: {e}")

    def _move_file(self, file_path, base_dir):
        filename = os.path.basename(file_path)
        category = get_category(filename)
        
        # Optionally skip 'Other' or move to an 'Other' folder. Let's just skip if we don't want to clutter.
        if category == 'Other':
            return False

        cat_dir = os.path.join(base_dir, category)
        if not os.path.exists(cat_dir):
            os.makedirs(cat_dir)

        dest_path = os.path.join(cat_dir, filename)
        
        # Handle conflict by renaming with a counter
        if os.path.exists(dest_path):
            base, ext = os.path.splitext(filename)
            counter = 1
            while os.path.exists(dest_path):
                dest_path = os.path.join(cat_dir, f"{base} ({counter}){ext}")
                counter += 1

        try:
            shutil.move(file_path, dest_path)
            self.signals.log_msg.emit(f"Moved: {filename} -> {category}/")
            return True
        except Exception as e:
            self.signals.log_msg.emit(f"Failed to move {filename}: {e}")
            return False

class SorterEventHandler(FileSystemEventHandler):
    def __init__(self, sorter: FileSorter, base_dir: str):
        super().__init__()
        self.sorter = sorter
        self.base_dir = base_dir

    def on_created(self, event):
        if not event.is_directory:
            # Wait a brief moment to ensure the file is fully written before moving
            time.sleep(0.5) 
            self.sorter._move_file(event.src_path, self.base_dir)

class DirectoryMonitor:
    def __init__(self, signals: SorterSignals):
        self.signals = signals
        self.observer = None
        self.sorter = FileSorter(signals)

    def start(self, target_dir):
        if self.observer:
            self.stop()
            
        if not target_dir or not os.path.exists(target_dir):
            self.signals.log_msg.emit("Invalid directory for monitoring.")
            return False

        event_handler = SorterEventHandler(self.sorter, target_dir)
        self.observer = Observer()
        self.observer.schedule(event_handler, target_dir, recursive=False)
        self.observer.start()
        self.signals.log_msg.emit(f"Started monitoring: {target_dir}")
        return True

    def stop(self):
        if self.observer:
            self.observer.stop()
            self.observer.join()
            self.observer = None
            self.signals.log_msg.emit("Stopped monitoring.")
