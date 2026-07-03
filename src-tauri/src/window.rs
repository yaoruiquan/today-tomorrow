use std::sync::Mutex;
use tauri::{AppHandle, Manager, PhysicalPosition, Position, State};

#[derive(Default)]
pub struct PetPositionState(pub Mutex<Option<SavedPetPosition>>);

#[derive(Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SavedPetPosition {
  x: f64,
  y: f64,
  screen_id: Option<String>,
}

#[tauri::command]
pub fn show_panel_near_pet(app: AppHandle) -> Result<(), String> {
  let pet = app
    .get_webview_window("pet")
    .ok_or_else(|| "missing pet window".to_string())?;
  let panel = app
    .get_webview_window("panel")
    .ok_or_else(|| "missing panel window".to_string())?;

  let pet_position = pet.outer_position().map_err(|error| error.to_string())?;
  let pet_size = pet.outer_size().map_err(|error| error.to_string())?;
  let panel_size = panel.outer_size().map_err(|error| error.to_string())?;

  let monitor = pet
    .current_monitor()
    .map_err(|error| error.to_string())?
    .ok_or_else(|| "missing active monitor".to_string())?;
  let monitor_position = monitor.position();
  let monitor_size = monitor.size();

  let preferred_x = pet_position.x - panel_size.width as i32 - 18;
  let preferred_y = pet_position.y - (panel_size.height as i32 / 2) + (pet_size.height as i32 / 2);
  let min_x = monitor_position.x + 12;
  let min_y = monitor_position.y + 12;
  let max_x = monitor_position.x + monitor_size.width as i32 - panel_size.width as i32 - 12;
  let max_y = monitor_position.y + monitor_size.height as i32 - panel_size.height as i32 - 12;

  let x = preferred_x.clamp(min_x, max_x.max(min_x));
  let y = preferred_y.clamp(min_y, max_y.max(min_y));

  panel
    .set_position(Position::Physical(PhysicalPosition {
      x,
      y,
    }))
    .map_err(|error| error.to_string())?;
  panel.show().map_err(|error| error.to_string())?;
  panel.set_focus().map_err(|error| error.to_string())?;

  Ok(())
}

#[tauri::command]
pub fn hide_panel(app: AppHandle) -> Result<(), String> {
  let panel = app
    .get_webview_window("panel")
    .ok_or_else(|| "missing panel window".to_string())?;

  panel.hide().map_err(|error| error.to_string())
}

#[tauri::command]
pub fn save_pet_position(
  position: SavedPetPosition,
  state: State<'_, PetPositionState>,
) -> Result<(), String> {
  let mut saved = state.0.lock().map_err(|error| error.to_string())?;
  *saved = Some(position);
  Ok(())
}

#[tauri::command]
pub fn restore_pet_position(state: State<'_, PetPositionState>) -> Result<Option<SavedPetPosition>, String> {
  let saved = state.0.lock().map_err(|error| error.to_string())?;
  Ok(saved.clone())
}

pub fn position_pet_window_at_launch(app: &AppHandle) -> Result<(), String> {
  let pet = app
    .get_webview_window("pet")
    .ok_or_else(|| "missing pet window".to_string())?;
  let pet_size = pet.outer_size().map_err(|error| error.to_string())?;
  let monitor = pet
    .current_monitor()
    .map_err(|error| error.to_string())?
    .ok_or_else(|| "missing active monitor".to_string())?;
  let monitor_position = monitor.position();
  let monitor_size = monitor.size();

  let x = monitor_position.x + monitor_size.width as i32 - pet_size.width as i32 - 28;
  let y = monitor_position.y + monitor_size.height as i32 - pet_size.height as i32 - 72;

  pet
    .set_position(Position::Physical(PhysicalPosition {
      x,
      y,
    }))
    .map_err(|error| error.to_string())
}
