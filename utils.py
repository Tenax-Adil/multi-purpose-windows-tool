import ctypes
from ctypes.wintypes import HWND, DWORD
import sys

def apply_mica_effect(hwnd: int, theme: str = "dark"):
    """
    Applies the Windows 11 Mica effect to the given window handle (hwnd).
    """
    if sys.platform != "win32":
        return

    try:
        # Load dwmapi
        dwmapi = ctypes.windll.dwmapi

        # Constants
        DWMWA_USE_IMMERSIVE_DARK_MODE = 20
        DWMWA_SYSTEMBACKDROP_TYPE = 38
        DWMSBT_MAINWINDOW = 2 # Mica
        DWMSBT_TRANSIENTWINDOW = 3 # Acrylic
        
        # Set dark mode
        dark_mode = 1 if theme == "dark" else 0
        value = ctypes.c_int(dark_mode)
        dwmapi.DwmSetWindowAttribute(
            HWND(hwnd),
            DWORD(DWMWA_USE_IMMERSIVE_DARK_MODE),
            ctypes.byref(value),
            ctypes.sizeof(value)
        )

        # Set backdrop type to Mica
        backdrop_type = ctypes.c_int(DWMSBT_MAINWINDOW)
        dwmapi.DwmSetWindowAttribute(
            HWND(hwnd),
            DWORD(DWMWA_SYSTEMBACKDROP_TYPE),
            ctypes.byref(backdrop_type),
            ctypes.sizeof(backdrop_type)
        )
    except Exception as e:
        print(f"Failed to apply Mica effect: {e}")
