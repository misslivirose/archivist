use crate::models::{Connection, Message};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct CachedData {
    pub messages: Vec<Message>,
    pub connections: Vec<Connection>,
}
