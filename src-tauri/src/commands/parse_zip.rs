use crate::models::{AppState, CachedData, Connection, FacebookData, Message};
use crate::utils::{parse_connections, parse_inbox, parse_timeline, save_config, AppConfig};
use sha2::{Digest, Sha256};
use std::fs;
use std::fs::File;
use zip::ZipArchive;

#[tauri::command]
pub fn parse_zip(zip_path: String, state: tauri::State<AppState>) -> Result<FacebookData, String> {
    let use_cache = state.use_cache;
    println!("📦 parse_zip called with use_cache = {}", use_cache);
    let mut hasher = Sha256::new();
    hasher.update(zip_path.as_bytes());
    let hash = format!("{:x}", hasher.finalize());
    let zip_file = File::open(&zip_path).map_err(|e| format!("⚠️ Failed to open zip: {}", e))?;
    let mut archive =
        ZipArchive::new(zip_file).map_err(|e| format!("⚠️ Failed to read zip: {}", e))?;

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
        return Err("⚠️ Expected inbox path does not exist".to_string());
    }

    messages = parse_inbox(messages, &inbox_path)?;

    // Parse timeline posts
    let timeline_path = temp_dir
        .path()
        .join("your_facebook_activity/posts/your_posts__check_ins__photos_and_videos_1.html");
    if timeline_path.exists() {
        println!("✅ Found timeline path");
        messages = parse_timeline(messages, &timeline_path)?;
    } else {
        println!("⚠️ Timeline path not found");
    }

    println!("✅ Total messages parsed: {}", messages.len());
    let mut connections: Vec<Connection> = vec![];

    let connections_path = temp_dir
        .path()
        .join("connections/friends/your_friends.html");
    if connections_path.exists() {
        println!("✅ Found connections path");
        connections = parse_connections(connections, &connections_path)?;
        println!("Added {} connections to friend list", connections.len());
    }

    if use_cache {
        let cache_path = dirs::cache_dir()
            .ok_or("Failed to get cache directory")?
            .join("archivist")
            .join(format!("{}.json", hash));

        if let Some(parent) = cache_path.parent() {
            fs::create_dir_all(parent).ok();
        }

        let cache = CachedData {
            messages: messages.clone(),
            connections: connections.clone(),
        };

        let serialized = serde_json::to_string_pretty(&cache).map_err(|e| e.to_string())?;
        fs::write(&cache_path, serialized).ok();

        save_config(&AppConfig {
            last_zip_path: Some(zip_path.clone()),
        });

        println!("💾 Cached messages + connections to {:?}", cache_path);
    }

    Ok(FacebookData {
        messages,
        connections,
    })
}
