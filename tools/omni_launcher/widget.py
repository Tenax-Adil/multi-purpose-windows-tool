from PyQt6.QtWidgets import QWidget, QVBoxLayout, QLineEdit, QListWidget, QApplication, QListWidgetItem
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QKeyEvent
from utils import apply_mica_effect
from .logic import OmniLogic

class OmniLauncher(QWidget):
    def __init__(self):
        super().__init__()
        self.logic = OmniLogic()
        
        self.setWindowFlags(
            Qt.WindowType.FramelessWindowHint | 
            Qt.WindowType.WindowStaysOnTopHint |
            Qt.WindowType.Tool
        )
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        
        self.init_ui()
        self.center_on_screen()

    def init_ui(self):
        self.resize(600, 400) # Give some space for results
        
        self.layout = QVBoxLayout(self)
        self.layout.setContentsMargins(0, 0, 0, 0)
        self.layout.setAlignment(Qt.AlignmentFlag.AlignTop)
        
        self.container = QWidget()
        self.container.setStyleSheet("""
            QWidget {
                background-color: rgba(20, 20, 20, 200);
                border: 1px solid rgba(255, 255, 255, 30);
                border-radius: 12px;
            }
        """)
        self.container_layout = QVBoxLayout(self.container)
        self.container_layout.setContentsMargins(15, 15, 15, 15)
        
        # Search Bar
        self.search_bar = QLineEdit()
        self.search_bar.setPlaceholderText("Search apps (Alt+Space to toggle)...")
        self.search_bar.setStyleSheet("""
            QLineEdit {
                font-size: 24px;
                padding: 10px;
                background-color: transparent;
                border: none;
                color: white;
            }
        """)
        self.search_bar.textChanged.connect(self.update_results)
        self.search_bar.returnPressed.connect(self.launch_selected)
        
        # Results List
        self.result_list = QListWidget()
        self.result_list.setStyleSheet("""
            QListWidget {
                background-color: transparent;
                border: none;
                color: #CBD5E1;
                font-size: 16px;
                outline: none;
            }
            QListWidget::item {
                padding: 10px;
                border-radius: 6px;
            }
            QListWidget::item:selected {
                background-color: rgba(255, 255, 255, 20);
                color: white;
            }
        """)
        self.result_list.itemDoubleClicked.connect(self.launch_selected)
        self.result_list.hide()
        
        self.container_layout.addWidget(self.search_bar)
        self.container_layout.addWidget(self.result_list)
        
        self.layout.addWidget(self.container)

    def center_on_screen(self):
        screen = QApplication.primaryScreen().geometry()
        x = (screen.width() - self.width()) // 2
        y = (screen.height() - self.height()) // 3 # Slightly above center
        self.move(x, y)

    def showEvent(self, event):
        super().showEvent(event)
        apply_mica_effect(int(self.winId()), "dark")
        self.search_bar.setFocus()
        self.search_bar.clear()
        self.result_list.clear()
        self.result_list.hide()
        # Adjust height down to just the search bar when shown
        self.resize(600, 80)

    def update_results(self):
        query = self.search_bar.text()
        results = self.logic.search(query)
        
        self.result_list.clear()
        if results:
            for name, path in results:
                item = QListWidgetItem(name.title())
                item.setData(Qt.ItemDataRole.UserRole, path)
                self.result_list.addItem(item)
            self.result_list.setCurrentRow(0)
            self.result_list.show()
            self.resize(600, 80 + (len(results) * 45) + 20)
        else:
            self.result_list.hide()
            self.resize(600, 80)

    def launch_selected(self):
        item = self.result_list.currentItem()
        if item:
            path = item.data(Qt.ItemDataRole.UserRole)
            self.logic.launch(path)
            self.hide()

    def keyPressEvent(self, event: QKeyEvent):
        if event.key() == Qt.Key.Key_Escape:
            self.hide()
        elif event.key() == Qt.Key.Key_Down:
            # Shift focus to list or move selection down
            row = self.result_list.currentRow()
            if row < self.result_list.count() - 1:
                self.result_list.setCurrentRow(row + 1)
        elif event.key() == Qt.Key.Key_Up:
            row = self.result_list.currentRow()
            if row > 0:
                self.result_list.setCurrentRow(row - 1)
        else:
            super().keyPressEvent(event)
            
    # Auto hide when losing focus
    def focusOutEvent(self, event):
        # We only want to hide if the active window is not this one
        if not self.isActiveWindow():
            self.hide()
        super().focusOutEvent(event)
