use mysql::Pool;
use warp::{body::json, Filter, Rejection, Reply};

use crate::api::query;

pub fn router(pool: Pool) -> impl Filter<Extract = impl Reply, Error = Rejection> + Clone {
    let query_api = warp::path!("api" / "query")
        .and(warp::post())
        .and(json())
        .and(with_db(pool.clone()))
        .and_then(query);

    query_api
}

fn with_db(pool: Pool) -> impl Filter<Extract = (Pool,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || pool.clone())
}
