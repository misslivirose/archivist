use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct Connection {
    pub name: String,
    pub added_date: String,
}
