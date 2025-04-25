use crate::models::Message;
use crate::utils::extract_year;
use scraper::{Html, Selector};
use std::fs;
use std::path::Path;

pub fn parse_inbox(mut messages: Vec<Message>, inbox_path: &Path) -> Result<Vec<Message>, String> {
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
    return Ok(messages);
}

pub fn parse_timeline(
    mut messages: Vec<Message>,
    timeline_path: &Path,
) -> Result<Vec<Message>, String> {
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
            }
        }
    }
    return Ok(messages);
}
