# CoachMe Health SMS Care Delivery Tool

## Setting Up

#### Tool Dependencies

- Git Clone this repository
- Have MongoDB running locally (we recommend homebrew) or through Docker
- Install relevant NodeJS version as documented in Dockerfile and/or .tool-versions.
  - We recommend you use [ASDF](https://github.com/asdf-vm/asdf) as a language version manager.
- Install Yarn Package Manager

#### Editor Setup

This project uses Typescript, ESLint and Prettier. You should ensure you have your editor, or git hooks setup to run these tools automatically. PRs will not be merged if there are compiler, or lint errors.

We recommend using VSCode as it has very good Typescript support.


#### Running the Project

1. Make sure you have all tool dependencies installed and running
1. Install project dependencies using `yarn install`
1. Setup your local ENV variables using your prefered shell environment management tool (we like [direnv](https://github.com/direnv/direnv). `src/utils/config.ts` is a great starting point for what env vars you need.
    - You don't need real values for many env variables (like twilio for instance) as you should be testing individual features in an isolated maner without actually hitting 3rd party services.
    -  The only env variables that need real values are `DATABASE_URI` and `JWT_SECRET`.
    - `DATABASE_URI` should be a mongo style access URI, aka `mongodb://`.
    - `JWT_SECRET` is just a random string, so any random string of alphanumeric characters is fine.
1. Run the tests, local server, or typescript compiler using the relevant yarn command.

## Contributing

#### Getting Started

* You can find all the open bugs, and features on our [Trello Board](https://trello.com/invite/b/amtt2I8R/2a0aad0d979f693eeb0282b3f9a7c649/engineering-backlog)

* If you'd like to converse the the team on our Slack channel please email karin@coachmehealth.org to sign a volunteer agreement.


#### Best Practices

* Keep your PRs small and focused on a specific well defined chunk of work, like a bug or feature. If it's a large feature consider breaking it down into multiple atomic pieces of work that can be safely merged without needing the whole feature completed. Large PRs take a lot longer to review, and will likely result in extra work since feedback is given at the end rather than on an ongoing basis. Draft PRs are your friend.

* No merge commits, use rebase.

* Every commit on the main/master branch should be thought of as an atomic unit of work that can be safely reverted in isolation. If a branch / PR has many small changes we'll likely squash merge it.

* Prefer async/await vs promise chaining. There's legacy code that uses "then" style promise chaining, but we are trying to refactor that logic whenever we touch it.

* Use the power of typescript to your advantage. Frequent use of `any` without putting thought into type definition limits the utility of TypeScript to help us safely refactor & change the codebase.



## Acknowledgements & Thank You's

* The first version of this tool was built by a volunteer team as part of UPenn Hack4Impact. You can find their work [here](https://github.com/hack4impact-upenn/coach-me-health)
