use crate::models::{AppState, Message};
use crate::utils::extract_year;
use scraper::{Html, Selector};
use sha2::{Digest, Sha256};
use std::fs;
use std::fs::File;
use zip::ZipArchive;

#[tauri::command]
pub fn parse_zip(zip_path: String, state: tauri::State<AppState>) -> Result<Vec<Message>, String> {
    let use_cache = state.use_cache;
    println!("📦 parse_zip called with use_cache = {}", use_cache);
    let mut hasher = Sha256::new();
    hasher.update(zip_path.as_bytes());
    let hash = format!("{:x}", hasher.finalize());
    let cache_path = dirs::cache_dir()
        .ok_or("Failed to get cache directory")?
        .join("archivist")
        .join(format!("{}.json", hash));

    if cache_path.exists() {
        let cached_data = fs::read_to_string(&cache_path).map_err(|e| e.to_string())?;
        let messages: Vec<Message> =
            serde_json::from_str(&cached_data).map_err(|e| e.to_string())?;
        println!("✅ Loaded {} messages from cache", messages.len());
        return Ok(messages);
    }

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

                if !content.trim().is_empty() {
                    messages.push(Message {
                        sender,
                        timestamp: timestamp_raw,
                        content,
                        conversation: conv_name.clone(),
                    });
                }
            }
        }
    }

    // Parse timeline posts
    let timeline_path = temp_dir
        .path()
        .join("your_facebook_activity/posts/your_posts__check_ins__photos_and_videos_1.html");
    if timeline_path.exists() {
        println!("✅ Found timeline path");
        for entry in walkdir::WalkDir::new(&timeline_path)
            .into_iter()
            .filter_map(|e| e.ok())
        {
            let path = entry.path();
            if path.is_file() && path.extension().unwrap_or_default() == "html" {
                let html = fs::read_to_string(path).map_err(|e| e.to_string())?;
                let doc = Html::parse_document(&html);

                let status_sel = Selector::parse("div._a6-g").unwrap();
                let sender_sel = Selector::parse("div._a6-h").unwrap();
                let content_sel = Selector::parse("div._2pin").unwrap();
                let time_sel = Selector::parse("div._a72d").unwrap();

                for block in doc.select(&status_sel) {
                    let sender = block
                        .select(&sender_sel)
                        .next()
                        .map(|e| e.text().collect::<String>())
                        .unwrap_or_default();

                    let content = block
                        .select(&content_sel)
                        .next()
                        .map(|e| e.text().collect::<String>())
                        .unwrap_or_default();

                    let timestamp_raw = block
                        .select(&time_sel)
                        .next()
                        .map(|e| e.text().collect::<String>())
                        .unwrap_or_default();

                    // Extract year from timestamp for "timeline_YYYY"
                    let year = extract_year(&timestamp_raw).unwrap_or("unknown".to_string());
                    let conv_name = format!("timeline_{}", year);

                    if !content.trim().is_empty() {
                        messages.push(Message {
                            sender,
                            timestamp: timestamp_raw,
                            content,
                            conversation: conv_name,
                        });
                    }
                    println!("Added message from timeline");
                }
            }
        }
    } else {
        println!("⚠️ Timeline path not found");
    }

    println!("✅ Total messages parsed: {}", messages.len());

    if use_cache {
        if let Some(parent) = cache_path.parent() {
            fs::create_dir_all(parent).ok();
        }
        let serialized = serde_json::to_string(&messages).map_err(|e| e.to_string())?;
        fs::write(&cache_path, serialized).ok();
        println!("💾 Cached messages to {:?}", cache_path);
    }

    Ok(messages)
}
