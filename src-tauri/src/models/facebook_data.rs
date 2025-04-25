use crate::models::{Connection, Message};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct FacebookData {
    pub messages: Vec<Message>,
    pub connections: Vec<Connection>,
}
