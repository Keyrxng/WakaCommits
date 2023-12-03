# WakaCommits: Commit Backfiller

There are days when I get so caught up in coding/debugging/messing around that I forget to commit. It's easy to lose track of time when you're in the zone, and sometimes, committing just doesn't seem like the top priority at the moment. That's where this script comes in. I started using WakaTime back at the end of August, and I realized that I could use this data to fill in the gaps in my GitHub commit history.

This script cross-references the days I've coded (as per WakaTime) with the days I've actually made commits on GitHub. If it finds a day with coding activity but no commits, it automatically generates a commit for that day. This repository's commit history is a result of this script, which you might find useful if you also tend to forget to commit during those deep work sessions.

## Usage

To use this script, you should have Node.js installed. Here's how to set it up:

1. **Clone the Repository:** 
    ```bash
    git clone https://github.com/Keyrxng/WakaCommits
    ```
2. **Install Dependencies:**
    ```bash
    yarn install
    ```
3. **Set Up Environment Variables:**

    ```bash
    cp .env.example .env
    ```

    Then, open `.env` and fill in the values for the following variables:

    ``GITHUB_TOKEN``: Your GitHub personal access token. You can find it [here](https://github.com/settings/tokens)

    ``WAKATIME_API_KEY``: Your WakaTime API key. You can find it [here](https://wakatime.com/settings/account).

    ``GITHUB_USERNAME``: Your GitHub username.

    ``COMMIT_START_DATE`` The date you want to start backfilling commits from. This should be in the format ``YYYY-MM-DDT00:00:00Z``.

4. **Run the Script:**
    ```bash
    yarn build && yarn start
    ```

5. **Push the Commits:**
    ```bash
    git remote add origin <your-repo-url> &&
    git push -u origin master
    ```

## What this is not
- This is not a tool for generating fake commits. It's meant to be used as a last resort for those days when you forget to commit.
- This in not a commit history spoofer or fabricator, this relies on your WakaTime data to generate commits.
- This is not a replacement for good commit hygiene. It's not a good idea to use this script as a crutch to avoid committing regularly. Instead, it should be used as a last resort for those days when you forget to commit.



