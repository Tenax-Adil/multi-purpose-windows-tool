import os
import re

class RenamingRules:
    def __init__(self):
        self.prefix = ""
        self.suffix = ""
        self.replace_find = ""
        self.replace_with = ""
        self.use_regex = False
        self.strip_spaces = False
        self.strip_underscores = False
        self.sequential_numbering = False
        self.sequential_format = "_%03d" # e.g. _001

    def apply(self, original_name: str, index: int) -> str:
        name, ext = os.path.splitext(original_name)

        # 1. Strip
        if self.strip_spaces:
            name = name.replace(" ", "")
        if self.strip_underscores:
            name = name.replace("_", "")

        # 2. Replace
        if self.replace_find:
            if self.use_regex:
                try:
                    name = re.sub(self.replace_find, self.replace_with, name)
                except re.error:
                    pass # Invalid regex, ignore safely
            else:
                name = name.replace(self.replace_find, self.replace_with)

        # 3. Prefix/Suffix
        if self.prefix:
            name = f"{self.prefix}{name}"
        if self.suffix:
            name = f"{name}{self.suffix}"

        # 4. Sequential
        if self.sequential_numbering:
            try:
                formatted_num = self.sequential_format % index
                name = f"{name}{formatted_num}"
            except TypeError:
                pass # Fallback if format string is malformed

        return name + ext

class BulkRenamerEngine:
    @staticmethod
    def preview(filenames, rules: RenamingRules):
        """Returns a list of tuples (original, previewed)."""
        results = []
        for i, filename in enumerate(filenames):
            # 1-indexed for sequential numbers to be user-friendly
            new_name = rules.apply(filename, i + 1)
            results.append((filename, new_name))
        return results

    @staticmethod
    def execute(directory, rename_map, signals=None):
        """
        Executes the rename operation on the filesystem.
        rename_map: list of tuples (original_name, new_name)
        """
        success_count = 0
        error_count = 0
        
        for original, new in rename_map:
            if original == new:
                continue
                
            orig_path = os.path.join(directory, original)
            new_path = os.path.join(directory, new)
            
            # Conflict prevention:
            if os.path.exists(new_path) and original.lower() != new.lower():
                if signals:
                    signals.log_msg.emit(f"Error: {new} already exists. Skipping {original}.")
                error_count += 1
                continue

            try:
                os.rename(orig_path, new_path)
                success_count += 1
                if signals:
                    signals.log_msg.emit(f"Renamed: {original} -> {new}")
            except Exception as e:
                error_count += 1
                if signals:
                    signals.log_msg.emit(f"Failed to rename {original}: {e}")
                    
        return success_count, error_count
