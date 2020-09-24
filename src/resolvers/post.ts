import { Resolver, Query, Ctx, Arg, Mutation } from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "../types";

@Resolver()
export class PostResolver {
   /* GET ALL POSTS */
   @Query(() => [Post])
   posts(@Ctx() { em }: MyContext): Promise<Post[]> {
      return em.find(Post, {});
   }

   /* GET POST BY ID */
   // typescript type Post or null (nullable is typescript option)
   @Query(() => Post, { nullable: true })
   post(
      // argument and options
      // "id" is a name, used to control what we specify in graphql
      @Arg("id")
      id: number,
      @Ctx() { em }: MyContext
   ): Promise<Post | null> {
      return em.findOne(Post, { id });
   }

   /* CREATE POST */
   // Queries are for getting data
   // Mutations is for updating, inserting, deleting (any change to server)
   // null is never really returned from creating a post so we don't have to pass in the type here
   @Mutation(() => Post)
   async createPost(
      // sometimes graphql can infer types based on typescript types so we don't always have to explicitly state type within graphql queries/mutations
      @Arg("title") title: string,
      @Ctx() { em }: MyContext
   ): Promise<Post> {
      const post = em.create(Post, { title });
      await em.persistAndFlush(post);
      return post;
   }

   /* UPDATE POST */
   @Mutation(() => Post, { nullable: true })
   async updatePost(
      // need two arguments, id and the new title
      // if there was multiple updatable fields, the nullable would allow title to be optional
      // must explicitly state optional fields
      @Arg("id") id: number,
      @Arg("title", () => String, { nullable: true }) title: string,
      @Ctx() { em }: MyContext
   ): Promise<Post | null> {
      const post = await em.findOne(Post, { id });
      // if we don't find a post, return null
      if (!post) {
         return null;
      }
      // if the title type is not undefined, update the title by persistAndFlush()
      if (typeof title !== "undefined") {
         post.title = title;
         await em.persistAndFlush(post);
      }
      // return the updated post
      return post;
   }

   /* DELETE POST */
   // delete post by id, return a boolean instead of returning the deleted post
   @Mutation(() => Boolean)
   async deletePost(
      @Arg("id") id: number,
      @Ctx() { em }: MyContext
   ): Promise<boolean> {
      try {
         // native delete bc we don't really need to fetch it for anything
         await em.nativeDelete(Post, { id });
      } catch {
         return false;
      }
      return true;
   }
}
