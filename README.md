Magic table!

## Running magic table locally

Magic table has two parts:

- The backend, which is all based on firebase. As of
right now we only use firestore for persistence, and auth for user
authentication integration.

- The frontend, which is a react based app!

To run the magic table in your local dev, you need to first start the
emulators.  Open up a shell in the top level project dir and run:
```
npm start
```

In a second shell, start the UI:
```
cd web-client
npm start
```

Now you should have an app running locally, which you can see at
http://localhost:3000/

NOTE: We are going to be adding a better way to start/stop both of these
services so that you don't have to worry about starting them in the right
sequence and figuring out how to stop them correctly.

## Local Dev

We use firebase so in local dev we use the emulators that firebase provides.
You can see get an overview about it here https://firebase.google.com/docs/emulator-suite

### firestore rules (permissions)

It is important that firestore.rules are configured correctly, and ultimately
match prod.  If rules are not configured correctly, then you will get:
```
Error: {"code":"permission-denied","name":"FirebaseError"}
```

Localdev and test only!!  If you are having a hard time with permissions, you
can open everything up to test local changes with:
```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

But that is absolutely not safe to do in prod, and at the end of the day you
will want to write the correct rule that we can deploy to prod.

### Emulators

We use emulators so that we can safely make changes and not worry about
breaking prod or worse, leak sensitive information out.

For details about setup and such:
https://firebase.google.com/docs/emulator-suite/install_and_configure

Running emulators URL
http://127.0.0.1:4000/

Firebase sample code:
We are using the web modular SDK, so you will want to make sure to find
examples for those. The API isn't quite compatible with the Admin SDK, which
looks like it could be the web modular SDK.

https://github.com/firebase/snippets-web
