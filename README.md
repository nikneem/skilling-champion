# Skilling Champion Creator ID Verifier

This project is created for all who write markdown files and want to add their Creator ID to the URLs. This project is primarily created in order to learn how to create Visual Studio Code extensions, but also to actually add value.

There are three milestones:

- Be able to detect links to Microsoft website in Markdown that do not have a Creator ID
- Automatically add the Creator ID on click
- Be able to save your Creator ID in settings

# Targets

Links to the folowing website should contain a Creator ID:

- social.technet.microsoft.com
- azure.microsoft.com
- techcommunity.microsoft.com
- social.msdn.microsoft.com
- devblogs.microsoft.com
- developer.microsoft.com
- channel9.msdn.com
- gallery.technet.microsoft.com
- cloudblogs.microsoft.com
- technet.microsoft.com
- docs.azure.cn
- www.azure.cn
- msdn.microsoft.com
- blogs.msdn.microsoft.com
- blogs.technet.microsoft.com
- microsoft.com/handsonlabs

A creator ID is basically adding a querystring parameter with the name `WT.mc_id` and a value (the Creator ID, that looks like `{XX}-{YYY}-{ZZZZZZZZ}` where XX is the technology area you are recognized for. YYY is the type of award you received, for example MVP. ZZZ Is your unique identification number)
