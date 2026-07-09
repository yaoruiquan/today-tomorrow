use std::{
    fs,
    sync::{mpsc, LazyLock, Mutex},
    thread,
    time::{Duration, Instant},
};

#[cfg(target_os = "macos")]
use core_graphics::{
    event::{CGEvent, CGEventType, CGMouseButton},
    event_source::{CGEventSource, CGEventSourceStateID},
    geometry::CGPoint,
};
#[cfg(target_os = "macos")]
use objc2::{
    msg_send,
    runtime::{AnyClass, AnyObject},
    sel,
};
use tauri::{
    ActivationPolicy, AppHandle, Emitter, Manager, PhysicalPosition, Position, State,
    TitleBarStyle, WebviewUrl, WebviewWindow, WebviewWindowBuilder,
};

const APP_DATA_CHANGED_EVENT: &str = "app-data-changed";
const PET_POSITION_SOURCE_ID: &str = "native-pet-position";
const PET_POSITION_TRACK_DELAYS_MS: [u64; 8] = [120, 360, 720, 1200, 2000, 3500, 5000, 7000];
#[cfg(target_os = "macos")]
const PET_INPUT_POLL_INTERVAL_MS: u64 = 16;
#[cfg(target_os = "macos")]
const PET_NATIVE_DRAG_THRESHOLD_PT: f64 = 4.0;
#[cfg(target_os = "macos")]
const PET_NATIVE_CLICK_MAX_MS: u128 = 900;
#[cfg(target_os = "macos")]
const PET_PANEL_REOPEN_SUPPRESS_MS: u128 = 650;
#[cfg(target_os = "macos")]
const CG_EVENT_SOURCE_COMBINED_SESSION_STATE: i32 = 0;
#[cfg(target_os = "macos")]
const MACOS_ESCAPE_KEY_CODE: u16 = 53;

#[cfg(target_os = "macos")]
static RECENT_PET_PANEL_HIDE: LazyLock<Mutex<Option<Instant>>> = LazyLock::new(|| Mutex::new(None));

#[derive(Default)]
pub struct PetPositionState(pub Mutex<Option<SavedPetPosition>>);

#[derive(Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SavedPetPosition {
    x: f64,
    y: f64,
    screen_id: Option<String>,
}

#[cfg(target_os = "macos")]
#[derive(Clone, Copy)]
struct NativePetPointerState {
    start_cursor: CGPoint,
    start_window_position: PhysicalPosition<i32>,
    scale_factor: f64,
    started_at: Instant,
    dragging: bool,
}

#[cfg(target_os = "macos")]
#[link(name = "CoreGraphics", kind = "framework")]
extern "C" {
    fn CGEventSourceButtonState(state_id: i32, button: CGMouseButton) -> bool;
    fn CGEventSourceCounterForEventType(state_id: i32, event_type: CGEventType) -> u32;
    fn CGEventSourceKeyState(state_id: i32, key: u16) -> bool;
}

#[tauri::command]
pub fn show_panel_near_pet(app: AppHandle) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        return show_panel_near_pet_via_main_thread(app);
    }

    #[cfg(not(target_os = "macos"))]
    {
        return show_panel_near_pet_inner(&app);
    }
}

#[tauri::command]
pub fn toggle_panel_near_pet(app: AppHandle) -> Result<bool, String> {
    #[cfg(target_os = "macos")]
    {
        return toggle_panel_near_pet_via_main_thread(app);
    }

    #[cfg(not(target_os = "macos"))]
    {
        return toggle_panel_near_pet_inner(&app);
    }
}

#[cfg(target_os = "macos")]
fn toggle_panel_near_pet_via_main_thread(app: AppHandle) -> Result<bool, String> {
    let (sender, receiver) = mpsc::channel();
    let app_for_main = app.clone();

    app.run_on_main_thread(move || {
        let _ = sender.send(toggle_panel_near_pet_inner(&app_for_main));
    })
    .map_err(|error| error.to_string())?;

    receiver
        .recv_timeout(Duration::from_secs(2))
        .map_err(|error| error.to_string())?
}

fn toggle_panel_near_pet_inner(app: &AppHandle) -> Result<bool, String> {
    if native_panel_visible(app) {
        mark_recent_pet_panel_hide();
        hide_panel(app.clone())?;
        return Ok(false);
    }

    if recently_hid_panel_from_pet_click() {
        return Ok(false);
    }

    show_panel_near_pet_inner(app)?;
    Ok(true)
}

#[cfg(target_os = "macos")]
fn show_panel_near_pet_via_main_thread(app: AppHandle) -> Result<(), String> {
    let (sender, receiver) = mpsc::channel();
    let app_for_main = app.clone();

    app.run_on_main_thread(move || {
        let _ = sender.send(show_panel_near_pet_inner(&app_for_main));
    })
    .map_err(|error| error.to_string())?;

    receiver
        .recv_timeout(Duration::from_secs(2))
        .map_err(|error| error.to_string())?
}

fn show_panel_near_pet_inner(app: &AppHandle) -> Result<(), String> {
    let pet = app
        .get_webview_window("pet")
        .ok_or_else(|| "missing pet window".to_string())?;
    let panel = get_or_create_panel_window(&app)?;

    #[cfg(target_os = "macos")]
    {
        if let Err(error) = app.set_activation_policy(ActivationPolicy::Regular) {
            eprintln!("failed to set regular activation policy before showing panel: {error}");
        }
        if let Err(error) = app.show() {
            eprintln!("failed to show app before panel focus: {error}");
        }
    }

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
    let preferred_y =
        pet_position.y - (panel_size.height as i32 / 2) + (pet_size.height as i32 / 2);
    let min_x = monitor_position.x + 12;
    let min_y = monitor_position.y + 12;
    let max_x = monitor_position.x + monitor_size.width as i32 - panel_size.width as i32 - 12;
    let max_y = monitor_position.y + monitor_size.height as i32 - panel_size.height as i32 - 12;

    let x = preferred_x.clamp(min_x, max_x.max(min_x));
    let y = preferred_y.clamp(min_y, max_y.max(min_y));

    panel
        .set_position(Position::Physical(PhysicalPosition { x, y }))
        .map_err(|error| error.to_string())?;
    panel
        .set_skip_taskbar(false)
        .map_err(|error| error.to_string())?;
    panel
        .set_focusable(true)
        .map_err(|error| error.to_string())?;
    panel.show().map_err(|error| error.to_string())?;
    focus_panel_window_now(&panel);

    for delay_ms in [80, 220, 460] {
        let panel_for_retry = panel.clone();
        thread::spawn(move || {
            thread::sleep(Duration::from_millis(delay_ms));
            schedule_focus_panel_window(&panel_for_retry);
        });
    }

    Ok(())
}

#[tauri::command]
pub fn hide_panel(app: AppHandle) -> Result<(), String> {
    let pet = app
        .get_webview_window("pet")
        .ok_or_else(|| "missing pet window".to_string())?;
    let panel = get_or_create_panel_window(&app)?;

    panel.hide().map_err(|error| error.to_string())?;
    panel
        .set_skip_taskbar(true)
        .map_err(|error| error.to_string())?;
    pet.show().map_err(|error| error.to_string())?;
    pet.set_focus().map_err(|error| error.to_string())?;

    Ok(())
}

pub fn close_precreated_panel_window(app: &AppHandle) {
    if let Some(panel) = app.get_webview_window("panel") {
        let _ = panel.close();
    }
}

fn get_or_create_panel_window(app: &AppHandle) -> Result<WebviewWindow, String> {
    if let Some(panel) = app.get_webview_window("panel") {
        return Ok(panel);
    }

    WebviewWindowBuilder::new(
        app,
        "panel",
        WebviewUrl::App("index.html?window=panel".into()),
    )
    .title("今天明天")
    .inner_size(560.0, 600.0)
    .resizable(false)
    .decorations(true)
    .title_bar_style(TitleBarStyle::Overlay)
    .hidden_title(true)
    .traffic_light_position(Position::Physical(PhysicalPosition { x: -100, y: -100 }))
    .always_on_top(false)
    .visible(false)
    .transparent(true)
    .shadow(false)
    .skip_taskbar(false)
    .focusable(true)
    .accept_first_mouse(true)
    .build()
    .map_err(|error| error.to_string())
}

#[cfg(target_os = "macos")]
fn activate_current_app() {
    let Some(ns_application) = AnyClass::get(c"NSApplication") else {
        return;
    };

    let app: *mut AnyObject = unsafe { msg_send![ns_application, sharedApplication] };
    if app.is_null() {
        return;
    }

    let nil: *mut AnyObject = std::ptr::null_mut();

    let _: bool = unsafe { msg_send![app, setActivationPolicy: 0isize] };
    let _: () = unsafe { msg_send![app, unhide: nil] };

    #[allow(deprecated)]
    let _: () = unsafe { msg_send![app, activateIgnoringOtherApps: true] };
    let responds_to_activate: bool = unsafe { msg_send![app, respondsToSelector: sel!(activate)] };
    if responds_to_activate {
        let _: () = unsafe { msg_send![app, activate] };
    }

    if let Some(ns_running_application) = AnyClass::get(c"NSRunningApplication") {
        let running_app: *mut AnyObject =
            unsafe { msg_send![ns_running_application, currentApplication] };
        if !running_app.is_null() {
            #[allow(deprecated)]
            let _: bool = unsafe { msg_send![running_app, activateWithOptions: 3usize] };
        }
    }
}

#[cfg(not(target_os = "macos"))]
fn activate_current_app() {}

#[cfg(target_os = "macos")]
fn focus_panel_window_now(panel: &WebviewWindow) {
    focus_panel_window_on_main_thread(panel);
}

#[cfg(not(target_os = "macos"))]
fn focus_panel_window_now(panel: &WebviewWindow) {
    if let Err(error) = panel.set_focus() {
        eprintln!("failed to focus panel: {error}");
    }
}

#[cfg(target_os = "macos")]
fn schedule_focus_panel_window(panel: &WebviewWindow) {
    let panel_for_schedule = panel.clone();
    let panel_for_focus = panel.clone();

    if let Err(error) = panel_for_schedule.run_on_main_thread(move || {
        focus_panel_window_on_main_thread(&panel_for_focus);
    }) {
        eprintln!("failed to schedule panel focus on main thread: {error}");
    }
}

#[cfg(not(target_os = "macos"))]
fn schedule_focus_panel_window(panel: &WebviewWindow) {
    if let Err(error) = panel.set_focus() {
        eprintln!("failed to focus panel: {error}");
    }
}

#[cfg(target_os = "macos")]
fn focus_panel_window_on_main_thread(panel: &WebviewWindow) {
    activate_current_app();

    if let Err(error) = panel.set_focus() {
        eprintln!("failed to focus panel through tauri: {error}");
    }

    let nil: *mut AnyObject = std::ptr::null_mut();

    match panel.ns_window() {
        Ok(ns_window) => {
            let ns_window = ns_window.cast::<AnyObject>();

            unsafe {
                let _: () = msg_send![ns_window, orderFrontRegardless];
                let _: () = msg_send![ns_window, makeKeyAndOrderFront: nil];
                let _: () = msg_send![ns_window, makeMainWindow];
            }
            activate_current_app();
        }
        Err(error) => eprintln!("failed to get panel ns_window: {error}"),
    }

    if let Err(error) = panel.with_webview(|webview| unsafe {
        let nil: *mut AnyObject = std::ptr::null_mut();
        let ns_window = webview.ns_window().cast::<AnyObject>();
        let webview = webview.inner().cast::<AnyObject>();

        let _: () = msg_send![ns_window, orderFrontRegardless];
        let _: () = msg_send![ns_window, makeKeyAndOrderFront: nil];
        let _: () = msg_send![ns_window, makeMainWindow];
        let _: bool = msg_send![ns_window, makeFirstResponder: webview];
        activate_current_app();
    }) {
        eprintln!("failed to focus panel webview: {error}");
    }
}

#[cfg(target_os = "macos")]
pub fn install_native_pet_input_fallback(app: AppHandle) {
    thread::spawn(move || run_native_pet_input_polling(app));
}

#[cfg(not(target_os = "macos"))]
pub fn install_native_pet_input_fallback(_app: AppHandle) {}

fn run_native_pet_input_polling(app: AppHandle) {
    let Ok(event_source) = CGEventSource::new(CGEventSourceStateID::CombinedSessionState) else {
        eprintln!("failed to create native pet input event source");
        return;
    };
    let mut pointer_state: Option<NativePetPointerState> = None;
    let mut was_left_down = false;
    let mut was_escape_down = false;
    let mut last_left_down_counter = native_event_counter(CGEventType::LeftMouseDown);
    let mut last_left_up_counter = native_event_counter(CGEventType::LeftMouseUp);

    loop {
        thread::sleep(Duration::from_millis(PET_INPUT_POLL_INTERVAL_MS));

        let Some(pet) = app.get_webview_window("pet") else {
            pointer_state = None;
            was_left_down = false;
            continue;
        };
        let left_down = native_left_mouse_down();
        let left_down_counter = native_event_counter(CGEventType::LeftMouseDown);
        let left_up_counter = native_event_counter(CGEventType::LeftMouseUp);
        let left_down_seen = left_down_counter != last_left_down_counter;
        let left_up_seen = left_up_counter != last_left_up_counter;
        let escape_down = native_key_down(MACOS_ESCAPE_KEY_CODE);
        let cursor = current_mouse_location(&event_source);

        if native_panel_visible(&app) {
            handle_native_panel_global_close(
                &app,
                cursor,
                left_down_seen,
                escape_down,
                was_escape_down,
            );
            pointer_state = None;
            was_left_down = left_down;
            was_escape_down = escape_down;
            last_left_down_counter = left_down_counter;
            last_left_up_counter = left_up_counter;
            continue;
        }

        if left_down && (!was_left_down || (pointer_state.is_none() && left_down_seen)) {
            pointer_state =
                cursor.and_then(|cursor| native_pet_pointer_state_from_cursor(&pet, cursor));
        } else if left_down {
            if let (Some(cursor), Some(state)) = (cursor, pointer_state.as_mut()) {
                update_native_pet_drag(&pet, cursor, state);
            }
        } else if was_left_down || left_up_seen {
            if let Some(state) = pointer_state.take() {
                finish_native_pet_pointer_interaction(&app, state);
            } else if left_down_seen && left_up_seen {
                if let Some(cursor) = cursor {
                    if native_pet_hit_test_state(&pet, cursor).is_some() {
                        toggle_panel_from_native_pet_click(&app);
                    }
                }
            }
        }

        was_left_down = left_down;
        was_escape_down = escape_down;
        last_left_down_counter = left_down_counter;
        last_left_up_counter = left_up_counter;
    }
}

#[cfg(target_os = "macos")]
fn handle_native_panel_global_close(
    app: &AppHandle,
    cursor: Option<CGPoint>,
    left_down_seen: bool,
    escape_down: bool,
    was_escape_down: bool,
) {
    if escape_down && !was_escape_down {
        hide_panel_from_native_interaction(app);
        return;
    }

    if !left_down_seen {
        return;
    }

    let Some(cursor) = cursor else {
        return;
    };

    let clicked_inside_panel = app
        .get_webview_window("panel")
        .is_some_and(|panel| native_window_contains_cursor(&panel, cursor));
    let clicked_inside_pet = app
        .get_webview_window("pet")
        .is_some_and(|pet| native_pet_hit_test_state(&pet, cursor).is_some());

    if clicked_inside_pet {
        toggle_panel_from_native_pet_click(app);
        return;
    }

    if !clicked_inside_panel && !clicked_inside_pet {
        hide_panel_from_native_interaction(app);
    }
}

#[cfg(target_os = "macos")]
fn hide_panel_from_native_interaction(app: &AppHandle) {
    let app_for_hide = app.clone();
    if let Err(error) = app.run_on_main_thread(move || {
        if let Err(error) = hide_panel(app_for_hide) {
            eprintln!("failed to hide panel from native interaction: {error}");
        }
    }) {
        eprintln!("failed to schedule native panel hide: {error}");
    }
}

fn native_panel_visible(app: &AppHandle) -> bool {
    app.get_webview_window("panel")
        .and_then(|panel| panel.is_visible().ok())
        .unwrap_or(false)
}

#[cfg(target_os = "macos")]
fn native_pet_pointer_state_from_cursor(
    pet: &tauri::WebviewWindow,
    cursor: CGPoint,
) -> Option<NativePetPointerState> {
    native_pet_hit_test_state(pet, cursor).map(|(start_window_position, scale_factor)| {
        NativePetPointerState {
            start_cursor: cursor,
            start_window_position,
            scale_factor,
            started_at: Instant::now(),
            dragging: false,
        }
    })
}

#[cfg(target_os = "macos")]
fn finish_native_pet_pointer_interaction(app: &AppHandle, state: NativePetPointerState) {
    if state.dragging {
        if let Err(error) = persist_current_pet_window_position(app) {
            eprintln!("failed to persist native pet drag position: {error}");
        }
        return;
    }

    if state.started_at.elapsed().as_millis() > PET_NATIVE_CLICK_MAX_MS {
        return;
    }

    toggle_panel_from_native_pet_click(app);
}

#[cfg(target_os = "macos")]
fn toggle_panel_from_native_pet_click(app: &AppHandle) {
    let app_for_panel = app.clone();
    if let Err(error) = app.run_on_main_thread(move || {
        if let Err(error) = toggle_panel_near_pet_inner(&app_for_panel) {
            eprintln!("failed to toggle panel from native pet click: {error}");
        }
    }) {
        eprintln!("failed to schedule native pet click: {error}");
    }
}

#[cfg(target_os = "macos")]
fn mark_recent_pet_panel_hide() {
    if let Ok(mut recent_hide) = RECENT_PET_PANEL_HIDE.lock() {
        *recent_hide = Some(Instant::now());
    }
}

#[cfg(not(target_os = "macos"))]
fn mark_recent_pet_panel_hide() {}

#[cfg(target_os = "macos")]
fn recently_hid_panel_from_pet_click() -> bool {
    RECENT_PET_PANEL_HIDE
        .lock()
        .ok()
        .and_then(|recent_hide| *recent_hide)
        .is_some_and(|hidden_at| hidden_at.elapsed().as_millis() < PET_PANEL_REOPEN_SUPPRESS_MS)
}

#[cfg(not(target_os = "macos"))]
fn recently_hid_panel_from_pet_click() -> bool {
    false
}

#[cfg(target_os = "macos")]
fn native_left_mouse_down() -> bool {
    unsafe { CGEventSourceButtonState(CG_EVENT_SOURCE_COMBINED_SESSION_STATE, CGMouseButton::Left) }
}

#[cfg(target_os = "macos")]
fn native_event_counter(event_type: CGEventType) -> u32 {
    unsafe { CGEventSourceCounterForEventType(CG_EVENT_SOURCE_COMBINED_SESSION_STATE, event_type) }
}

#[cfg(target_os = "macos")]
fn native_key_down(key_code: u16) -> bool {
    unsafe { CGEventSourceKeyState(CG_EVENT_SOURCE_COMBINED_SESSION_STATE, key_code) }
}

#[cfg(target_os = "macos")]
fn current_mouse_location(event_source: &CGEventSource) -> Option<CGPoint> {
    CGEvent::new(event_source.clone())
        .ok()
        .map(|event| event.location())
}

#[cfg(target_os = "macos")]
fn native_pet_hit_test_state(
    pet: &tauri::WebviewWindow,
    cursor: CGPoint,
) -> Option<(PhysicalPosition<i32>, f64)> {
    let position = pet.outer_position().ok()?;
    let size = pet.outer_size().ok()?;
    let scale_factor = pet.scale_factor().ok().filter(|scale| *scale > 0.0)?;
    let logical_x = position.x as f64 / scale_factor;
    let logical_y = position.y as f64 / scale_factor;
    let logical_width = native_window_dimension_points(size.width, scale_factor);
    let logical_height = native_window_dimension_points(size.height, scale_factor);
    let center_x = logical_x + logical_width / 2.0;
    let center_y = logical_y + logical_height / 2.0;
    let radius_x = logical_width * 0.46;
    let radius_y = logical_height * 0.46;
    let normalized_x = (cursor.x - center_x) / radius_x;
    let normalized_y = (cursor.y - center_y) / radius_y;

    if normalized_x.mul_add(normalized_x, normalized_y * normalized_y) <= 1.0 {
        Some((position, scale_factor))
    } else {
        None
    }
}

#[cfg(target_os = "macos")]
fn native_window_dimension_points(size: u32, scale_factor: f64) -> f64 {
    let scaled = size as f64 / scale_factor;

    if scaled >= 100.0 {
        scaled
    } else {
        size as f64
    }
}

#[cfg(target_os = "macos")]
fn native_window_contains_cursor(window: &tauri::WebviewWindow, cursor: CGPoint) -> bool {
    let Ok(position) = window.outer_position() else {
        return false;
    };
    let Ok(size) = window.outer_size() else {
        return false;
    };
    let Ok(scale_factor) = window.scale_factor() else {
        return false;
    };
    if scale_factor <= 0.0 {
        return false;
    }

    let logical_x = position.x as f64 / scale_factor;
    let logical_y = position.y as f64 / scale_factor;
    let logical_width = native_window_dimension_points(size.width, scale_factor);
    let logical_height = native_window_dimension_points(size.height, scale_factor);

    cursor.x >= logical_x
        && cursor.x <= logical_x + logical_width
        && cursor.y >= logical_y
        && cursor.y <= logical_y + logical_height
}

#[cfg(target_os = "macos")]
fn update_native_pet_drag(
    pet: &tauri::WebviewWindow,
    cursor: CGPoint,
    state: &mut NativePetPointerState,
) {
    let delta_x = cursor.x - state.start_cursor.x;
    let delta_y = cursor.y - state.start_cursor.y;
    let distance = delta_x.hypot(delta_y);

    if !state.dragging && distance < PET_NATIVE_DRAG_THRESHOLD_PT {
        return;
    }

    state.dragging = true;
    let next_position = PhysicalPosition {
        x: (state.start_window_position.x as f64 + delta_x * state.scale_factor).round() as i32,
        y: (state.start_window_position.y as f64 + delta_y * state.scale_factor).round() as i32,
    };

    if let Err(error) = pet.set_position(Position::Physical(next_position)) {
        eprintln!("failed to move pet from native drag fallback: {error}");
    }
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
            visible_saved_physical_position(app, &position, pet_size.width, pet_size.height)?
        {
            pet.set_position(Position::Physical(PhysicalPosition { x, y }))
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
        .or_else(|| {
            app.available_monitors()
                .ok()
                .and_then(|monitors| monitors.into_iter().next())
        })
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

    pet.set_position(Position::Physical(PhysicalPosition { x, y }))
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
    let saved_position = SavedPetPosition {
        x: position.x as f64,
        y: position.y as f64,
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
    let pet = root.entry("pet").or_insert_with(|| serde_json::json!({}));

    if !pet.is_object() {
        *pet = serde_json::json!({});
    }

    pet.as_object_mut()
        .ok_or_else(|| "pet data is not an object".to_string())?
        .insert(
            "position".to_string(),
            serde_json::to_value(position).map_err(|error| error.to_string())?,
        );

    let temp_path = path.with_extension("json.tmp");
    let contents = serde_json::to_string_pretty(&data).map_err(|error| error.to_string())?;
    fs::write(&temp_path, contents).map_err(|error| error.to_string())?;
    fs::rename(&temp_path, &path).map_err(|error| error.to_string())?;

    app.emit(
        APP_DATA_CHANGED_EVENT,
        serde_json::json!({
          "sourceId": PET_POSITION_SOURCE_ID,
        }),
    )
    .map_err(|error| error.to_string())?;

    Ok(())
}

fn visible_saved_physical_position(
    app: &AppHandle,
    position: &SavedPetPosition,
    width: u32,
    height: u32,
) -> Result<Option<(i32, i32)>, String> {
    let monitors = app
        .available_monitors()
        .map_err(|error| error.to_string())?;

    for monitor in monitors {
        let monitor_position = monitor.position();
        let monitor_size = monitor.size();
        let scale = effective_monitor_logical_scale(
            monitor.scale_factor(),
            monitor_size.width,
            monitor_size.height,
        );
        let monitor_x = monitor_position.x as f64;
        let monitor_y = monitor_position.y as f64;
        let monitor_width = monitor_size.width as f64;
        let monitor_height = monitor_size.height as f64;
        let pet_width = width as f64;
        let pet_height = height as f64;
        let candidates = [
            (position.x, position.y),
            (position.x * scale, position.y * scale),
            (position.x * 2.0, position.y * 2.0),
            (position.x / 2.0, position.y / 2.0),
        ];

        for (x, y) in candidates {
            if is_physical_position_on_monitor(
                x,
                y,
                pet_width,
                pet_height,
                monitor_x,
                monitor_y,
                monitor_width,
                monitor_height,
            ) {
                return Ok(Some((x.round() as i32, y.round() as i32)));
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

fn is_physical_position_on_monitor(
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
