// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod models;
mod utils;

use commands::{clear_cache, parse_zip, read_connection_cache, read_message_cache};
use models::{AppState, CachedData};
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
        .invoke_handler(tauri::generate_handler![
            parse_zip,
            clear_cache,
            read_message_cache,
            read_connection_cache,
        ])
        .setup(|app| {
            let use_cache = true;
            let mut cached_messages = None;
            let mut cached_connections = None;

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
                        if let Ok(content) = fs::read_to_string(&cache_path) {
                            if let Ok(cached) = serde_json::from_str::<CachedData>(&content) {
                                println!(
                                    "✅ Loaded {} messages and {} connections from cache.",
                                    cached.messages.len(),
                                    cached.connections.len()
                                );
                                cached_messages = Some(cached.messages);
                                cached_connections = Some(cached.connections);
                            } else {
                                println!(
                                    "⚠️ Failed to parse combined cache file: {:?}",
                                    cache_path
                                );
                            }
                        }
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
                cached_connections: Mutex::new(cached_connections),
                cached_messages: Mutex::new(cached_messages),
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
