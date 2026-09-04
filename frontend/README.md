# OpenTech Storefront

continue building this 

initial prompt https://lovable.dev/projects/a04a8ddb-cb9a-49cd-9ff6-4f4983d72c11?messageId=main%3Aagent%2300000000000001%23usr%3AZSYTIIHF
this is opentech website currently we have created the boilerplate folder structure , i want you to help me create the pages and the ui , first the landing page should be the store landing page , and also use .jsx not tsx , and also make your code good for human to modify , use less credit , dont over engineer or add more features , check the api doc it should match the api doc i mean the data , and also create a mock data for testing in the in utils so that whenn page open it fectch api and if fail it load from mock data the structure should be same so we can easily integrate backend , use shimmer loader effect , make it exactly what u see , use font aawesome , consistent font styling and colors , start right away by creating the landing page generated images , then after create other pages too , dont generate all images for products etc u can seach image onlie and put url , for logo and somethings that dotn change gernate iamges , use tsx and current react tech stack , u are to genrate frontend code so not backend the order should be ( genreate landing page as opnetech store landing page then footer for it as opentech footer page , then create academy page as academy main page , then create store page as image.pnng , then create store cart page , then cpmpany page , dont wait to finish all before display


I've set up the OpenTech design system (black/gold tokens, Plus Jakarta Sans, Font Awesome, shimmer utility), the logo/favicon and hero images, the mock-data + API-fallback layer in `src/utils/`, shared Header/Footer/ProductCard/CourseCard/Shimmer components, and the store landing page at `/` plus a contact page.

Remaining to finish (they're the source of the current typecheck errors, since links point at pages not created yet):

- `src/routes/academy.tsx` — Academy main page

- `src/routes/store.tsx` — Store listing page with categories/filters

- `src/routes/cart.tsx` — Cart page with order summary

- `src/routes/company.tsx` — Company/services page

https://github.com/SadiqDev-stack/opentech-storefront



now landing page is done so make other ultra resembling pages base on the uploaded images , use old tech stack and implementation

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8026915e-0d6b-4fb5-be81-03cf45b54c17).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
