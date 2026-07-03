use tauri::{
  menu::{MenuBuilder, SubmenuBuilder},
  tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent},
  AppHandle,
};

const SHOW_PANEL_ID: &str = "show_panel";
const RECENTER_PET_ID: &str = "recenter_pet";
const QUIT_ID: &str = "quit_app";

pub fn setup_desktop_entrypoints(app: &AppHandle) -> Result<TrayIcon, String> {
  let app_submenu = SubmenuBuilder::new(app, "今天明天")
    .text(SHOW_PANEL_ID, "打开任务面板")
    .text(RECENTER_PET_ID, "归位小光团")
    .separator()
    .text(QUIT_ID, "退出 今天明天")
    .build()
    .map_err(|error| error.to_string())?;
  let app_menu = MenuBuilder::new(app)
    .item(&app_submenu)
    .build()
    .map_err(|error| error.to_string())?;
  app.set_menu(app_menu).map_err(|error| error.to_string())?;

  let tray_menu = MenuBuilder::new(app)
    .text(SHOW_PANEL_ID, "打开任务面板")
    .text(RECENTER_PET_ID, "归位小光团")
    .separator()
    .text(QUIT_ID, "退出")
    .build()
    .map_err(|error| error.to_string())?;

  let tray_builder = TrayIconBuilder::with_id("today-tomorrow")
    .menu(&tray_menu)
    .tooltip("今天明天")
    .show_menu_on_left_click(false);
  let tray_builder = if let Some(icon) = app.default_window_icon().cloned() {
    tray_builder.icon(icon)
  } else {
    tray_builder.title("今天明天")
  };

  tray_builder.build(app).map_err(|error| error.to_string())
}

pub fn handle_menu_event(app: &AppHandle, id: &str) {
  match id {
    SHOW_PANEL_ID => {
      let _ = crate::window::show_panel_near_pet(app.clone());
    }
    RECENTER_PET_ID => {
      let _ = crate::window::recenter_pet_window(app.clone());
    }
    QUIT_ID => app.exit(0),
    _ => {}
  }
}

pub fn handle_tray_icon_event(app: &AppHandle, event: TrayIconEvent) {
  if let TrayIconEvent::Click {
    button: MouseButton::Left,
    button_state: MouseButtonState::Up,
    ..
  } = event
  {
    let _ = crate::window::show_panel_near_pet(app.clone());
  }
}
