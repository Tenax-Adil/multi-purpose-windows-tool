from PyQt6.QtWidgets import QWidget, QVBoxLayout, QLabel, QMenu, QApplication
from PyQt6.QtCore import Qt, QTimer, QPoint
from PyQt6.QtGui import QAction
from utils import apply_mica_effect

class FocusTimer(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowFlags(
            Qt.WindowType.FramelessWindowHint | 
            Qt.WindowType.WindowStaysOnTopHint |
            Qt.WindowType.Tool
        )
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        
        self.time_left = 25 * 60 # 25 minutes in seconds
        self.timer = QTimer(self)
        self.timer.timeout.connect(self.tick)
        self.is_running = False
        
        self.drag_pos = QPoint()
        
        self.init_ui()

    def init_ui(self):
        self.resize(120, 50)
        
        self.layout = QVBoxLayout(self)
        self.layout.setContentsMargins(0, 0, 0, 0)
        
        self.container = QWidget()
        self.container.setStyleSheet("""
            QWidget {
                background-color: rgba(20, 20, 20, 200);
                border: 1px solid rgba(255, 255, 255, 30);
                border-radius: 25px; /* Pill shape */
            }
        """)
        self.container_layout = QVBoxLayout(self.container)
        self.container_layout.setContentsMargins(0, 0, 0, 0)
        
        self.time_label = QLabel(self.format_time(self.time_left))
        self.time_label.setStyleSheet("color: white; font-size: 18px; font-weight: bold; font-family: 'Segoe UI', Inter, sans-serif;")
        self.time_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        self.container_layout.addWidget(self.time_label)
        self.layout.addWidget(self.container)
        
        # Position slightly top right by default
        screen = QApplication.primaryScreen().geometry()
        self.move(screen.width() - self.width() - 50, 50)

    def showEvent(self, event):
        super().showEvent(event)
        apply_mica_effect(int(self.winId()), "dark")

    def format_time(self, seconds):
        m = seconds // 60
        s = seconds % 60
        return f"{m:02d}:{s:02d}"

    def tick(self):
        if self.time_left > 0:
            self.time_left -= 1
            self.time_label.setText(self.format_time(self.time_left))
        else:
            self.timer.stop()
            self.is_running = False
            self.time_label.setText("00:00")
            self.time_label.setStyleSheet("color: #F87171; font-size: 18px; font-weight: bold;") # Red when done

    def mousePressEvent(self, event):
        if event.button() == Qt.MouseButton.LeftButton:
            self.drag_pos = event.globalPosition().toPoint() - self.frameGeometry().topLeft()
            
            # Start timer if not running on left click
            if not self.is_running and self.time_left > 0:
                self.is_running = True
                self.time_label.setStyleSheet("color: #4ADE80; font-size: 18px; font-weight: bold;") # Green
                self.timer.start(1000)
                
        elif event.button() == Qt.MouseButton.RightButton:
            self.show_context_menu(event.globalPosition().toPoint())

    def mouseMoveEvent(self, event):
        if event.buttons() & Qt.MouseButton.LeftButton:
            self.move(event.globalPosition().toPoint() - self.drag_pos)

    def show_context_menu(self, pos):
        menu = QMenu(self)
        menu.setStyleSheet("""
            QMenu {
                background-color: rgba(30, 30, 30, 240);
                color: white;
                border: 1px solid rgba(255, 255, 255, 20);
                border-radius: 6px;
            }
            QMenu::item {
                padding: 5px 20px;
            }
            QMenu::item:selected {
                background-color: rgba(255, 255, 255, 30);
            }
        """)
        
        pause_action = menu.addAction("Pause")
        reset_action = menu.addAction("Reset (25m)")
        break_action = menu.addAction("Short Break (5m)")
        hide_action = menu.addAction("Hide Timer")
        
        action = menu.exec(pos)
        
        if action == pause_action:
            self.timer.stop()
            self.is_running = False
            self.time_label.setStyleSheet("color: white; font-size: 18px; font-weight: bold;")
        elif action == reset_action:
            self.timer.stop()
            self.is_running = False
            self.time_left = 25 * 60
            self.time_label.setText(self.format_time(self.time_left))
            self.time_label.setStyleSheet("color: white; font-size: 18px; font-weight: bold;")
        elif action == break_action:
            self.timer.stop()
            self.is_running = True
            self.time_left = 5 * 60
            self.time_label.setText(self.format_time(self.time_left))
            self.time_label.setStyleSheet("color: #60A5FA; font-size: 18px; font-weight: bold;") # Blue for break
            self.timer.start(1000)
        elif action == hide_action:
            self.hide()
