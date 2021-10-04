# Neos Voting Server

This is my voting server for Neos and the Metaverse Maker Competition which ran in September 2020. In this competition we wanted to allow the Neos community to vote for worlds within neos. This required a lot of work both inside Neos and outside of it so this is only half of the equation. More information is due to follow at a later date including a walk through of how the systems work.

There's a brief functional overview here: https://youtu.be/K6kZ6PZabpQ a more technical one will follow soon.

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

## Logging

Logs are stored in logs/. A new file is made every hour(this should be each day but i don't know how right now). Logs contain a lot of information. Read them. Everything is automatic.

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

Yes!, Add the entries vote target(usually the world id) to the "blocked" array in the config file.

### How many Mugs were harmed in the making of this?

One :'(
