import os
from PyQt6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, 
                             QPushButton, QLabel, QLineEdit, QFileDialog, 
                             QTableWidget, QTableWidgetItem, QHeaderView,
                             QCheckBox, QGroupBox, QSplitter)
from PyQt6.QtCore import Qt, pyqtSlot
from .logic import BulkRenamerEngine, RenamingRules
from tools.auto_sorter.logic import SorterSignals

class BulkRenamerUI(QWidget):
    def __init__(self):
        super().__init__()
        self.signals = SorterSignals() # Reusing simple signal class
        self.rules = RenamingRules()
        self.current_dir = ""
        self.files = []
        self.rename_map = []
        
        self.init_ui()
        self.connect_signals()

    def init_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(30, 30, 30, 30)
        main_layout.setSpacing(20)

        # Title
        title = QLabel("Smart Bulk File Renamer")
        title.setProperty("class", "title")
        subtitle = QLabel("Batch rename files using rules with live preview.")
        subtitle.setProperty("class", "subtitle")
        main_layout.addWidget(title)
        main_layout.addWidget(subtitle)

        # Directory selection
        dir_layout = QHBoxLayout()
        self.dir_input = QLineEdit()
        self.dir_input.setPlaceholderText("Select directory to load files...")
        self.dir_input.setReadOnly(True)
        
        self.browse_btn = QPushButton("Browse")
        self.browse_btn.setProperty("class", "action-btn")
        self.browse_btn.clicked.connect(self.browse_directory)
        
        dir_layout.addWidget(self.dir_input)
        dir_layout.addWidget(self.browse_btn)
        main_layout.addLayout(dir_layout)

        # Splitter for Actions vs Table
        splitter = QSplitter(Qt.Orientation.Horizontal)
        
        # Left Panel: Actions
        actions_widget = QWidget()
        actions_layout = QVBoxLayout(actions_widget)
        actions_layout.setContentsMargins(0,0,0,0)

        # Find & Replace
        fr_group = QGroupBox("Find & Replace")
        fr_layout = QVBoxLayout()
        self.find_input = QLineEdit()
        self.find_input.setPlaceholderText("Find text...")
        self.replace_input = QLineEdit()
        self.replace_input.setPlaceholderText("Replace with...")
        self.regex_cb = QCheckBox("Use Regular Expressions")
        fr_layout.addWidget(self.find_input)
        fr_layout.addWidget(self.replace_input)
        fr_layout.addWidget(self.regex_cb)
        fr_group.setLayout(fr_layout)
        actions_layout.addWidget(fr_group)

        # Prefix / Suffix
        ps_group = QGroupBox("Prefix / Suffix")
        ps_layout = QVBoxLayout()
        self.prefix_input = QLineEdit()
        self.prefix_input.setPlaceholderText("Prefix...")
        self.suffix_input = QLineEdit()
        self.suffix_input.setPlaceholderText("Suffix...")
        ps_layout.addWidget(self.prefix_input)
        ps_layout.addWidget(self.suffix_input)
        ps_group.setLayout(ps_layout)
        actions_layout.addWidget(ps_group)

        # Stripping & Options
        opt_group = QGroupBox("Format & Strip")
        opt_layout = QVBoxLayout()
        self.strip_spaces_cb = QCheckBox("Remove Spaces")
        self.strip_underscores_cb = QCheckBox("Remove Underscores")
        self.seq_num_cb = QCheckBox("Append Sequential Numbers (_001)")
        opt_layout.addWidget(self.strip_spaces_cb)
        opt_layout.addWidget(self.strip_underscores_cb)
        opt_layout.addWidget(self.seq_num_cb)
        opt_group.setLayout(opt_layout)
        actions_layout.addWidget(opt_group)

        # Execute
        self.execute_btn = QPushButton("Execute Rename")
        self.execute_btn.setProperty("class", "action-btn")
        self.execute_btn.setStyleSheet("background-color: rgba(50, 120, 200, 180); font-weight: bold;")
        self.execute_btn.clicked.connect(self.execute_rename)
        actions_layout.addSpacing(20)
        actions_layout.addWidget(self.execute_btn)
        actions_layout.addStretch()

        # Right Panel: Table
        table_widget = QWidget()
        table_layout = QVBoxLayout(table_widget)
        table_layout.setContentsMargins(0,0,0,0)
        
        self.table = QTableWidget(0, 2)
        self.table.setHorizontalHeaderLabels(["Current Name", "Preview Name"])
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Stretch)
        self.table.setEditTriggers(QTableWidget.EditTrigger.NoEditTriggers)
        self.table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        self.table.verticalHeader().setVisible(False)
        self.table.setShowGrid(False)

        table_layout.addWidget(self.table)

        # Add to splitter
        splitter.addWidget(actions_widget)
        splitter.addWidget(table_widget)
        splitter.setSizes([300, 500])

        main_layout.addWidget(splitter)

        # Connect inputs to live preview
        self.find_input.textChanged.connect(self.update_preview)
        self.replace_input.textChanged.connect(self.update_preview)
        self.regex_cb.stateChanged.connect(self.update_preview)
        self.prefix_input.textChanged.connect(self.update_preview)
        self.suffix_input.textChanged.connect(self.update_preview)
        self.strip_spaces_cb.stateChanged.connect(self.update_preview)
        self.strip_underscores_cb.stateChanged.connect(self.update_preview)
        self.seq_num_cb.stateChanged.connect(self.update_preview)

    def connect_signals(self):
        self.signals.log_msg.connect(self.print_log)

    def print_log(self, msg):
        print(f"BulkRenamer Log: {msg}")

    @pyqtSlot()
    def browse_directory(self):
        dir_path = QFileDialog.getExistingDirectory(self, "Select Directory")
        if dir_path:
            self.current_dir = dir_path
            self.dir_input.setText(dir_path)
            self.load_files()

    def load_files(self):
        self.files = []
        try:
            for item in os.listdir(self.current_dir):
                if os.path.isfile(os.path.join(self.current_dir, item)):
                    self.files.append(item)
            self.update_preview()
        except Exception as e:
            print(e)

    def _sync_rules(self):
        self.rules.find_replace = self.find_input.text()
        self.rules.replace_find = self.find_input.text()
        self.rules.replace_with = self.replace_input.text()
        self.rules.use_regex = self.regex_cb.isChecked()
        self.rules.prefix = self.prefix_input.text()
        self.rules.suffix = self.suffix_input.text()
        self.rules.strip_spaces = self.strip_spaces_cb.isChecked()
        self.rules.strip_underscores = self.strip_underscores_cb.isChecked()
        self.rules.sequential_numbering = self.seq_num_cb.isChecked()

    @pyqtSlot()
    def update_preview(self):
        if not self.files:
            self.table.setRowCount(0)
            return

        self._sync_rules()
        self.rename_map = BulkRenamerEngine.preview(self.files, self.rules)
        
        self.table.setRowCount(len(self.rename_map))
        for row, (orig, new) in enumerate(self.rename_map):
            self.table.setItem(row, 0, QTableWidgetItem(orig))
            
            new_item = QTableWidgetItem(new)
            if orig != new:
                # Highlight changed names softly
                new_item.setForeground(Qt.GlobalColor.green)
            self.table.setItem(row, 1, new_item)

    @pyqtSlot()
    def execute_rename(self):
        if not self.current_dir or not self.rename_map:
            return
            
        success, err = BulkRenamerEngine.execute(self.current_dir, self.rename_map, self.signals)
        # Reload directory to reflect changes
        self.load_files()
