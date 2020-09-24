import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import mikroConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { Post } from "./entities/Post";

const main = async () => {
   const orm = await MikroORM.init(mikroConfig);
   await orm.getMigrator().up();
   // const post = orm.em.create(Post, { title: "my first post" });
   // await orm.em.persistAndFlush(post);

   // a native insert doesn't actually create a class Post. this results in error, but for other projects nativeInsert is an option
   // await orm.em.nativeInsert(Post, { title: "my first post 2" });

   // const posts = await orm.em.find(Post, {});
   // console.log(posts);
   const app = express();
   // rest endpoint
   //    app.get("/", (_, res) => {
   //       res.send("hello");
   //    });

   // we want graphql server
   const apolloServer = new ApolloServer({
      schema: await buildSchema({
         resolvers: [HelloResolver, PostResolver],
         validate: false,
      }),
      context: () => ({ em: orm.em }),
   });

   apolloServer.applyMiddleware({ app });

   app.listen(4000, () => {
      console.log("server started on localhost:4000");
   });
};

main().catch((err) => {
   console.error(err);
});
