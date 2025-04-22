use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Serialize, Deserialize)]
pub struct AppConfig {
    pub last_zip_path: Option<String>,
}

pub fn get_config_path() -> Option<PathBuf> {
    dirs::config_dir().map(|dir| dir.join("archivist").join("config.json"))
}

pub fn load_config() -> Option<AppConfig> {
    let path = get_config_path()?;
    if path.exists() {
        fs::read_to_string(path)
            .ok()
            .and_then(|content| serde_json::from_str(&content).ok())
    } else {
        None
    }
}

pub fn save_config(config: &AppConfig) {
    if let Some(path) = get_config_path() {
        if let Some(parent) = path.parent() {
            let _ = fs::create_dir_all(parent);
        }

        if let Ok(json) = serde_json::to_string_pretty(config) {
            let _ = fs::write(path, json);
        }
    }
}
