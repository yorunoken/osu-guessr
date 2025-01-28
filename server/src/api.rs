use std::collections::HashMap;

use mysql::{params, prelude::Queryable, Pool};
use serde::Deserialize;
use serde_json::{json, Value};
use warp::{http::StatusCode, reject::Rejection, reply};

#[derive(Deserialize)]
pub struct Query {
    sql: String,
    values: Vec<Value>,
}

pub async fn query(query: Query, pool: Pool) -> Result<impl reply::Reply, Rejection> {
    let Query { sql, values } = query;

    let values: Vec<mysql::Value> = values
        .into_iter()
        .map(|v| match v {
            Value::Null => mysql::Value::NULL,
            Value::Bool(b) => mysql::Value::from(b),
            Value::Number(n) => {
                if let Some(i) = n.as_i64() {
                    mysql::Value::from(i)
                } else if let Some(u) = n.as_u64() {
                    mysql::Value::from(u)
                } else if let Some(f) = n.as_f64() {
                    mysql::Value::from(f)
                } else {
                    mysql::Value::NULL
                }
            }
            Value::String(s) => mysql::Value::from(s),
            Value::Array(_) | Value::Object(_) => mysql::Value::NULL,
        })
        .collect();

    let mut conn = match pool.get_conn() {
        Ok(c) => c,
        Err(e) => {
            return Ok(reply::with_status(
                json!({
                    "error": "Failed to get database connection",
                    "details": e.to_string()
                })
                .to_string(),
                StatusCode::INTERNAL_SERVER_ERROR,
            ))
        }
    };

    let result = match conn.exec::<mysql::Row, _, _>(&sql, params::Params::Positional(values)) {
        Ok(res) => res,
        Err(e) => {
            return Ok(reply::with_status(
                json!({
                    "error": "Failed to execute query",
                    "details": e.to_string()
                })
                .to_string(),
                StatusCode::INTERNAL_SERVER_ERROR,
            ))
        }
    };

    let rows: Vec<HashMap<String, Value>> = result
        .into_iter()
        .map(|row| {
            let mut map = HashMap::new();
            for (i, column) in row.columns_ref().iter().enumerate() {
                let value = row
                    .get_opt::<mysql::Value, usize>(i)
                    .unwrap_or(Ok(mysql::Value::NULL))
                    .unwrap();
                let value = match value {
                    mysql::Value::NULL => Value::Null,
                    mysql::Value::Bytes(bytes) => {
                        Value::String(String::from_utf8_lossy(&bytes).to_string())
                    }
                    mysql::Value::Int(i) => Value::Number(i.into()),
                    mysql::Value::UInt(u) => Value::Number(u.into()),
                    mysql::Value::Float(f) => match serde_json::Number::from_f64(f as f64) {
                        Some(num) => Value::Number(num),
                        None => Value::Null,
                    },
                    mysql::Value::Double(d) => match serde_json::Number::from_f64(d) {
                        Some(num) => Value::Number(num),
                        None => Value::Null,
                    },
                    mysql::Value::Date(year, month, day, hour, min, sec, micros) => {
                        Value::String(format!(
                            "{:04}-{:02}-{:02} {:02}:{:02}:{:02}.{:06}",
                            year, month, day, hour, min, sec, micros
                        ))
                    }
                    mysql::Value::Time(is_neg, days, hours, minutes, seconds, micros) => {
                        Value::String(format!(
                            "{}{:02}:{:02}:{:02}.{:06}",
                            if is_neg { "-" } else { "" },
                            days * 24 + u32::from(hours),
                            minutes,
                            seconds,
                            micros
                        ))
                    }
                };
                map.insert(column.name_str().to_string(), value);
            }
            map
        })
        .collect();

    let json_result = match serde_json::to_string(&rows) {
        Ok(json) => json,
        Err(e) => {
            return Ok(reply::with_status(
                json!({
                    "error": "Failed to serialize result",
                    "details": e.to_string()
                })
                .to_string(),
                StatusCode::INTERNAL_SERVER_ERROR,
            ))
        }
    };

    Ok(reply::with_status(json_result, StatusCode::OK))
}
