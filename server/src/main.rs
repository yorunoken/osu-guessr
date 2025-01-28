use dotenvy::from_filename;
use std::env;

mod api;
mod database;
mod routes;

#[tokio::main]
async fn main() {
    from_filename(".env.local").ok();
    from_filename(".env").ok();

    let pool = database::create_connection().await;
    let api = routes::router(pool);

    let port: u16 = env::var("PORT")
        .expect("Expected PORT to be defined in environment.")
        .parse()
        .expect("PORT is not a number!");

    println!("Listening on http://localhost:{}", port);
    warp::serve(api).run(([127, 0, 0, 1], port)).await;
}
