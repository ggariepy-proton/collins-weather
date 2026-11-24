# Collins Avenue Weather Authority feed
Create a separate public repository named `collins-weather` to avoid replacing any existing Angular Pages site. Copy the scripts and .github directories into its root and commit to the default branch.

1. In Settings > Secrets and variables > Actions, create repository secrets AWN_API_KEY and AWN_APPLICATION_KEY. If the account has multiple stations, also set AWN_DEVICE_MAC to the desired station MAC address. Never commit credentials.
2. In Settings > Pages, select GitHub Actions as the source.
3. In Actions > Publish weather feed, select Run workflow. Check the deployment result.
4. Expected feed: https://ggariepy.github.io/collins-weather/weather.json (once deployed).

The workflow runs every 15 minutes, best effort. Scheduled workflows may be delayed or disabled after inactivity. The last successful publication remains available if a subsequent run fails. Check observed_at before using data; do not treat this feed as a safety-critical warning service. Only allowlisted outdoor numeric observations are published. The station name is public. No dependencies beyond Node 22. No live API test was performed.
