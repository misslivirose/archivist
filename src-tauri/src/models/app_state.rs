use crate::models::{Connection, Message};
use std::sync::Mutex;

pub struct AppState {
    pub use_cache: bool,
    pub cached_messages: Mutex<Option<Vec<Message>>>,
    pub cached_connections: Mutex<Option<Vec<Connection>>>,
}
