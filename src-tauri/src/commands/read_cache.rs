use crate::models::Message;
use std::fs;
use std::path::PathBuf;

#[tauri::command]
pub fn read_cache(cache_path: &PathBuf) -> Result<Vec<Message>, String> {
    if !cache_path.exists() {
        return Err("⚠️ Unable to find cached messages".to_string());
    }
    let cached_data =
        fs::read_to_string(cache_path).map_err(|e| format!("⚠️ Failed to read cache: {}", e))?;

    let messages: Vec<Message> = serde_json::from_str(&cached_data)
        .map_err(|e| format!("⚠️ Failed to parse cache JSON: {}", e))?;

    println!("✅ Loaded {} messages from cache", messages.len());
    Ok(messages)
}
