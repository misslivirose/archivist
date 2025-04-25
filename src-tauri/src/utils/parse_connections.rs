use crate::models::Connection;
use scraper::{Html, Selector};
use std::{fs, path::Path};

pub fn parse_connections(
    mut connections: Vec<Connection>,
    connection_path: &Path,
) -> Result<Vec<Connection>, String> {
    let html = fs::read_to_string(connection_path).map_err(|e| e.to_string())?;
    let doc = Html::parse_document(&html);

    let block_sel = Selector::parse("div._a6-g").unwrap();
    let name_sel = Selector::parse("div._2ph_._a6-h._a6-i").unwrap();
    let date_sel = Selector::parse("div._a72d").unwrap();

    for block in doc.select(&block_sel) {
        let name = block
            .select(&name_sel)
            .next()
            .map(|e| e.text().collect::<String>().trim().to_string())
            .unwrap_or_default();

        let added_date = block
            .select(&date_sel)
            .next()
            .map(|e| e.text().collect::<String>().trim().to_string())
            .unwrap_or_default();

        if !name.is_empty() && !added_date.is_empty() {
            connections.push(Connection { name, added_date });
        }
    }
    return Ok(connections);
}
