#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .manage(window::PetPositionState::default())
    .invoke_handler(tauri::generate_handler![
      persistence::load_app_data,
      persistence::save_app_data,
      persistence::clear_app_data,
      window::show_panel_near_pet,
      window::hide_panel,
      window::save_pet_position,
      window::restore_pet_position
    ])
    .setup(|app| {
      if let Err(error) = window::position_pet_window_at_launch(app.handle()) {
        eprintln!("failed to position pet window: {error}");
      }

      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

mod persistence;
mod window;
