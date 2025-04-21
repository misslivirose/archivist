use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Message {
    pub sender: String,
    pub timestamp: String,
    pub content: String,
    pub conversation: String,
}
