# Deno Setup Guide
1. Install Deno following the instructions at https://docs.deno.com/runtime/.
2. Add Deno to your system PATH if it is not already added.
3. Check the installation by running `deno --version` in your terminal.
4. Add official Deno extension to VSCode.
5. Init new project with `deno init week_1`.

# Week 1 Walkthrough
1. create under `src` a file `task.ts`. This file will be used for introducing type and interface definitions in TypeScript.
2. Create under `src` a file `response.ts`. This file will be used for introducing generic types and API response structure.
3. Create under `src` a file `main.ts`. This file will be used for introducing basic server setup and request handling in Deno.
4. Update `deno.json` to include a development task that runs the server with watch mode enabled. The `--allow-net` flag is necessary to allow the server to listen for network requests. This will be introduced in more detail on later weeks. The `--watch` flag allows the server to automatically restart when changes are made to the source files, which is useful for development.
5. Run the server using `deno task dev`. Endpoint can be tested through browser or using tools like Postman or Bruno.

