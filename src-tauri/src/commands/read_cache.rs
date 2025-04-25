use crate::models::{AppState, Connection, Message};

#[tauri::command]
pub fn read_message_cache(state: tauri::State<AppState>) -> Vec<Message> {
    state
        .cached_messages
        .lock()
        .ok()
        .and_then(|guard| guard.clone())
        .unwrap_or_default()
}

#[tauri::command]
pub fn read_connection_cache(state: tauri::State<AppState>) -> Vec<Connection> {
    state
        .cached_connections
        .lock()
        .ok()
        .and_then(|guard| guard.clone())
        .unwrap_or_default()
}
