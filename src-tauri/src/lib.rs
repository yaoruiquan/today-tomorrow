use tauri::{ActivationPolicy, Manager};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(window::PetPositionState::default())
        .on_menu_event(|app, event| {
            let id = event.id().0.as_str();
            tray::handle_menu_event(app, id);
        })
        .on_tray_icon_event(|app, event| {
            tray::handle_tray_icon_event(app, event);
        })
        .invoke_handler(tauri::generate_handler![
            persistence::load_app_data,
            persistence::save_app_data,
            persistence::clear_app_data,
            persistence::record_ui_diagnostic,
            window::recenter_pet_window,
            window::place_pet_window,
            window::show_panel_near_pet,
            window::toggle_panel_near_pet,
            window::hide_panel,
            window::save_pet_position,
            window::restore_pet_position,
            window::track_pet_window_position
        ])
        .setup(|app| {
            app.set_activation_policy(ActivationPolicy::Regular);
            window::close_precreated_panel_window(app.handle());
            if let Err(error) = window::position_pet_window_at_launch(app.handle()) {
                eprintln!("failed to position pet window: {error}");
            }
            window::install_native_pet_input_fallback(app.handle().clone());
            match tray::setup_desktop_entrypoints(app.handle()) {
                Ok(tray_icon) => {
                    app.manage(tray_icon);
                }
                Err(error) => {
                    eprintln!("failed to setup desktop entrypoints: {error}");
                }
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
mod tray;
mod window;
