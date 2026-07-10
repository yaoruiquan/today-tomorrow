use rusqlite::{params, Connection};
use std::{fs, path::PathBuf};
use tauri::{AppHandle, Emitter, Manager};

const APP_DATA_FILE: &str = "app-data.json";
const APP_DATABASE_FILE: &str = "today-tomorrow.sqlite";
const APP_STATE_KEY: &str = "current";
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

pub(crate) fn app_database_file(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|error| error.to_string())?;
    fs::create_dir_all(&dir).map_err(|error| error.to_string())?;
    Ok(dir.join(APP_DATABASE_FILE))
}

#[tauri::command]
pub fn load_app_data(app: AppHandle) -> Result<Option<serde_json::Value>, String> {
    let database_path = app_database_file(&app)?;
    let mut connection = open_database(&database_path)?;

    if let Some(data) = load_app_data_from_database(&connection)? {
        return Ok(Some(data));
    }

    let legacy_path = app_data_file(&app)?;
    if !legacy_path.exists() {
        return Ok(None);
    }

    let data = read_legacy_app_data(&legacy_path)?;
    save_app_data_to_database(&mut connection, &data)?;
    Ok(Some(data))
}

#[tauri::command]
pub fn save_app_data(
    app: AppHandle,
    data: serde_json::Value,
    source_id: Option<String>,
) -> Result<(), String> {
    let database_path = app_database_file(&app)?;
    let mut connection = open_database(&database_path)?;
    save_app_data_to_database(&mut connection, &data)?;

    app.emit(APP_DATA_CHANGED_EVENT, AppDataChangedPayload { source_id })
        .map_err(|error| error.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn clear_app_data(app: AppHandle, source_id: Option<String>) -> Result<(), String> {
    let database_path = app_database_file(&app)?;
    let mut connection = open_database(&database_path)?;

    clear_app_data_from_database(&mut connection)?;

    let legacy_path = app_data_file(&app)?;
    let _ = fs::remove_file(&legacy_path);

    app.emit(APP_DATA_CHANGED_EVENT, AppDataChangedPayload { source_id })
        .map_err(|error| error.to_string())?;

    Ok(())
}

fn open_database(path: &PathBuf) -> Result<Connection, String> {
    let connection = Connection::open(path).map_err(|error| error.to_string())?;
    initialize_database(&connection)?;
    Ok(connection)
}

fn initialize_database(connection: &Connection) -> Result<(), String> {
    connection
        .execute_batch(
            r#"
            PRAGMA journal_mode = WAL;
            PRAGMA foreign_keys = ON;

            CREATE TABLE IF NOT EXISTS app_state (
              key TEXT PRIMARY KEY NOT NULL,
              value TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS task_records (
              id TEXT PRIMARY KEY NOT NULL,
              title TEXT NOT NULL,
              bucket TEXT NOT NULL,
              status TEXT NOT NULL,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL,
              completed_at TEXT,
              abandoned_at TEXT,
              archived_at TEXT,
              archived_from_date TEXT,
              carried_from_date TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_task_records_status_updated
              ON task_records(status, updated_at);
            CREATE INDEX IF NOT EXISTS idx_task_records_bucket_status
              ON task_records(bucket, status);
            "#,
        )
        .map_err(|error| error.to_string())?;

    Ok(())
}

fn load_app_data_from_database(
    connection: &Connection,
) -> Result<Option<serde_json::Value>, String> {
    let mut statement = connection
        .prepare("SELECT value FROM app_state WHERE key = ?1")
        .map_err(|error| error.to_string())?;
    let mut rows = statement
        .query(params![APP_STATE_KEY])
        .map_err(|error| error.to_string())?;

    let Some(row) = rows.next().map_err(|error| error.to_string())? else {
        return Ok(None);
    };

    let value: String = row.get(0).map_err(|error| error.to_string())?;
    let data = serde_json::from_str(&value).map_err(|error| error.to_string())?;

    Ok(Some(data))
}

fn save_app_data_to_database(
    connection: &mut Connection,
    data: &serde_json::Value,
) -> Result<(), String> {
    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    let contents = serde_json::to_string_pretty(data).map_err(|error| error.to_string())?;

    transaction
        .execute(
            r#"
            INSERT INTO app_state (key, value, updated_at)
            VALUES (?1, ?2, datetime('now'))
            ON CONFLICT(key) DO UPDATE SET
              value = excluded.value,
              updated_at = excluded.updated_at
            "#,
            params![APP_STATE_KEY, contents],
        )
        .map_err(|error| error.to_string())?;

    transaction
        .execute("DELETE FROM task_records", [])
        .map_err(|error| error.to_string())?;

    if let Some(tasks) = data.get("tasks").and_then(|value| value.as_array()) {
        let mut statement = transaction
            .prepare(
                r#"
                INSERT INTO task_records (
                  id,
                  title,
                  bucket,
                  status,
                  created_at,
                  updated_at,
                  completed_at,
                  abandoned_at,
                  archived_at,
                  archived_from_date,
                  carried_from_date
                )
                VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
                "#,
            )
            .map_err(|error| error.to_string())?;

        for task in tasks {
            let Some(id) = task_string(task, "id") else {
                continue;
            };
            let Some(title) = task_string(task, "title") else {
                continue;
            };

            statement
                .execute(params![
                    id,
                    title,
                    task_string(task, "bucket").unwrap_or("today"),
                    task_string(task, "status").unwrap_or("open"),
                    task_string(task, "createdAt").unwrap_or(""),
                    task_string(task, "updatedAt").unwrap_or(""),
                    task_string(task, "completedAt"),
                    task_string(task, "abandonedAt"),
                    task_string(task, "archivedAt"),
                    task_string(task, "archivedFromDate"),
                    task_string(task, "carriedFromDate"),
                ])
                .map_err(|error| error.to_string())?;
        }
    }

    transaction.commit().map_err(|error| error.to_string())?;
    connection
        .execute_batch("PRAGMA optimize;")
        .map_err(|error| error.to_string())?;

    Ok(())
}

fn clear_app_data_from_database(connection: &mut Connection) -> Result<(), String> {
    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    transaction
        .execute("DELETE FROM task_records", [])
        .map_err(|error| error.to_string())?;
    transaction
        .execute("DELETE FROM app_state", [])
        .map_err(|error| error.to_string())?;
    transaction.commit().map_err(|error| error.to_string())?;
    Ok(())
}

fn read_legacy_app_data(path: &PathBuf) -> Result<serde_json::Value, String> {
    let contents = fs::read_to_string(path).map_err(|error| error.to_string())?;
    serde_json::from_str(&contents).map_err(|error| error.to_string())
}

fn task_string<'a>(task: &'a serde_json::Value, key: &str) -> Option<&'a str> {
    task.get(key).and_then(|value| value.as_str())
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
