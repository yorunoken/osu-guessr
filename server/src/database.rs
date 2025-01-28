use mysql::{OptsBuilder, Pool};
use std::env;

pub async fn create_connection() -> Pool {
    let user = env::var("DB_USER").unwrap();
    let passw = env::var("DB_PASSWORD").unwrap();
    let url = env::var("DB_HOST_URL").unwrap();
    let db = env::var("DB_NAME").unwrap();

    let opts = OptsBuilder::new()
        .user(Some(user))
        .pass(Some(passw))
        .ip_or_hostname(Some(url))
        .db_name(Some(db))
        .tcp_port(3306);

    let pool = Pool::new(opts).unwrap();

    pool
}
