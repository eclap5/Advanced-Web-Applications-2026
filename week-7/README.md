# Authentication and Authorization in Deno
In this week, we will learn how to implement authentication and authorization in Deno. We will use JSON Web Tokens (JWT) for authentication and browser local storage for storing the JWT on the client side.
We will use the `npm:jose` library for creating and verifying JWTs, and `jsr:@felix/bcrypt` for hashing passwords. We will also use `jsr:@db/postgres` for database interactions.

It is advisable to clarify that even though Deno's standard library provides extensive crypto functionality, it is not powerful enough to be used in password hashing and JWT signing. Therefore, we will use the `jose` library for JWT handling and `bcrypt` for password hashing.
