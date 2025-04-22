// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod models;
mod utils;

use commands::{clear_cache, parse_zip};
use models::{AppState, Message};
use utils::load_config;

use sha2::{Digest, Sha256};
use std::fs;
use std::sync::Mutex;
use tauri::Manager;
use tauri_plugin_cli::CliExt;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_cli::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![parse_zip, clear_cache])
        .setup(|app| {
            let use_cache = true;
            let mut last_cache_path = None;
            let mut cached_messages = None;

            if let Some(config) = load_config() {
                if let Some(zip_path) = config.last_zip_path {
                    let mut hasher = Sha256::new();
                    hasher.update(zip_path.as_bytes());
                    let hash = format!("{:x}", hasher.finalize());

                    let cache_path = dirs::cache_dir()
                        .unwrap()
                        .join("archivist")
                        .join(format!("{}.json", hash));

                    if cache_path.exists() {
                        println!("📂 Found cache from config: {:?}", cache_path);
                        last_cache_path = Some(cache_path.clone());

                        cached_messages =
                            fs::read_to_string(&cache_path).ok().and_then(|content| {
                                serde_json::from_str::<Vec<Message>>(&content).ok()
                            });
                    }
                }
            }

            // Get CLI matches from the plugin
            match app.cli().matches() {
                Ok(matches) => {
                    // Extract --no-cache flag and invert it
                    let use_cache = matches
                        .args
                        .get("no-cache")
                        .map(|a| a.occurrences > 0)
                        .unwrap_or(false);
                    println!("{:?}", matches);
                    println!("caching = {}", use_cache);
                }
                Err(_) => {}
            };
            app.manage(AppState {
                use_cache,
                last_cache_path: Mutex::new(last_cache_path),
                cached_messages: Mutex::new(cached_messages),
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
