import os
from PyQt6.QtWidgets import QWidget, QVBoxLayout, QLabel, QApplication
from PyQt6.QtCore import Qt, QUrl, QPoint, QMimeData
from PyQt6.QtGui import QDrag, QScreen
from utils import apply_mica_effect

class DropzoneShelf(QWidget):
    def __init__(self):
        super().__init__()
        # Floating, borderless, on top, and no taskbar icon
        self.setWindowFlags(
            Qt.WindowType.FramelessWindowHint | 
            Qt.WindowType.WindowStaysOnTopHint |
            Qt.WindowType.Tool
        )
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.setAcceptDrops(True)
        
        self.files = []
        self.drag_start_pos = QPoint()
        
        self.init_ui()
        self.position_on_screen_edge()

    def init_ui(self):
        self.resize(100, 400)
        
        self.layout = QVBoxLayout(self)
        self.layout.setContentsMargins(10, 10, 10, 10)
        
        self.container = QWidget()
        self.container.setStyleSheet("""
            QWidget {
                background-color: rgba(15, 15, 15, 180);
                border: 1px solid rgba(255, 255, 255, 20);
                border-radius: 12px;
            }
        """)
        self.container_layout = QVBoxLayout(self.container)
        
        self.status_label = QLabel("Drop files here")
        self.status_label.setStyleSheet("color: #94A3B8; font-size: 12px; font-weight: bold; border: none; background: transparent;")
        self.status_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.status_label.setWordWrap(True)
        
        self.container_layout.addWidget(self.status_label)
        self.layout.addWidget(self.container)

    def position_on_screen_edge(self):
        # Anchor to the right edge, middle height
        screen = QApplication.primaryScreen().geometry()
        x = screen.width() - self.width() - 20
        y = (screen.height() - self.height()) // 2
        self.move(x, y)

    def showEvent(self, event):
        super().showEvent(event)
        apply_mica_effect(int(self.winId()), "dark")

    # --- DRAG AND DROP IN ---
    def dragEnterEvent(self, event):
        if event.mimeData().hasUrls():
            event.accept()
            self.container.setStyleSheet("""
                QWidget {
                    background-color: rgba(30, 30, 30, 220);
                    border: 1px solid rgba(100, 150, 255, 50);
                    border-radius: 12px;
                }
            """)
        else:
            event.ignore()

    def dragLeaveEvent(self, event):
        self._reset_style()

    def dropEvent(self, event):
        urls = event.mimeData().urls()
        for url in urls:
            path = url.toLocalFile()
            if path not in self.files:
                self.files.append(path)
                
        self._update_label()
        self._reset_style()

    # --- DRAG AND DROP OUT ---
    def mousePressEvent(self, event):
        if event.button() == Qt.MouseButton.LeftButton and self.files:
            self.drag_start_pos = event.pos()

    def mouseMoveEvent(self, event):
        if not (event.buttons() & Qt.MouseButton.LeftButton) or not self.files:
            return
            
        if (event.pos() - self.drag_start_pos).manhattanLength() < QApplication.startDragDistance():
            return
            
        # Create drag object out
        drag = QDrag(self)
        mime_data = QMimeData()
        
        urls = [QUrl.fromLocalFile(p) for p in self.files]
        mime_data.setUrls(urls)
        drag.setMimeData(mime_data)
        
        # Execute drag
        drop_action = drag.exec(Qt.DropAction.CopyAction | Qt.DropAction.MoveAction)
        
        # If files were moved or successfully copied out, auto-clear
        # For simplicity, we just clear the shelf on any successful drag out
        if drop_action != Qt.DropAction.IgnoreAction:
            self.files.clear()
            self._update_label()

    def _update_label(self):
        if not self.files:
            self.status_label.setText("Drop files here")
        else:
            self.status_label.setText(f"{len(self.files)} item(s) ready")

    def _reset_style(self):
        self.container.setStyleSheet("""
            QWidget {
                background-color: rgba(15, 15, 15, 180);
                border: 1px solid rgba(255, 255, 255, 20);
                border-radius: 12px;
            }
        """)
