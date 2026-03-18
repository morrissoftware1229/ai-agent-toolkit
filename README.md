# ai-agent-toolkit
A portfolio project for building practical AI agent skills, tools, and workflows

# Purpose
The company I work for at the time of this project is rapidly adopting generative AI tools. Lately, everyone is obsessed with Claude Code, Kiro, etc., so I am learning how to work with these agents and build useful skills for them.

# Broader Explanation of Steps
- I am first gathering data sources and creating a series of scripts to extract that information into a more dense format, so the agent can store more in its context window and make better judgements.

# Steps Completed So Far
- Example folder structure was created
- Script to parse json file was created
- Script was updated to print additional fields from parsed file
- Script was updated with a call to the model to summarize conversations focusing on what was learned and what steps to take next
- Script adjusted to write to Obsidian vault markdown file
- New script performing graph traversal created, so less data can be fed into OpenAI API
- Adjusted graph-traversal to output to a text file where read-exports reads from
- Adjusted prompt to give more useful information and changed fs function from writing to appending
- Changed file names and folder structure around
- Corrected apple-health-data-extraction.js to output file information correctly, but there are some issues tying the extraction values to the values in my phone
- Added pull-data.py file from another project to pull Oura data

# Future Plans
- My pull-data.py file currently doesn't have handling for the email validation step that needs to be completed before data can be pulled for the first time. I'll add this functionality later because it will probably be unneccasrily complex to save one or a few button clicks.