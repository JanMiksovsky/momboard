# Momboard

This repository contains the source code for the web-powered e-ink display project I describe in this post: [MomBoard: E-ink display for a parent with amnesia](https://jan.miksovsky.com/posts/2024/11-12-momboard). People caring for family members in similar situations asked me to share the source code, so here it is.

This is not a product, but the possible basis for a do-it-yourself project. Doing that requires some familiarity with programming and web technologies. Depending upon interest, I might be able to reduce those hurdles a bit, but this is just a small side project of mine.

If you are thinking of using this project, please read the final section on "Respectful open source participation".

# Overview

The MomBoard has several separate pieces:

1. A general purpose display with a web browser configured to open the web app.
2. The web app. Part of it appears on the display; part of it is used by family members to post messages.
3. A storage service to store messages.

# Hardware

I designed this app to work on a dedicated display with a contemporary web browser. In 2022, I chose the Boox Note Air2 e-ink display; there are likely better displays available now.

Since my target device was monochrome, I opted to force the styling of the Board page (below) to use monochrome as well. This let me more accurately preview how color emoji will appear on the e-ink display. If you're going to use a color display, you can turn off that monochrome styling: in `public/board.html`, remove the CSS line that reads `filter: grayscale(1);`.

# MomBoard app

The app in this project has three main pages:

- Home page: `public/index.html`. A home page that serves as a frame of the Board page. The home page has no visible elements itself, and is quite general; you may be able to use it as is. It forces a refresh of the inner Board page every hour.
- Board page: `public/board.html`. This reads messages/notes from the storage service and displays the four most recent ones at a time. It checks the storage service for new updates every 5 minutes.
- The Compose / Edit page: `public/edit/index.html`. This is a separate web page; you'll eventually want to give its public URL to family members who are going to post updates. The page includes a link to the Board page so that everyone can see what's currently on the board. If someone opens the page on their browser and selects their name, their name will be added to the end of the URL; they can then save that page (e.g., on their phone's home screen) so that it will open directly to the page with their name preselected.

The specifics of my own family situation dictated many aspects of the design. For example, this app includes the name "MomBoard" in multiple places. If you want to change that, you'll need to find/replace all occurrences of that name.

## Development

To run this app locally, you'll need to start a local web server and serve the project's `public` folder. Any web server should do. E.g., if you're a JavaScript programmer and have Node.js installed, you can run `npx http-server` from the `public` folder.

You should be able to open the web app pages in any modern browser. I believe the Boox devices use "NeoBrowser", a modified version of Chromium, so if you're targeting a Boox device, test your work on Chrome. If it works in Chrome it will probably work on the device.

If you use a mouse to resize a browser window with the Board page open, you may see flickering as the text auto-sizing feature tries to cope with the new window size. It's possible to confuse it and end up with the text at a smaller size than necessary; hitting Refresh should fix the text size. This is generally not an issue when running the web app on an e-ink display where the size doesn't quickly change at small increments.

If you want to inspect the running web page in the browser's debugging tools, it can be helpful to disable the hourly reload and 5-minute refresh of the Board page:

- To work on the home page, add `?noReload` to the URL to suppress reload and refresh.
- To work on the board page, add `?noRefresh` to the URL to suppress refresh.

I tried to avoid JavaScript frameworks and libraries for this project to keep it minimal and hopefully reliable. To deal with data and page state, both the `board.js` and `edit.js` pages use a copy of the minimalist [update-state](https://github.com/JanMiksovsky/update-state) state engine I created for projects like this. This gives me 90% of what I like about reactive programming models like React for %0.1 of the cost.

# Storage service

The MomBoard web app stores messages in [JsonStorage.net](https://www.jsonstorage.net). This is a very basic service that stores a blob of data as an object that can be read or written via JSON.

The service has a free tier that can be used indefinitely for small workloads like the MomBoard app. I find the service useful and want to support it so I pay for a basic plan.

If you want to use a different storage service, update `dataFetch.js` to return an object that looks like the JSON one shown below (the object with `"updates"`). Depending on the service, you may also need to update the `save()` function in `public/edit/edit.js`.

If you want to use JsonStorage, you will need to get three IDs/secrets from the JsonStorage service.

- API key
- Item ID
- User ID

These are all strings of letters, numbers, and hyphens.

As written, this project does not authenticate users. It requires that the IDs/secrets be made available to the web app in a plain JavaScript file called `secrets.js`. This is not very secure — anyone with access to your deployed website will have write access, so only give that URL to the family members who will be posting messages.

(If you know how to set environment variables on your server, save the secrets in environment variables and use a server-side build script to write those out as `secrets.js` there. You can use the script in `build.sh` to do that.)

1. Verify that your copy of the project is private. On GitHub, check the "Repository visibility" section of `https://github.com/<your user name>/<your project name>/settings`.
2. Create a file in the project's root folder called `.env`. This project's `.gitignore` file will exclude the `.env` file from source control.
3. Paste the following into `.env`:

```
JSON_STORAGE_API_KEY=
JSON_STORAGE_ITEM_ID=
JSON_STORAGE_USER_ID=
```

To get an API Key:

1. Open the app console at https://app.jsonstorage.net.
2. Click "Api Keys", then "Create".
3. Give the API key a name. For permissions, check Read and Modify.
4. Copy the API key from that page. It will look something like `ab1fcde23-f45g-6789-0123-h45i67jkl89m`.
5. Paste the API key into the `.env` file after `JSON_STORAGE_API_KEY=`
6. Click Save.

For the user ID and item ID:

1. In the same app console, click "Items", then "Create".
2. GIve the item a name ("MomBoard"), this is just to help remember what that item will store.
3. Leave the "Item Type" as "Content".
4. In the "Content" field, paste the following data as a template:

```json
{
  "updates": {
    "Alice": {
      "message": "Here's a message from Alice."
    },
    "Bob": {
      "message": "Here's a message from Bob."
    },
    "Carol": {
      "message": "Here's a message from Carol."
    },
    "(Upcoming)": {
      "message": "**Upcoming**\nPut upcoming events here"
    },
    "(Notes)": {
      "message": "**Notes**\nPut other stuff here"
    }
  }
}
```

5. Edit the names ("Alice", etc.). Get rid of any sections you don't want, or add new ones. (Only the 4 most recent of these will be shown at a time.) The names in parentheses will appear as general notes without a name beside them.
6. Leave the "Public" option on if you like (it makes testing easier), or turn it off to minimize the chance an outsider would be able to read your messages.
7. Click "Save".

The page will update to show a "Get JSON" URL, which will look like:

```
https://api.jsonstorage.net/v1/json/123ab45c-de78-89fg-h01i-j23456789k0l/2m345no6-p789-0q12-3rst-45u678901v2w?apiKey=%your api key%
```

The first chunk of letters/numbers/hyphens in this URL is your user ID (here, `123ab45c-de78-89fg-h01i-j23456789k0l`). The second chunk (here, `2m345no6-p789-0q12-3rst-45u678901v2w`) is the item ID.

8. Copy the item ID and paste it into `.env` after `JSON_STORAGE_ITEM_ID=`
9. Copy the user ID and paste it into `.env` after `JSON_STORAGE_USER_ID=`
10. Save the `.env` file. It should now look something like:

```
JSON_STORAGE_API_KEY=ab1fcde23-f45g-6789-0123-h45i67jkl89m
JSON_STORAGE_ITEM_ID=2m345no6-p789-0q12-3rst-45u678901v2w
JSON_STORAGE_USER_ID=123ab45c-de78-89fg-h01i-j23456789k0l
```

11. In the terminal, run the `build.sh` script to generate a local copy of `secrets.js`:

```console
$ ./build.sh
```

Alternatively, if you can't run a `.sh` shell script, you can manually create a local copy of `secrets.js` using the same secrets as `.env`. The file should look like:

```js
/* App secrets */
export const apiKey = "ab1fcde23-f45g-6789-0123-h45i67jkl89m";
export const itemId = "2m345no6-p789-0q12-3rst-45u678901v2w";
export const userId = "123ab45c-de78-89fg-h01i-j23456789k0l";
```

# Deploying

Once you've arranged for some storage service (JsonStorage or something you set up yourself), you'll need to deploy the web app on a public web server. The web app itself is only static HTML, CSS, and JavaScript files, so there are many places you could do that.

You will need to arrange for a copy of `secrets.js` to be created on the server. Depending on your web server, you may be able to copy your local copy of `secrets.js` up to the server. Alternatively, you set environment variables on the server and then arrange to run the `build.sh` script on the server to generate `secrets.js` there.

After you've confirmed that your deployed web app works as expected, you can try browsing to it on the hardware device.

Assuming the web page looks as you expect, you'll probably want to arrange to have the device automatically open that page on startup. For the Boox Note Air2 device, this entails two steps:

1. **Save the page as a web app.** In the browser, open the menu of commands (the menu button may have a ☰ icon) and select "Add to Home screen". This will add the page to your device's home screen as an application.
2. **Arrange to have the web app launched at device startup.** This was straightforward in 2023 but, as of January 2025, Boox appears to have changed their UI and I can't figure out how to do this anymore. I believe the general area you want is to open Apps, then click the ☰ button for a menu of options. Pick "App Management" and then "Auto-Start Settings". I believe that screen used to let you specify that you want to run your web app on startup, but for me it now shows a blank screen.

# Adapting

Given the highly personal nature of this project, this is closer to a recipe for a home-cooked meal than a finished product.

If there's interest I could try to further separate the general from the personal, but it's a little hard to see how to best separate the things I need from what others need. As mentioned in the blog post at the top, by design I tried to avoid the use of any external dependencies to minimize the chance for unexpected failures that I couldn't debug remotely. But to the extent this app gets generalized and shared, it becomes a potentially fallible dependency for everyone using it.

In the spirit of treating this like a recipe, it might be productive to think about sharing the modifications you made to the recipe — things you did to adapt the project to your own needs, improvements you made that you think other people might want to try, etc. If there's substantial interest in that I can try to find an appropriate forum; perhaps a wiki on this repository would suffice.

# Respectful open source participation

Open source projects are messy interpersonal endeavors with the extra challenge of incorporating participants who are often complete strangers. Sadly, it's common among open source projects to see a great deal of terrible interpersonal behavior. None of us should have to accept that.

So to be clear up front, here is the relationship I expect to have with anyone who wants to participate in this project in any way.

- Before we know each other, you and I owe each other _nothing_ beyond the basic politeness and respect we owe everyone.
- I've made this project's source code available in case it helps people, but I'm not a free resource that exists to serve your needs.
- I have my own goals, and they are almost certainly at least a little different than yours. To the extent our goals align, we may both benefit; if not, you don't need to use this.
- What I get out of our relationship: a sense of having helped people, maaaaaybe some idea or bug fix that I'll find useful.
- What you get out of our relationship: a headstart on your own project, without which you might not be able to meet your goals. You may also receive some assistance from me if I can afford it. If you contribute something back, you can get the same sense of having helped people that I get.
- I will strive to treat you, a complete stranger, with respect.
- In return, you have to treat me and my time with respect.
- Bugs are a lousy way to say hello. If you investigate this project and decide to make use of it, please [contact me](https://jan.miksovsky.com/contact.html) and say hello before filing a bug, pull request, etc. I would enjoy hearing about how you are using (or intend to use) this project.
- If you file a bug and it sounds like a complaint to me, you're just going to make me feel bad. I will probably close the bug; no one deserves that kind of grief from strangers.
- If you file a suggestion, please understand that it is likely harder to implement than you believe, or may conflict with my goals even if it advances yours. I may have my own reasons for not taking the suggestion.
- If you file a pull request, I will do my best to assess it and, if it aligns with my own goals, accept it. The amount of time you invest in an unsolicited pull request does not determine whether I will accept it. Before investing significant time on a pull request, it's reasonable to check first whether it's likely to be accepted.
- Your crisis is not my emergency. If you file a bug or pull request and I can't get to it as fast as you want — or possibly ever — that's obviously disappointing but not justification for complaint.
- This is open source. At any point you're free to fork this project, walk away, and do what you want with it (subject to the [license](LICENSE)). Or use something else. No one is making you use this.

If you can't accept this relationship, please don't use this project.
