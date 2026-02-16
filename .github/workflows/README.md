# GitHub Actions Workflows

## CI/CD Workflow

The [ci-cd.yml](ci-cd.yml) workflow handles continuous integration and deployment for the UniversalItemManagement project.

### What it does:

1. **Test Job** - Runs on every push and PR to master:
   - Sets up .NET 8.0
   - Restores dependencies
   - Builds the solution
   - Runs integration tests

2. **Build and Deploy Job** - Runs after tests pass (only on master branch pushes):
   - Sets up Node.js 20
   - Installs npm dependencies
   - Builds the Angular app with production configuration
   - Deploys to GitHub Pages

### Setup Instructions:

1. **Enable GitHub Pages in your repository:**
   - Go to Settings → Pages
   - Under "Source", select **GitHub Actions**

2. **Verify the base-href:**
   - Line 60 in ci-cd.yml uses `--base-href /UniversalItemManagement/`
   - This should match your repository name
   - If your repo has a different name, update this value

3. **Trigger the workflow:**
   - Push to the master branch
   - Or manually trigger via Actions tab → CI/CD → Run workflow

### Your app will be available at:
`https://[your-username].github.io/UniversalItemManagement/`

### Notes:

- The workflow only deploys to GitHub Pages on pushes to master (not on PRs)
- Tests must pass before deployment
- The Angular app is built with production configuration
- API calls in production use relative paths (`/api`, `/Hub`) defined in [environment.ts](../../universalitemmanagement.client/src/environments/environment.ts)
