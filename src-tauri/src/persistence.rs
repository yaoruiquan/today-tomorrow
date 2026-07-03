use std::{fs, path::PathBuf};
use tauri::{AppHandle, Emitter, Manager};

const APP_DATA_FILE: &str = "app-data.json";
const APP_DATA_CHANGED_EVENT: &str = "app-data-changed";

#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct AppDataChangedPayload {
  source_id: Option<String>,
}

pub(crate) fn app_data_file(app: &AppHandle) -> Result<PathBuf, String> {
  let dir = app.path().app_data_dir().map_err(|error| error.to_string())?;
  fs::create_dir_all(&dir).map_err(|error| error.to_string())?;
  Ok(dir.join(APP_DATA_FILE))
}

#[tauri::command]
pub fn load_app_data(app: AppHandle) -> Result<Option<serde_json::Value>, String> {
  let path = app_data_file(&app)?;

  if !path.exists() {
    return Ok(None);
  }

  let contents = fs::read_to_string(&path).map_err(|error| error.to_string())?;
  let data = serde_json::from_str(&contents).map_err(|error| error.to_string())?;

  Ok(Some(data))
}

#[tauri::command]
pub fn save_app_data(
  app: AppHandle,
  data: serde_json::Value,
  source_id: Option<String>,
) -> Result<(), String> {
  let path = app_data_file(&app)?;
  let temp_path = path.with_extension("json.tmp");
  let contents = serde_json::to_string_pretty(&data).map_err(|error| error.to_string())?;

  fs::write(&temp_path, contents).map_err(|error| error.to_string())?;
  fs::rename(&temp_path, &path).map_err(|error| error.to_string())?;

  app
    .emit(
      APP_DATA_CHANGED_EVENT,
      AppDataChangedPayload {
        source_id,
      },
    )
    .map_err(|error| error.to_string())?;

  Ok(())
}

#[tauri::command]
pub fn clear_app_data(app: AppHandle, source_id: Option<String>) -> Result<(), String> {
  let path = app_data_file(&app)?;

  if path.exists() {
    fs::remove_file(&path).map_err(|error| error.to_string())?;
  }

  app
    .emit(
      APP_DATA_CHANGED_EVENT,
      AppDataChangedPayload {
        source_id,
      },
    )
    .map_err(|error| error.to_string())?;

  Ok(())
}
