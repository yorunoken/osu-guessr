"use server";

const API_URL = process.env.SERVER_URL;

export async function query(sql: string, values?: Array<unknown>) {
    console.log(sql);

    try {
        const response = await fetch(`${API_URL}/api/query`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                sql,
                values: values || [],
            }),
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const result = await response.json();
        // console.log("Query executed successfully:", sql);

        return result;
    } catch (err) {
        console.error("Error during query execution:", err);
        throw err;
    }
}
