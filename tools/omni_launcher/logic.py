import os
import threading

class OmniLogic:
    def __init__(self):
        self.app_index = {}
        self.index_thread = threading.Thread(target=self._build_index, daemon=True)
        self.index_thread.start()

    def _build_index(self):
        paths_to_scan = [
            os.path.expandvars(r"%ProgramData%\Microsoft\Windows\Start Menu\Programs"),
            os.path.expandvars(r"%AppData%\Microsoft\Windows\Start Menu\Programs")
        ]
        
        for base_path in paths_to_scan:
            if not os.path.exists(base_path):
                continue
            for root, _, files in os.walk(base_path):
                for file in files:
                    if file.lower().endswith('.lnk'):
                        name = os.path.splitext(file)[0]
                        full_path = os.path.join(root, file)
                        self.app_index[name.lower()] = full_path

    def search(self, query, limit=5):
        query = query.lower().strip()
        if not query:
            return []
            
        results = []
        for name, path in self.app_index.items():
            if query in name:
                results.append((name, path))
                if len(results) >= limit:
                    break
        return results

    def launch(self, path):
        try:
            os.startfile(path)
            return True
        except Exception as e:
            print(f"Failed to launch: {e}")
            return False
