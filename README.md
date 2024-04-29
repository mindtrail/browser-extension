This is a [Plasmo extension](https://docs.plasmo.com/) project bootstrapped with [`plasmo init`](https://www.npmjs.com/package/plasmo).

## Getting Started

First install the dependencies:

```bash
pnpm install
# or
npm install

```

Then, run the development server:

```bash
pnpm dev
# or
npm run dev
```

Open your browser and load the appropriate development build.
Found in `build/chrome-mv3-dev`

More details on how to load the unpacked extension can be found [here](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked).

You can start editing the popup by modifying `popup.tsx`. It should auto-update as you make changes. To add an options page, simply add a `options.tsx` file to the root of the project, with a react component default exported. Likewise to add a content page, add a `content.ts` file to the root of the project, importing some module and do some logic, then reload the extension on your browser.

For further guidance, [visit our Documentation](https://docs.plasmo.com/)

## Supabase

```
supabase init
supabase link
supabase db pull
supabase migration up (Apply pending migrations to local database)
supabase status (Show keys and urls for the local supabase project)
```

```
Supabase Studio URL: http://127.0.0.1:54323

PLASMO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
PLASMO_PUBLIC_SUPABASE_KEY=
```

## Making production build

Run the following:

```bash
pnpm build
# or
npm run build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.

## Submit to the webstores

The easiest way to deploy your Plasmo extension is to use the built-in [bpp](https://bpp.browser.market) GitHub action. Prior to using this action however, make sure to build your extension and upload the first version to the store to establish the basic credentials. Then, simply follow [this setup instruction](https://docs.plasmo.com/framework/workflows/submit) and you should be on your way for automated submission!
