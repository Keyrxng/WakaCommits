import axios from "axios";
import { execSync } from "child_process";
import * as dotenv from "dotenv";
import { request, gql } from "graphql-request";
dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const WAKATIME_API_KEY = process.env.WAKATIME_API_KEY;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const COMMIT_START_DATE = process.env.COMMIT_START_DATE; // Format: "2020-08-24T00:00:00Z"

function initializeGitRepo() {
  execSync("git init", { stdio: "inherit" });
}

const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";

async function fetchGitHubCommitHistory(since: string): Promise<string[]> {
  let hasNextPage = true;
  let cursor = null;
  const commitDates: string[] = [];

  const query = gql`
    query ($username: String!, $cursor: String, $since: GitTimestamp!) {
      user(login: $username) {
        repositories(first: 100, after: $cursor) {
          edges {
            node {
              name
              ref(qualifiedName: "main") {
                target {
                  ... on Commit {
                    history(first: 100, since: $since) {
                      pageInfo {
                        hasNextPage
                        endCursor
                      }
                      edges {
                        node {
                          committedDate
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  while (hasNextPage) {
    // @ts-ignore
    const response = await request(
      GITHUB_GRAPHQL_API,
      query,
      {
        username: GITHUB_USERNAME,
        cursor: cursor,
        since: since,
      },
      {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      }
    );

    // @ts-ignore
    const repos = response.user.repositories.edges;
    for (const repo of repos) {
      const commits = repo.node.ref?.target?.history.edges;
      if (!commits) continue;
      commitDates.push(
        ...commits.map((edge: any) => edge.node.committedDate.substring(0, 10))
      );
    }

    // @ts-ignore
    const pageInfo =
      repos[repos.length - 1]?.node.ref?.target?.history.pageInfo;
    hasNextPage = pageInfo?.hasNextPage ?? false;
    cursor = pageInfo?.endCursor ?? null;
  }

  const uniqueCommitDates = Array.from(new Set(commitDates));
  return uniqueCommitDates;
}

async function fetchWakaTimeActivity(): Promise<string[]> {
  const headers = {
    Authorization: `Basic ${Buffer.from(WAKATIME_API_KEY).toString("base64")}`,
  };
  const response = await axios.get(
    "https://wakatime.com/api/v1/users/current/insights/days/last_year",
    { headers }
  );
  const codingDates: string[] = response.data.data.days.map((entry: any) => {
    if (entry.total <= 60) return null;
    return entry.date;
  });

  const uniqueCodingDates = Array.from(new Set(codingDates));
  return uniqueCodingDates;
}

function createAndSpoofCommits(dates: string[]) {
  for (const date of dates) {
    execSync(
      `git commit --allow-empty --date="${date}" -m "Generated Commit on ${date}"`,
      { stdio: "inherit" }
    );
  }
}

async function main() {
  initializeGitRepo();

  const gitHubHistory = await fetchGitHubCommitHistory(
    COMMIT_START_DATE ?? "2020-08-24T00:00:00Z"
  ).then((dates) => dates.map((date) => date.substring(0, 10)));

  const wakaTimeActivity = await fetchWakaTimeActivity();

  const missingCommitDates = wakaTimeActivity.filter(
    (date) => !gitHubHistory.includes(date) && date !== null
  );

  createAndSpoofCommits(missingCommitDates);
}

main().catch(console.error);
