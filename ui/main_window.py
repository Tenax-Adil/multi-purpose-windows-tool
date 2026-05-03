from PyQt6.QtWidgets import (QMainWindow, QWidget, QHBoxLayout, QVBoxLayout, 
                             QPushButton, QStackedWidget, QLabel)
from PyQt6.QtCore import Qt
from tools.auto_sorter.ui import AutoSorterUI
from tools.bulk_renamer.ui import BulkRenamerUI
from tools.dropzone_shelf.widget import DropzoneShelf
from tools.omni_launcher.widget import OmniLauncher
from tools.focus_timer.widget import FocusTimer
from utils import apply_mica_effect
import ctypes
import ctypes.wintypes

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Antigravity Modular Utilities")
        self.resize(900, 600)
        
        # Transparent background to let Mica shine through
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        
        
        self.init_ui()
        self.init_floating_widgets()
        
    def init_floating_widgets(self):
        self.dropzone = DropzoneShelf()
        self.omni_launcher = OmniLauncher()
        self.focus_timer = FocusTimer()
        
    def init_ui(self):
        # Main widget
        central_widget = QWidget()
        central_widget.setObjectName("mainContent")
        self.setCentralWidget(central_widget)

        main_layout = QHBoxLayout(central_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # Sidebar
        sidebar = QWidget()
        sidebar.setObjectName("sidebar")
        sidebar.setFixedWidth(220)
        sidebar_layout = QVBoxLayout(sidebar)
        sidebar_layout.setContentsMargins(10, 20, 10, 20)
        sidebar_layout.setSpacing(5)

        # Sidebar Title
        app_title = QLabel("Antigravity Tools")
        app_title.setStyleSheet("color: white; font-weight: bold; font-size: 18px; padding-left: 10px;")
        sidebar_layout.addWidget(app_title)
        sidebar_layout.addSpacing(20)

        # Navigation Buttons
        self.btn_auto_sorter = QPushButton("Smart Folder Sorter")
        self.btn_auto_sorter.setProperty("class", "sidebar-btn")
        self.btn_auto_sorter.setCheckable(True)
        self.btn_auto_sorter.setChecked(True)
        
        self.btn_bulk_renamer = QPushButton("Smart Bulk Renamer")
        self.btn_bulk_renamer.setProperty("class", "sidebar-btn")
        self.btn_bulk_renamer.setCheckable(True)

        # Toggles for Floating Widgets
        sidebar_layout.addSpacing(10)
        widgets_label = QLabel("Floating Widgets")
        widgets_label.setStyleSheet("color: #64748B; font-weight: bold; font-size: 12px; padding-left: 10px;")
        sidebar_layout.addWidget(widgets_label)

        self.btn_toggle_dropzone = QPushButton("Toggle Dropzone")
        self.btn_toggle_dropzone.setProperty("class", "sidebar-btn")
        self.btn_toggle_dropzone.setCheckable(True)
        
        self.btn_toggle_timer = QPushButton("Toggle Focus Timer")
        self.btn_toggle_timer.setProperty("class", "sidebar-btn")
        self.btn_toggle_timer.setCheckable(True)

        sidebar_layout.addWidget(self.btn_auto_sorter)
        sidebar_layout.addWidget(self.btn_bulk_renamer)
        sidebar_layout.addWidget(self.btn_toggle_dropzone)
        sidebar_layout.addWidget(self.btn_toggle_timer)
        sidebar_layout.addStretch()

        # Content Area (Stacked Widget)
        self.content_stack = QStackedWidget()
        
        # Tools
        self.auto_sorter_tool = AutoSorterUI()
        
        self.bulk_renamer_tool = BulkRenamerUI()

        self.content_stack.addWidget(self.auto_sorter_tool)
        self.content_stack.addWidget(self.bulk_renamer_tool)

        # Assembly
        main_layout.addWidget(sidebar)
        main_layout.addWidget(self.content_stack)

        # Connections
        self.btn_auto_sorter.clicked.connect(lambda: self.switch_tab(0))
        self.btn_bulk_renamer.clicked.connect(lambda: self.switch_tab(1))
        
        self.btn_toggle_dropzone.clicked.connect(self.toggle_dropzone)
        self.btn_toggle_timer.clicked.connect(self.toggle_timer)

    def toggle_dropzone(self, checked):
        if checked:
            self.dropzone.show()
        else:
            self.dropzone.hide()

    def toggle_timer(self, checked):
        if checked:
            self.focus_timer.show()
        else:
            self.focus_timer.hide()

    def switch_tab(self, index):
        self.content_stack.setCurrentIndex(index)
        self.btn_auto_sorter.setChecked(index == 0)
        self.btn_bulk_renamer.setChecked(index == 1)

    def showEvent(self, event):
        super().showEvent(event)
        # Apply Mica effect once the window is shown and has a valid HWND
        hwnd = int(self.winId())
        apply_mica_effect(hwnd, theme="dark")
        
        # Register Global Hotkey (Alt+Space) for Omni-Launcher
        self.hotkey_id = 1
        MOD_ALT = 0x0001
        VK_SPACE = 0x20
        HWND = ctypes.wintypes.HWND
        ctypes.windll.user32.RegisterHotKey(HWND(hwnd), self.hotkey_id, MOD_ALT, VK_SPACE)

    def nativeEvent(self, eventType, message):
        msg = ctypes.wintypes.MSG.from_address(message.__int__())
        if msg.message == 0x0312: # WM_HOTKEY
            if msg.wParam == self.hotkey_id:
                if self.omni_launcher.isHidden():
                    self.omni_launcher.show()
                    self.omni_launcher.activateWindow()
                else:
                    self.omni_launcher.hide()
                return True, 0
        return super().nativeEvent(eventType, message)

    def closeEvent(self, event):
        if hasattr(self, 'hotkey_id'):
            HWND = ctypes.wintypes.HWND
            ctypes.windll.user32.UnregisterHotKey(HWND(int(self.winId())), self.hotkey_id)
        # Clean up floating widgets
        self.dropzone.close()
        self.omni_launcher.close()
        self.focus_timer.close()
        super().closeEvent(event)
