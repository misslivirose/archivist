// src-tauri/src/main.rs

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use scraper::{Html, Selector};
use serde::Serialize;
use std::fs;
use std::fs::File;
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use tauri::Manager;
use zip::ZipArchive;

#[derive(Serialize)]
struct Message {
    sender: String,
    timestamp: String,
    content: String,
    conversation: String,
}

#[tauri::command]
fn parse_zip(zip_path: String) -> Result<Vec<Message>, String> {
    let zip_file = File::open(&zip_path).map_err(|e| format!("Failed to open zip: {}", e))?;
    let mut archive =
        ZipArchive::new(zip_file).map_err(|e| format!("Failed to read zip: {}", e))?;

    let temp_dir = tempfile::tempdir().map_err(|e| e.to_string())?;
    for i in 0..archive.len() {
        let mut file = archive.by_index(i).unwrap();
        let out_path = temp_dir.path().join(file.name());

        if file.name().ends_with('/') {
            fs::create_dir_all(&out_path).unwrap();
        } else {
            if let Some(p) = out_path.parent() {
                if !p.exists() {
                    fs::create_dir_all(p).unwrap();
                }
            }
            let mut out_file = File::create(&out_path).unwrap();
            std::io::copy(&mut file, &mut out_file).unwrap();
        }
    }

    let inbox_path = temp_dir
        .path()
        .join("your_facebook_activity/messages/inbox");
    let mut messages: Vec<Message> = vec![];

    if !inbox_path.exists() {
        return Err("Expected inbox path does not exist".to_string());
    }

    for entry in walkdir::WalkDir::new(inbox_path)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let path = entry.path();
        if path.is_file()
            && path
                .file_name()
                .unwrap()
                .to_string_lossy()
                .starts_with("message_")
            && path.extension().unwrap_or_default() == "html"
        {
            let conv_name = path
                .parent()
                .and_then(|p| p.file_name())
                .map(|n| n.to_string_lossy().to_string())
                .unwrap_or("Unknown".to_string());
            let html = fs::read_to_string(path).map_err(|e| e.to_string())?;
            let doc = Html::parse_document(&html);

            let block_sel = Selector::parse("div._a6-g").unwrap();
            let sender_sel = Selector::parse("div._a6-h").unwrap();
            let text_sel = Selector::parse("div._a6-p").unwrap();
            let time_sel = Selector::parse("div._a72d").unwrap();

            for block in doc.select(&block_sel) {
                let sender = block
                    .select(&sender_sel)
                    .next()
                    .map(|e| e.text().collect::<String>())
                    .unwrap_or_default();
                let content = block
                    .select(&text_sel)
                    .next()
                    .map(|e| e.text().collect::<String>())
                    .unwrap_or_default();
                let timestamp_raw = block
                    .select(&time_sel)
                    .next()
                    .map(|e| e.text().collect::<String>())
                    .unwrap_or_default();

                messages.push(Message {
                    sender,
                    timestamp: timestamp_raw,
                    content,
                    conversation: conv_name.clone(),
                });
            }
        }
    }
    println!("✅ Total messages parsed: {}", messages.len());
    Ok(messages)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![parse_zip])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
