import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

const REPO_OWNER = process.env.GITHUB_REPO_OWNER!;
const REPO_NAME = process.env.GITHUB_REPO_NAME!;

export function createGithubIssue(title: string, body: string, labels: Array<string>) {
    return octokit.issues.create({ owner: REPO_OWNER, repo: REPO_NAME, title, body, labels });
}

export async function updateGithubIssue(issueNumber: number, state: "open" | "closed") {
    return octokit.issues.update({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        issue_number: issueNumber,
        state,
    });
}
