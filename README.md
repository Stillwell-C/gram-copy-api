# Gram Copy

This repository is the backend for Gram Copy, a MERN stack social media application inspired heavily by Instagram.

I made this while following the NodeJS course from [The Odin Project's](https://www.theodinproject.com/) curriculum.

## Demo

The application is live at https://gram-copy.vercel.app/

## Backend code

View the frontend code [here](https://github.com/Stillwell-C/gram-copy)

Or the API's landing page [here](https://gram-copy-api-production.up.railway.app)

## Description

### Overview

- Built using MERN stack / REST API
- Reponsive, mobile-first UI
- Toggleable dark and light mode
- Authentication with JWT refresh & access tokens
- Create/edit/delete user accounts
- Create/edit/delete posts
- Tag users in your own posts
- Like or Save posts
- Comment on posts
- Follow other users to see their posts in your feed
- Add @ to link to users or # to link to hashtag
- Seach users
- View posts from specific locations
- Get notifications for new followers, comments, and likes
- A11y accessibility (to the best of my ability)

### Detailed Description

This application was made to clone most of Instagram's basic functionality.

#### UI

The UI was made to be responsive with a mobile-first design and should function on both mobile devices and web browsers with larger screens. SCSS was used to style most components.

There is a dark and light mode that can be toggled through the navigation menu. A user's preference will be stored in local storage for the next time they visit the site. If there is no user preference is already stored in local storage, the initial theme will be set using the user's preferred color theme in their browser if present. If there is no preferred theme in their browser or theme in local storage, it will default to the light color theme.

#### API & Authentication

Users can create an account and sign in using their email or username and a password. Passwords are encrypted/decrypted and verified using the [bcrypt](https://www.npmjs.com/package/bcrypt) package.

Users are limited to 5 attempts with a incorrect passwords in a 3 hour span before being locked out for 15 minutes. This is implemented using the [rate-limiter-flexible](https://www.npmjs.com/package/rate-limiter-flexible/v/0.9.2) package and a MongoDB collection.

Authentication is handled with a JWT refresh token stored in an HTTP only secure cookie and a separate JWT access token stored in a redux store with a 15-minute expiration.

If a user is logged in and does not have a JWT access token (e.g. the user has refreshed their page) or has sent a request to the sever that has been rejected due to an expired access token, the front end will automatically access the API's and save the access token received before reattempting the user's initial request.

Specific routes require a valid JWT access token to access. JWT verification is done using the [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) package. Anytime a user's ID is used on the backend (e.g. requesting a user's feed, updating data, etc.), this is supplied by the decoded access token.

Axios and Tanstack Query are used to make server requests and store/cache/invalidate data with the exception of the access token that is stored in the redux store.

The [cors](https://www.npmjs.com/package/cors) package is used to only allow requests from specific origins. In this case, I am only allowing requests originating from the frontend.

#### Users, Posts, Follows, and Notifications

Users can create and edit their own posts (posts must include an image) and can tag up to 20 users on each post. Any logged in user can like, save, and comment on posts. Saved posts can be viewed on your own account on the "saved" tab (this is only visible to you) and images a user is tagged in can be viewed through the "tagged" tab of their profile.

Users can edit all profile information including their username and profile image (however, not to the same username or email as another user). They may also delete accounts by entering their correct password (rate-limiter-flexible is also used here to lock after 5 attempts with an incorrect password). This action will also delete all the user's posts as well as all of the follows associated with thier account (i.e. if you follow a user who then deletes their account, the number of users you are following should decrease by 1). I do, however, see this as an area of the API with potential performance or other unintended consequences and hope to continue to refine this process. Comments and notifications from a deleted user will still be visible, however, the name will be changed to Deleted User and no link will be provided to their account.

Visit a user's profile to see their posts, posts they are tagged in, user information, the users following them, and the users they follow.

Add a hashtag or at sign in front of text (comments, bio, etc.) to link to a hashtag search or a user's profile. Clicking on text starting with an @ symbol with link you to the user's profile page. Clicking on text starting with a # symbol will link you to posts where the user has used the hashtag in their initial comment.

The locations displayed on each image can be clicked to search for other posts from the same location.

Follow other users to see their posts in your feed or go to the [explore page](https://gram-copy.vercel.app/explore) to see posts from all users. All posts are shown in order of the date they were created.

Users can be searched through the searchbar in the navigation menu.

Click on the three dot icon of a post or user profile to see additional options such as copying a post's URL, editing post information (if you are the post's author), or reporting a post or user.

Click on the notifications tab to see notifications for any time another user follows your account or likes or comments on one of your posts.

#### Accessibility

Throughout this project, I have tried to make this website accessible to screen readers, especially with respect to forms, error messages, and modals. However, any input on how to improve on this is greatly appreciated. I am sure there are instances where I have misued or neglected to properly implement ARIA.

Users are able to add custom alt text for the images in their posts.

The [focus-trap-react](https://www.npmjs.com/package/focus-trap-react) package is used to trap focus when a modal is present on the screen. All modals can be exited using the escape key.

#### Additional Info

Chatting was implemented on an earlier version of this website with a firebase backend, and I plan to update this to work on my own backend in the future.

Almost all text content (profiles, comments, post information, etc.) was generated using ChatGPT. Post information, hashtags, location, etc. does not match images in most cases. The number of locations and hashtags for the initial post data was intentionally limited to better demonstrate how these features can be used.

All images were found on [unsplash](https://unsplash.com/). Profiles and posts with the initial data (any that has been created by me) do not and are not meant to reflect the original image posters.

## Known Issues

### Authentication

- Persisting user login was originally done using a cookie to show that a user was logged in (as the access token can easily be deleted by refreshing the browser). However, possibly due to Vercel being on the [public suffix list](https://publicsuffix.org/), I could not access this cookie once the site was live. To remedy this, a single item called "loggedIn" is set in local storage upon log in. The code utilizing a cookie was not deleted from the front or back end, and either a cookie or local storage item can be used for this functionality. No JWT (access or refresh token) is stored in local storage at any time. Logging out will remove the loggedIn cookie (if present) and set the "loggedIn" item to false.

- The frontend is hosted on [Vercel](https://vercel.com/) and the backend is hosted on [Railway](https://railway.app/). Resultingly, the refresh token stored in an HTTP only secure cookie is a cross-site cookie and does not function properly on some browsers, particularly some incognito or private browser windows such as Chrome and Opera. Refreshing the page will log you out on these browsers in incognito windows.

## Built with

### Frontend

- ReactJS
- Redux
- Axios
- Tanstack-Query
- SASS

### Backend

- NodeJS
- ExpressJS
- MongoDB/Mongoose
- Bcrypt
- Cloudinary (image storage)
