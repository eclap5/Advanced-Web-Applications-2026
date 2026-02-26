# Week 3: Introduction to React with Deno and TypeScript
Week 3 will introduce React with TypeScript and Deno. Will cover the most basic concepts of React.

Note that while this course is implemented with Deno, Vite, that is used as build tool for React, is running on Node.js. You don't need to install Node.js but Deno will integrate to Vite and Node ecosystem to bridge configuration gap.

# Walkthrough
1. Initialize a new project with `deno init --npm vite` the initialization project will ask for a template, language and some permissions. Select `react` and `typescript` and allow permissions needed.
2. It is important to notice that while the project structure is Node.js based, it can be fully interacted through Deno. Deno will understand the package.json and will be able to run the scripts defined there. Deno will create an independent `deno.lock` file to manage dependencies and will not interfere with the `package-lock.json` created by npm.
3. Run the development server with `deno task dev` and open the browser to `http://localhost:5173` to see the React application running.
4. We can delete `Assets` folder and `App.css`. Additionally, we can clear the content of `App.tsx` and `index.css` to start with a clean slate. We can also change the title of the page in `index.html` to "Habit Tracker".
5. First implement `App.tsx` without the `HabitList` component, progress bar and `addHabit` function just to have a basic structure of the application.
6. Then implement the `HabitItem` and `HabitList` components.
7. Finally, implement the `addHabit` function to complete the application.

8. OPTIONAL: If seen fit, we can also implement the progress bar to demonstrate `useMemo` hook and how to optimize performance in React applications. However, this is not necessarily needed in this week as `useEffect` and other hooks will be covered in later weeks.

9. If progress bar is not implemented, remove `useMemo` hook and leave only the calculation of `completedCount` and `percentage` in the main body of the component. Remove also the progress bar styling and the display of the percentage in the UI. 