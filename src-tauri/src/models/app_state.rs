use crate::models::Message;
use std::path::PathBuf;
use std::sync::Mutex;

pub struct AppState {
    pub use_cache: bool,
    pub last_cache_path: Mutex<Option<PathBuf>>,
    pub cached_messages: Mutex<Option<Vec<Message>>>,
}
