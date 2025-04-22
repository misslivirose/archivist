use crate::models::{AppState, Message};

#[tauri::command]
pub fn read_message_cache(state: tauri::State<AppState>) -> Option<Vec<Message>> {
    let guard = state.cached_messages.lock().ok()?;
    guard.clone()
}
