from PyQt6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, 
                             QPushButton, QLabel, QLineEdit, QFileDialog, 
                             QTextEdit, QCheckBox)
from PyQt6.QtCore import Qt, pyqtSlot
from .logic import SorterSignals, FileSorter, DirectoryMonitor
import os

class AutoSorterUI(QWidget):
    def __init__(self):
        super().__init__()
        self.signals = SorterSignals()
        self.sorter = FileSorter(self.signals)
        self.monitor = DirectoryMonitor(self.signals)
        
        self.init_ui()
        self.connect_signals()

    def init_ui(self):
        layout = QVBoxLayout()
        layout.setContentsMargins(30, 30, 30, 30)
        layout.setSpacing(20)

        # Title
        title = QLabel("Smart Folder Sorter")
        title.setProperty("class", "title")
        subtitle = QLabel("Automatically organize files by their extensions.")
        subtitle.setProperty("class", "subtitle")
        
        layout.addWidget(title)
        layout.addWidget(subtitle)
        layout.addSpacing(10)

        # Directory selection
        dir_layout = QHBoxLayout()
        self.dir_input = QLineEdit()
        self.dir_input.setPlaceholderText("Select target directory...")
        self.dir_input.setReadOnly(True)
        
        self.browse_btn = QPushButton("Browse")
        self.browse_btn.setProperty("class", "action-btn")
        self.browse_btn.clicked.connect(self.browse_directory)
        
        dir_layout.addWidget(self.dir_input)
        dir_layout.addWidget(self.browse_btn)
        layout.addLayout(dir_layout)

        # Controls
        controls_layout = QHBoxLayout()
        
        self.run_once_btn = QPushButton("Run One-Time Sort")
        self.run_once_btn.setProperty("class", "action-btn")
        self.run_once_btn.clicked.connect(self.run_one_time_sort)
        
        self.monitor_cb = QCheckBox("Enable Background Monitoring")
        self.monitor_cb.stateChanged.connect(self.toggle_monitoring)
        
        controls_layout.addWidget(self.run_once_btn)
        controls_layout.addStretch()
        controls_layout.addWidget(self.monitor_cb)
        
        layout.addLayout(controls_layout)

        # Logs
        log_label = QLabel("Activity Log")
        log_label.setProperty("class", "subtitle")
        
        self.log_area = QTextEdit()
        self.log_area.setReadOnly(True)
        
        layout.addWidget(log_label)
        layout.addWidget(self.log_area)

        self.setLayout(layout)

    def connect_signals(self):
        self.signals.log_msg.connect(self.append_log)

    @pyqtSlot()
    def browse_directory(self):
        dir_path = QFileDialog.getExistingDirectory(self, "Select Directory")
        if dir_path:
            self.dir_input.setText(dir_path)

    @pyqtSlot()
    def run_one_time_sort(self):
        target = self.dir_input.text()
        if not target:
            self.append_log("Please select a directory first.")
            return
        self.sorter.sort_directory(target)

    @pyqtSlot(int)
    def toggle_monitoring(self, state):
        target = self.dir_input.text()
        if state == Qt.CheckState.Checked.value:
            if not target:
                self.monitor_cb.setChecked(False)
                self.append_log("Please select a directory first.")
                return
            self.dir_input.setEnabled(False)
            self.browse_btn.setEnabled(False)
            self.monitor.start(target)
        else:
            self.monitor.stop()
            self.dir_input.setEnabled(True)
            self.browse_btn.setEnabled(True)

    @pyqtSlot(str)
    def append_log(self, msg):
        self.log_area.append(msg)
