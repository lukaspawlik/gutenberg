#!/bin/bash
set -e

# 1. Proceed only when acting on an opened pull request.

action=$(jq -r '.action' $GITHUB_EVENT_PATH)

if [ "$action" != 'closed' ]; then
	echo "Action '$action' not a close action. Aborting."
	exit 0;
fi

# 2. Find the issues that this PR 'fixes'.

issues=$(
	jq -r '.pull_request.body' $GITHUB_EVENT_PATH | perl -nle 'print $1 while /
		(?:close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved)
		:?
		\ +
		(?:\#?|https?:\/\/github\.com\/WordPress\/gutenberg\/issues\/)
		(\d+)
	/igx'
)

if [ -z "$issues" ]; then
	echo "Pull request does not 'fix' any issues. Aborting."
	exit 0
fi

# 3. Grab the author of the PR.

author=$(jq -r '.pull_request.user.login' $GITHUB_EVENT_PATH)

# 4. Loop through each 'fixed' issue.

for issue in $issues; do

	# 4a. Add the author as an asignee to the issue. This fails if the author is
	#     already assigned, which is expected and ignored.

	curl \
		--silent \
		-X POST \
		-H "Authorization: token $GITHUB_TOKEN" \
		-H "Content-Type: application/json" \
		-d "{\"assignees\":[\"$author\"]}" \
		"https://api.github.com/repos/$GITHUB_REPOSITORY/issues/$issue/assignees" > /dev/null

	# 3b. Label the issue as 'In Progress'. This fails if the label is already
	#     applied, which is expected and ignored.

	curl \
		--silent \
		-X POST \
		-H "Authorization: token $GITHUB_TOKEN" \
		-H "Content-Type: application/json" \
		-d '{"labels":["[Status] In Progress"]}' \
		"https://api.github.com/repos/$GITHUB_REPOSITORY/issues/$issue/labels" > /dev/null

done
