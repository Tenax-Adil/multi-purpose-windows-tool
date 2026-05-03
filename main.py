import sys
import os
from PyQt6.QtWidgets import QApplication
from PyQt6.QtCore import QTimer
from ui.main_window import MainWindow

def load_stylesheet(app):
    style_path = os.path.join(os.path.dirname(__file__), "styles.qss")
    if os.path.exists(style_path):
        with open(style_path, "r") as f:
            app.setStyleSheet(f.read())
    else:
        print("Warning: styles.qss not found!")

def main():
    app = QApplication(sys.argv)
    
    # Load custom QSS stylesheet
    load_stylesheet(app)
    
    window = MainWindow()
    window.show()
    
    if "--test" in sys.argv:
        def take_shot_and_close():
            # Grab screenshot of the window
            pixmap = window.grab()
            
            # Make sure artifacts directory exists
            os.makedirs("C:/Users/Adil/.gemini/antigravity/brain/d68b8799-a8aa-46e0-b98e-ee65d0b6e7bd/", exist_ok=True)
            screenshot_path = "C:/Users/Adil/.gemini/antigravity/brain/d68b8799-a8aa-46e0-b98e-ee65d0b6e7bd/ui_screenshot.png"
            pixmap.save(screenshot_path)
            print(f"Saved screenshot to {screenshot_path}")
            app.quit()
        
        
        QTimer.singleShot(2000, take_shot_and_close)
        
    if "--test-renamer" in sys.argv:
        def prep_and_take_shot():
            window.switch_tab(1)
            window.bulk_renamer_tool.current_dir = os.path.abspath("test_renamer_dir")
            window.bulk_renamer_tool.dir_input.setText(window.bulk_renamer_tool.current_dir)
            window.bulk_renamer_tool.load_files()
            window.bulk_renamer_tool.prefix_input.setText("New_")
            window.bulk_renamer_tool.strip_spaces_cb.setChecked(True)
            window.bulk_renamer_tool.seq_num_cb.setChecked(True)
            
            # Allow UI to update before grabbing
            def grab():
                pixmap = window.grab()
                os.makedirs("C:/Users/Adil/.gemini/antigravity/brain/d68b8799-a8aa-46e0-b98e-ee65d0b6e7bd/", exist_ok=True)
                screenshot_path = "C:/Users/Adil/.gemini/antigravity/brain/d68b8799-a8aa-46e0-b98e-ee65d0b6e7bd/renamer_screenshot.png"
                pixmap.save(screenshot_path)
                print(f"Saved screenshot to {screenshot_path}")
                app.quit()
            
            QTimer.singleShot(500, grab)
            
        QTimer.singleShot(1000, prep_and_take_shot)
            
    if "--test-widgets" in sys.argv:
        def show_and_shot():
            window.toggle_dropzone(True)
            window.toggle_timer(True)
            window.omni_launcher.show()
            window.omni_launcher.search_bar.setText("calc")
            
            def grab():
                # For multiple windows, grab the primary screen instead of just the main window
                pixmap = app.primaryScreen().grabWindow(0)
                os.makedirs("C:/Users/Adil/.gemini/antigravity/brain/d68b8799-a8aa-46e0-b98e-ee65d0b6e7bd/", exist_ok=True)
                screenshot_path = "C:/Users/Adil/.gemini/antigravity/brain/d68b8799-a8aa-46e0-b98e-ee65d0b6e7bd/widgets_screenshot.png"
                pixmap.save(screenshot_path)
                print(f"Saved screenshot to {screenshot_path}")
                app.quit()
                
            QTimer.singleShot(1500, grab)
            
        QTimer.singleShot(500, show_and_shot)
    
    sys.exit(app.exec())

if __name__ == "__main__":
    main()
