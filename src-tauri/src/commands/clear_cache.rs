use std::fs;

#[tauri::command]
pub fn clear_cache() -> Result<(), String> {
    let cache_dir = dirs::cache_dir()
        .ok_or("Failed to get cache directory")?
        .join("archivist");
    if cache_dir.exists() {
        fs::remove_dir_all(&cache_dir).map_err(|e| format!("Failed to remove cache: {}", e))?;
        println!("🧹 Cleared cache at {:?}", cache_dir);
    }
    Ok(())
}
