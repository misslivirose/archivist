// Helper function to extract the year from a raw timestamp string
// Example: "Dec 24, 2008 6:02:29 pm" -> returns 2008
// Used for creating "conversations" from Timeline data
pub fn extract_year(timestamp: &str) -> Option<String> {
    let re = regex::Regex::new(r"\b(\d{4})\b").ok()?;
    re.captures(timestamp)
        .and_then(|caps| caps.get(1))
        .map(|m| m.as_str().to_string())
}
