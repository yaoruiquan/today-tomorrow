use std::{fs, sync::Mutex, thread, time::Duration};
use tauri::{AppHandle, Emitter, LogicalPosition, Manager, PhysicalPosition, Position, State};

const APP_DATA_CHANGED_EVENT: &str = "app-data-changed";
const PET_POSITION_SOURCE_ID: &str = "native-pet-position";
const PET_POSITION_TRACK_DELAYS_MS: [u64; 8] = [120, 360, 720, 1200, 2000, 3500, 5000, 7000];

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
  let pet = app
    .get_webview_window("pet")
    .ok_or_else(|| "missing pet window".to_string())?;
  let panel = app
    .get_webview_window("panel")
    .ok_or_else(|| "missing panel window".to_string())?;

  panel.hide().map_err(|error| error.to_string())?;
  pet.show().map_err(|error| error.to_string())?;
  pet.set_focus().map_err(|error| error.to_string())?;

  Ok(())
}

#[tauri::command]
pub fn recenter_pet_window(app: AppHandle) -> Result<(), String> {
  position_pet_window_at_default(&app)
}

#[tauri::command]
pub fn place_pet_window(app: AppHandle, placement: String) -> Result<(), String> {
  position_pet_window_at_placement(&app, &placement)
}

#[tauri::command]
pub fn save_pet_position(
  app: AppHandle,
  position: SavedPetPosition,
  state: State<'_, PetPositionState>,
) -> Result<(), String> {
  let mut saved = state.0.lock().map_err(|error| error.to_string())?;
  *saved = Some(position);
  persist_pet_position_to_app_data(&app, saved.as_ref().expect("saved pet position exists"))?;
  Ok(())
}

#[tauri::command]
pub fn restore_pet_position(
  state: State<'_, PetPositionState>,
) -> Result<Option<SavedPetPosition>, String> {
  let saved = state.0.lock().map_err(|error| error.to_string())?;
  Ok(saved.clone())
}

#[tauri::command]
pub fn track_pet_window_position(app: AppHandle) -> Result<(), String> {
  thread::spawn(move || {
    for delay_ms in PET_POSITION_TRACK_DELAYS_MS {
      thread::sleep(Duration::from_millis(delay_ms));

      if let Err(error) = persist_current_pet_window_position(&app) {
        eprintln!("failed to persist tracked pet position: {error}");
      }
    }
  });

  Ok(())
}

pub fn position_pet_window_at_launch(app: &AppHandle) -> Result<(), String> {
  let pet = app
    .get_webview_window("pet")
    .ok_or_else(|| "missing pet window".to_string())?;
  let pet_size = pet.outer_size().map_err(|error| error.to_string())?;

  if let Some(position) = saved_pet_position_from_app_data(app)? {
    if let Some((x, y)) =
      visible_saved_logical_position(app, &position, pet_size.width, pet_size.height)?
    {
      pet
        .set_position(Position::Logical(LogicalPosition {
          x,
          y,
        }))
        .map_err(|error| error.to_string())?;
      return Ok(());
    }
  }

  position_pet_window_at_default(app)
}

fn position_pet_window_at_default(app: &AppHandle) -> Result<(), String> {
  position_pet_window_at_placement(app, "bottomRight")
}

fn position_pet_window_at_placement(app: &AppHandle, placement: &str) -> Result<(), String> {
  let pet = app
    .get_webview_window("pet")
    .ok_or_else(|| "missing pet window".to_string())?;
  let pet_size = pet.outer_size().map_err(|error| error.to_string())?;
  let monitor = app
    .primary_monitor()
    .map_err(|error| error.to_string())?
    .or_else(|| pet.current_monitor().ok().flatten())
    .or_else(|| app.available_monitors().ok().and_then(|monitors| monitors.into_iter().next()))
    .ok_or_else(|| "missing active monitor".to_string())?;

  let monitor_position = monitor.position();
  let monitor_size = monitor.size();

  let left = monitor_position.x + 28;
  let right = monitor_position.x + monitor_size.width as i32 - pet_size.width as i32 - 28;
  let top = monitor_position.y + 72;
  let bottom = monitor_position.y + monitor_size.height as i32 - pet_size.height as i32 - 72;
  let x = match placement {
    "bottomLeft" | "topLeft" => left,
    _ => right,
  };
  let y = match placement {
    "topLeft" | "topRight" => top,
    _ => bottom,
  };

  pet
    .set_position(Position::Physical(PhysicalPosition {
      x,
      y,
    }))
    .map_err(|error| error.to_string())
}

fn saved_pet_position_from_app_data(app: &AppHandle) -> Result<Option<SavedPetPosition>, String> {
  let path = crate::persistence::app_data_file(app)?;

  if !path.exists() {
    return Ok(None);
  }

  let contents = std::fs::read_to_string(path).map_err(|error| error.to_string())?;
  let data: serde_json::Value =
    serde_json::from_str(&contents).map_err(|error| error.to_string())?;

  let Some(position) = data.get("pet").and_then(|pet| pet.get("position")) else {
    return Ok(None);
  };

  let Some(x) = position.get("x").and_then(|value| value.as_f64()) else {
    return Ok(None);
  };
  let Some(y) = position.get("y").and_then(|value| value.as_f64()) else {
    return Ok(None);
  };

  Ok(Some(SavedPetPosition {
    x,
    y,
    screen_id: position
      .get("screenId")
      .and_then(|value| value.as_str())
      .map(String::from),
  }))
}

fn persist_current_pet_window_position(app: &AppHandle) -> Result<(), String> {
  let pet = app
    .get_webview_window("pet")
    .ok_or_else(|| "missing pet window".to_string())?;
  let position = pet.outer_position().map_err(|error| error.to_string())?;
  let scale_factor = pet.scale_factor().map_err(|error| error.to_string())?;
  let saved_position = SavedPetPosition {
    x: (position.x as f64 / scale_factor).round(),
    y: (position.y as f64 / scale_factor).round(),
    screen_id: None,
  };

  persist_pet_position_to_app_data(app, &saved_position)
}

fn persist_pet_position_to_app_data(
  app: &AppHandle,
  position: &SavedPetPosition,
) -> Result<(), String> {
  let path = crate::persistence::app_data_file(app)?;
  let mut data = if path.exists() {
    let contents = fs::read_to_string(&path).map_err(|error| error.to_string())?;
    serde_json::from_str::<serde_json::Value>(&contents).map_err(|error| error.to_string())?
  } else {
    serde_json::json!({})
  };

  if !data.is_object() {
    data = serde_json::json!({});
  }

  let root = data
    .as_object_mut()
    .ok_or_else(|| "app data is not an object".to_string())?;
  let pet = root
    .entry("pet")
    .or_insert_with(|| serde_json::json!({}));

  if !pet.is_object() {
    *pet = serde_json::json!({});
  }

  pet
    .as_object_mut()
    .ok_or_else(|| "pet data is not an object".to_string())?
    .insert(
      "position".to_string(),
      serde_json::to_value(position).map_err(|error| error.to_string())?,
    );

  let temp_path = path.with_extension("json.tmp");
  let contents = serde_json::to_string_pretty(&data).map_err(|error| error.to_string())?;
  fs::write(&temp_path, contents).map_err(|error| error.to_string())?;
  fs::rename(&temp_path, &path).map_err(|error| error.to_string())?;

  app
    .emit(
      APP_DATA_CHANGED_EVENT,
      serde_json::json!({
        "sourceId": PET_POSITION_SOURCE_ID,
      }),
    )
    .map_err(|error| error.to_string())?;

  Ok(())
}

fn visible_saved_logical_position(
  app: &AppHandle,
  position: &SavedPetPosition,
  width: u32,
  height: u32,
) -> Result<Option<(f64, f64)>, String> {
  let monitors = app.available_monitors().map_err(|error| error.to_string())?;

  for monitor in monitors {
    let monitor_position = monitor.position();
    let monitor_size = monitor.size();
    let logical_scale = effective_monitor_logical_scale(monitor.scale_factor(), monitor_size.width, monitor_size.height);
    let monitor_x = monitor_position.x as f64 / logical_scale;
    let monitor_y = monitor_position.y as f64 / logical_scale;
    let monitor_width = monitor_size.width as f64 / logical_scale;
    let monitor_height = monitor_size.height as f64 / logical_scale;
    let pet_width = width as f64 / logical_scale;
    let pet_height = height as f64 / logical_scale;

    let candidates = if looks_like_legacy_physical_position(position.x, position.y) {
      [
        (position.x / 2.0, position.y / 2.0),
        (position.x, position.y),
        (position.x / logical_scale, position.y / logical_scale),
      ]
    } else {
      [
        (position.x, position.y),
        (position.x / logical_scale, position.y / logical_scale),
        (position.x / 2.0, position.y / 2.0),
      ]
    };

    for (x, y) in candidates {
      if is_logical_position_on_monitor(
        x,
        y,
        pet_width,
        pet_height,
        monitor_x,
        monitor_y,
        monitor_width,
        monitor_height,
      ) {
        return Ok(Some((x, y)));
      }
    }
  }

  Ok(None)
}

fn effective_monitor_logical_scale(scale_factor: f64, width: u32, height: u32) -> f64 {
  if scale_factor > 1.0 {
    return scale_factor;
  }

  if width >= 2400 || height >= 1400 {
    return 2.0;
  }

  1.0
}

fn looks_like_legacy_physical_position(x: f64, y: f64) -> bool {
  x.abs() > 1800.0 || y.abs() > 1200.0
}

fn is_logical_position_on_monitor(
  x: f64,
  y: f64,
  width: f64,
  height: f64,
  monitor_x: f64,
  monitor_y: f64,
  monitor_width: f64,
  monitor_height: f64,
) -> bool {
  let right = x + width;
  let bottom = y + height;
  let monitor_right = monitor_x + monitor_width;
  let monitor_bottom = monitor_y + monitor_height;

  right > monitor_x && x < monitor_right && bottom > monitor_y && y < monitor_bottom
}
