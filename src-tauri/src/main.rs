// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod models;
mod utils;

use commands::{clear_cache, parse_zip};
use models::AppState;

use tauri::Manager;
use tauri_plugin_cli::CliExt;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_cli::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![parse_zip, clear_cache])
        .setup(|app| {
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
                    println!("use_cache = {}", use_cache);
                    app.manage(AppState { use_cache });
                }
                Err(_) => {}
            };
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
