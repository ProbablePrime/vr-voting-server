# Neos Voting Server

This is my voting server for Neos and the Metaverse Maker Competition which ran in September 2020. In this competition we wanted to allow the Neos community to vote for worlds within neos. This required a lot of work both inside Neos and outside of it so this is only half of the equation. More information is due to follow at a later date including a walk through of how the systems work.

## Dos and Don'ts

### DO

- Assume each vote is not trustworthy
- Have some understanding of Web servers and HTTP before using
- Run your neos world on a headless session with vastly restricted permissions
- Ensure only localhost or 127.0.0.1 can talk to this server

### DON'T

- [Use this for a Major Election in your country](https://www.youtube.com/watch?v=LkH2r-sNjQs)
- Use this for anything secure
- Assume the votes are all trustworthy to start
- Send, Receive or Transact any currency through this

## Setup Instructions

For now if you're confident in your ability to hack around ambiguity, you can follow these basic instructions:

1. Install Node.js, Version 12 or higher is required.
2. Install the Node.js Build tools, the Node.js installer should do this for you, if not...good luck
3. Run `npm install` in the root of this directory to install everything
4. Configure the configuration file, check default.json for an example which should still be the MMC state.
5. Run `npm run start` to run the server.
6. Setup the Neos world, there are no instructions for this at the moment, stand by

## Limits

Users can vote ONCE in each category in each competition. If you have one competition and 3 categories that's a total of THREE votes. For example:

The MMC Competition has 3 Categories, A,B,C and Prime wants to vote, He can only vote ONCE in A, ONCE in B, ONCE in C.

## Results Storage

Results are stored within: `results/<competition name.csv>`, it is formatted as a CSV file without headers. Before processing your results, COPY the file to another location. This server owns the file as it stands within this location and it will not tolerate extra columns, graphs, headers, tabs or anything else. COPY IT BEFORE MODIFICATION.

Results are the following properties in order:

1. competition name - e.g. MMC
2. Competition category - e.g. avatar
3. Vote Target - This is the item they are voting for. It is a World ID/Record ID. It does require some converting to turn into a world name but we wanted to be resilient to world name changes. Instructions on how to convert these into world names will be provided later
4. Username - User's username
5. User's UserId - This may be different from the username sometimes
6. machineId - the Profile machine id of the Neos installation. this is not secret or used for anything security wise, it just identifies an installation of Neos. It is not a MAC Address.
7. Registration date - The registration date of the user, this is public information on the Neos VR API
8. Received Timestamp - when this vote was made in Neos
9. Arrived Timestamp - When this vote was accepted by the server
10. Session Id - the id of the session which this vote was made in

Using the above results information there should be enough information to validate if a vote is trustworthy.

## Vote State Storage

Very Small SQLite Databases in `db/<competition>.db` store the vote state of each user in each category. I don't recommend looking in these files yourself but you can use an SQLite browser to do so. They record a simple boolean for each user's vote status in each competition. Its all automatic, don't touch it that much.

You can clear a vote state using `deletePrime.js` this is currently hard coded to just Prime. It should stay that way. You shouldn't touch your vote system once votes start.

## Logging

Logs are stored in logs/. A new file is made every hour(this should be each day but i don't know how right now). Logs contain a lot of information. Read them. Everything is automatic.

## Accuracy

Every effort has been made to make this voting system accurate but you MUST still assume each and every vote is not accurate. Check them. Does it look valid:

- Is the user's registration date very close to the start of the competition, do a lot of users have the same registration date
- Do the User Ids or Usernames look similar or obviously faked
- Do a lot of votes for the same item occur at the same time
- Are votes made quickly, as in do they come in at a high speed
- Is the session id that's stored one of the valid session ids for the world.
- Do log files exist for the time which the vote was stored. Do they look suspect?

## Common Questions

### This isn't secure

Yes, it isn't. But in the combined networking and Neos setup with all of our logging and management policies in process we can validate reasonably that each vote is valid. I don't recommend using this without consulting directly with me. Full audits were performed on the results file before results were announced.

### This stores private data about me, how can i remove my data ?

Everything stored is a public value that's available to anyone in the world either in your Neos sessions or via the Neos API. No personal identifiers are stored, No IP Addresses are stored. However if you still want your data gone please contact the manager of your competition. This is just the source code which CAN run competitions, it doesn't actually run any.

### I have a suggestion or question, what do i do?

Contact Prime on the discord on open an issue here

### I want to improve this, Can i?

Sure Fork it and have fun, or submit PRs i'll review them and merge them if they are reasonable and clear

### Can you help me set this up/run a competition for me?

Simple questions are fine yes, if you want a more comprehensive implementation or management please reach out to Prime who can discuss your options. You're still free to use this by yourself however you'd like.

### Can I block entries from voting?

Yes!, Add the entries vote targget(usually the world id) to the "blocked" array in the config file.
