use std::{fs, path::PathBuf};
use tauri::{AppHandle, Emitter, Manager};

const APP_DATA_FILE: &str = "app-data.json";
const APP_DATA_CHANGED_EVENT: &str = "app-data-changed";
const UI_DIAGNOSTICS_FILE: &str = "ui-diagnostics.json";
const MAX_UI_DIAGNOSTIC_EVENTS: usize = 40;

#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct AppDataChangedPayload {
    source_id: Option<String>,
}

pub(crate) fn app_data_file(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|error| error.to_string())?;
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

    app.emit(APP_DATA_CHANGED_EVENT, AppDataChangedPayload { source_id })
        .map_err(|error| error.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn clear_app_data(app: AppHandle, source_id: Option<String>) -> Result<(), String> {
    let path = app_data_file(&app)?;

    if path.exists() {
        fs::remove_file(&path).map_err(|error| error.to_string())?;
    }

    app.emit(APP_DATA_CHANGED_EVENT, AppDataChangedPayload { source_id })
        .map_err(|error| error.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn record_ui_diagnostic(
    app: AppHandle,
    event: String,
    details: Option<serde_json::Value>,
) -> Result<(), String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|error| error.to_string())?;
    fs::create_dir_all(&dir).map_err(|error| error.to_string())?;

    let path = dir.join(UI_DIAGNOSTICS_FILE);
    let mut data = if path.exists() {
        let contents = fs::read_to_string(&path).map_err(|error| error.to_string())?;
        serde_json::from_str::<serde_json::Value>(&contents)
            .unwrap_or_else(|_| serde_json::json!({}))
    } else {
        serde_json::json!({})
    };

    if !data.is_object() {
        data = serde_json::json!({});
    }

    let entry = serde_json::json!({
        "event": event,
        "at": current_timestamp_millis(),
        "details": details.unwrap_or_else(|| serde_json::json!({})),
    });

    let root = data
        .as_object_mut()
        .ok_or_else(|| "ui diagnostics data is not an object".to_string())?;
    let events = root
        .entry("events")
        .or_insert_with(|| serde_json::json!([]));

    if !events.is_array() {
        *events = serde_json::json!([]);
    }

    let events = events
        .as_array_mut()
        .ok_or_else(|| "ui diagnostics events is not an array".to_string())?;
    events.push(entry.clone());
    if events.len() > MAX_UI_DIAGNOSTIC_EVENTS {
        let overflow = events.len() - MAX_UI_DIAGNOSTIC_EVENTS;
        events.drain(0..overflow);
    }

    root.insert("last".to_string(), entry);

    let temp_path = path.with_extension("json.tmp");
    let contents = serde_json::to_string_pretty(&data).map_err(|error| error.to_string())?;
    fs::write(&temp_path, contents).map_err(|error| error.to_string())?;
    fs::rename(&temp_path, &path).map_err(|error| error.to_string())?;

    Ok(())
}

fn current_timestamp_millis() -> u128 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .unwrap_or_default()
}
